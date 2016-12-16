class imagoModel extends Provider

  constructor: ->

    sortWorker = 'sort.worker.js'
    host       = 'https://api.imago.io'
    nextClient = 'public'
    indexRange = 10000

    config =
      updatePageTitle: true

    @setSortWorker = (value) ->
      sortWorker = value

    @setIndexRange = (value) ->
      indexRange = value

    @getHost = ->
      host

    @setHost = (value) ->
      host = value

    @setClient = (value) ->
      nextClient = value

    @getDefaults = ->
      results

    @setDefaults = (value) ->
      throw 'defaults needs to be an object' if !_.isPlainObject value
      _.assign config, value

    @$get = ($rootScope, $http, $location, $document, $window, $q, imagoUtils, imagoWorker) ->

      $http.defaults.headers.common['NexClient'] = nextClient

      return {
        host       : host
        sortWorker : sortWorker
        indexRange : indexRange
        nextClient : nextClient

        assets :
          get: (id) ->
            $http.get "#{host}/api/assets/#{id}"

          create: (assets) ->
            promises = []
            list = _.chunk(assets, 25)
            for request in list
              promises.push $http.post("#{host}/api/assets", request).then (response) ->
                return response.data.data
            return $q.all(promises).then (response) ->
              return _.flatten(response)

          update: (item) ->
            $http.put "#{host}/api/assets/#{item._id}", item

          delete: (id) ->
            $http.delete "#{host}/api/assets/#{id}"

          trash: (assets) ->
            $http.post "#{host}/api/assets/trash", assets

          move: (items, src, dest) ->
            data =
              src   : src
              dest  : dest
              items : items

            $http.post "#{host}/api/assets/move", data

          copy: (items, src, dest) ->
            data =
              src   : src
              dest  : dest
              items : items

            $http.post "#{host}/api/assets/copy", data

          batch: (list) ->
            # abort save and show reloaod modal, if we find an asset without types
            for item in list
              unless item.types?.length
                $window.trackJs?.track("Tried to save without types - data: #{JSON.stringify(item)}")
                $rootScope.generalError = true
                return

            promises = []
            list = _.chunk(list, 100)
            for request in list
              promises.push $http.put "#{host}/api/assets/update", {assets: request}
            return $q.all(promises)

          download: (ids, res) ->
            $http.post "#{host}/api/assets/download", {assets: ids, resolution: res}

          pdfRequest: (data) ->
            $http.post "#{host}/api/assets/pdf", data

          spreadRequest: (data) ->
            $http.post "#{host}/api/assets/spread", data

          transformRequest: (data) ->
            $http.post "#{host}/api/assets/transform", data

          repair: (id) ->
            $window.trackJs?.track("Repair assets order - id: #{id}")
            $http.put "#{host}/api/assets/repairorder", {_id: id}

        data: []

        currentCollection: undefined

        search: (query) ->
          # console.log 'search...', query
          params = _.map query, @formatQuery
          # console.log 'params', params
          return $q.resolve() unless params.length
          return $http.post("#{host}/api/search", angular.toJson(params))

        getLocalData: (query, options = {}) ->
          return $q (resolve, reject) =>
            for key, value of options
              if key is 'localData' and value is false
                return reject query

            for key, value of query

              if key in ['fts', 'page', 'pagesize']
                return reject query

              else if key is 'collection'
                query = imagoUtils.renameKey('collection', 'path', query)
                path = value

              else if key is 'kind'
                query = imagoUtils.renameKey('kind', 'type', query)

              else if key is 'metakind'
                query = imagoUtils.renameKey('metakind', 'type', query)

              else if key is 'path'
                # console.log 'value', key, value
                path = value

            if path?.slice(-1) is '/' and path.length > 1
              path = path.substring(0, path.length - 1)

            return reject query if !path

            localQuery =
              'path' : if _.isString path then path else _.head(path)

            asset = @find(localQuery)

            return reject query if !asset

            asset.assets = @findChildren(asset)

            if (asset.count or asset.assets.length) or !asset.count

              if asset.assets.length isnt asset.count or !asset.count
                # console.log "count not same as assets.length - go to server", asset.count, asset.assets.length
                return reject query

              else
                if query.recursive
                  # console.log 'recursive', asset.assets.length, asset.count
                  for item in asset.assets
                    return reject query if item.assets.length isnt item.count

                asset.assets = @filterAssets(asset.assets, query)
                return resolve asset

            else
              # console.log 'asset found asset has no children', asset
              return resolve asset

        getData: (query, options = {}) ->
          return $q (resolve, reject) =>
            query = angular.copy query

            query = $location.path() unless query
            if _.isString query
              query =
                [path: query]

            query = imagoUtils.toArray query

            promises = []

            makeQueryPromise = (value) =>
              return $q (resolveQueryPromise, rejectQueryPromise) =>
                @getLocalData(value, options).then (result) =>

                  if result.assets
                    worker =
                      assets :  result.assets
                      order  :  result.sortorder
                      path   :  sortWorker

                    imagoWorker.work(worker).then (response) =>
                        result.assets = response.assets
                        resolveQueryPromise(result)

                  else
                    resolveQueryPromise(result)

                , (rejection) =>
                  @search([rejection]).then (response) =>
                    # console.log('not in the model. fetching...', rejected) if rejected?.length
                    return unless response?.data
                    for res in response.data
                      resolveQueryPromise(@create(res))

                  , (err) ->
                    rejectQueryPromise()
                    if err.status is 401
                      console.warn 'Imago API warning:', err.data

            _.forEach query, (value) =>
              promises.push makeQueryPromise(value)

            $q.all(promises).then (response) ->
              response = _.flatten response
              if options.updatePageTitle or (config.updatePageTitle and _.isUndefined(options.updatePageTitle))
                if options.title
                  $document.prop 'title', options.title
                else if response.length is 1 and response[0].fields?.title?.value
                  $document.prop 'title', response[0].fields.title.value
                else if response.length is 1 and response[0].name
                  $document.prop 'title', response[0].name

              return resolve response

        formatQuery: (query) ->
          querydict = {}
          if _.isArray query
            for elem in query
              for key of elem
                value = elem[key]
                querydict[key] or= []
                querydict[key].push(value)
          else if _.isPlainObject query
            for key of query
              value = query[key]
              querydict[key] = if angular.isArray(value) then value else [value]

          else if _.isString query
            querydict['path'] = [query]

          for key in ['page', 'pagesize']
            if querydict.hasOwnProperty(key)
              querydict[key] = querydict[key][0]
          querydict

        addAsset: (asset) ->
          @data.push(asset) unless @find('_id': asset._id)
          @populateData asset.assets

        populateData: (assets) ->
          return if !_.isArray(assets)
          @addAsset asset for asset in assets

        getById: (id) ->
          asset = @find({'_id': id})
          if asset
            asset.assets = @findChildren(asset)
            return $q.resolve asset
          return @assets.get(id).then (response) ->
            return response.data

        create: (data) ->
          collection = data
          @populateData data.assets

          if !@find('_id' : collection._id)
            collection = _.omit collection, 'assets' if collection.type is 'collection'
            @data.push collection

          return data

        findChildren: (asset) ->
          _.filter @data, {parent: asset._id}

        findParent: (asset) ->
          _.find @data, {'_id': asset.parent}

        findByAttr: (options = {}) ->
          _.filter @data, options

        find: (options = {}) ->
          _.find @data, options

        findIdx: (options = {}) ->
          _.findIndex @data, options

        filterAssets: (assets, query) ->
          query = _.omit query, ['path', 'recursive']
          if _.keys(query).length
            filter = (params, key) ->
              return _.filter assets, (asset) ->
                if asset.fields?.hasOwnProperty key
                  value = asset.fields[key].value

                  return true if value.match new RegExp params, 'i' if _.isString value
                  return true if ParseFloat value == ParseFloat params if _.isNumber value
                  if _.isArray value
                    for elem in value
                      return true if elem.match new RegExp params, 'i'
                  return false

                else if asset[key]
                  value = asset[key]
                  return true if value.match new RegExp params, 'i' if _.isString value
                  return true if ParseFloat value == ParseFloat params if _.isNumber value
                  return false

            for key, value of query
              continue if key is  'path'
              if _.isArray value
                for params in value
                  assets = filter(params, key)
              else if _.isString value
                assets = filter(value, key)

          return assets

        updateCount: (parent, number) ->
          parent.count = parent.count + number
          @update parent, {stream: false}

        add: (assets, options = {}) ->
          return $q (resolve, reject) =>
            if options.save
              copy = angular.copy assets
              for asset in copy
                delete asset.base64_url
              @assets.create(copy).then (result) =>
                for asset in result
                  asset.base64_url = _.find(assets, {uuid: asset.uuid})?.base64_url
                  @data.push(asset)

                $rootScope.$emit('assets:add', result)
                return resolve result
            else
              @data.push(asset) for asset in assets

              $rootScope.$emit('assets:add', assets)
              return resolve assets

        update: (data, options = {}) ->
          options.stream = true if _.isUndefined options.stream
          options.attribute = '_id' if _.isUndefined options.attribute
          return $q (resolve, reject) =>
            data = [data] if !_.isArray data

            for asset, idx in data
              query = {}
              query[options.attribute] = asset[options.attribute]
              asset = _.omit(asset, 'assets')
              find = @find(query)
              if find
                if find.base64_url and asset.serving_url
                  asset.base64_url = null
                _.assign(find, asset)
                data[idx] = find
              else
                @data.push asset

              if asset.base64_url
                asset.base64_url = null

            if options.save
              resolve @assets.batch(data)
            else
              resolve data

            $rootScope.$emit('assets:update', data) if options.stream

        delete: (assets, options = {}) ->
          return $q (resolve, reject) =>
            return reject(assets) if !assets?.length

            options.stream = true if _.isUndefined options.stream

            promises = []

            for asset in assets
              _.remove @data, {'_id': asset._id}
              if options.save
                promises.push @assets.delete(asset._id)

            if promises.length
              resolve $q.all(promises)
            else
              resolve(assets)

            $rootScope.$emit('assets:delete', assets) if options.stream

        trash: (assets) ->
          request = []
          for asset in assets
            request.push
              '_id'   : asset._id
              'name'  : asset.name

          @assets.trash(request)
          @delete(assets)

        copy: (assets, sourceId, parentId) ->
          return $q (resolve, reject) =>
            @paste(assets).then (pasted) =>

              request = []

              for asset in pasted
                request.push
                  '_id'   : asset._id
                  'order' : asset.order
                  'name'  : asset.name

              @assets.copy(request, sourceId, parentId)
                .then (result) =>
                  if @currentCollection.sortorder is '-order'
                    return resolve @update(result.data)
                  else
                    @update(result.data, {stream: false})
                    return resolve @reSort(@currentCollection)

        move: (assets, sourceId, parentId) ->
          defer = $q.defer()
          @paste(assets).then (pasted) =>

            if @currentCollection.sortorder is '-order'
              @update(pasted).then ->
                defer.resolve()
            else
              @update(pasted, {stream: false})
              @reSort(@currentCollection).then ->
                defer.resolve()

            request = []

            for asset in pasted
              request.push
                '_id'   : asset._id
                'order' : asset.order
                'name'  : asset.name

            @assets.move(request, sourceId, parentId)

          defer.promise

        paste: (assets, options={}) ->
          options.checkdups = true if _.isUndefined options.checkdups
          assetsChildren = @findChildren(@currentCollection)

          checkAsset = (asset) =>
            if not options.checkdups or _.filter(assetsChildren, (item) ->
                  imagoUtils.normalize(asset.name) is imagoUtils.normalize(item.name)).length is 0
              return $q.resolve asset

            else
              i = 1
              exists = true
              original_name = asset.name
              while exists
                asset.name = "#{original_name}_#{i}"
                i++
                exists = (if _.filter(assetsChildren, (item) ->
                  imagoUtils.normalize(asset.name) is imagoUtils.normalize(item.name)).length then true else false)

              return $q.resolve asset

          queue = []
          queue.push checkAsset(asset) for asset in assets

          return $q.all(queue)

        reSort: (collection) ->
          return $q.reject(collection) if not collection.assets or collection.sortorder is '-order'

          orderedList = @reindexAll(collection.assets)
          @update orderedList, {stream: false, save: true}

          collection.sortorder = '-order'
          return @update(collection, {save : true})

        reindexAll:  (list) =>
          newList = []

          count = list.length

          for asset, key in list
            newList.push
              '_id'   : asset._id
              'order' : (count-key) * indexRange

          return newList

        reorder:  (dropped, list, selection, options = {}) =>
          options.process = true if _.isUndefined options.process

          if options.reverse
            count = dropped - selection.length
            idxOne = list[count]
            idxTwo = if list[dropped+1] then list[dropped+1] else {order: 0}
            selection = selection.reverse()
          else if options.process is false
            idxOne = list[dropped-1]
            idxTwo = if list[dropped] then list[dropped] else {order: 0}
          else
            count = dropped + selection.length
            idxOne = if list[dropped-1] then list[dropped-1]
            idxTwo = list[count]

          if not idxOne
            minusOrder = indexRange
          else
            minusOrder = (idxOne.order-idxTwo.order) / (selection.length+1)
            repair = true if minusOrder <= 0.05

          data =
            minus  : minusOrder
            order  : idxTwo.order + minusOrder
            repair : repair

          return data

        batchAddTag: (assets) ->
          for asset, idx in assets
            original = @find('_id' : asset._id)

            return unless original

            copy =
              fields : original.fields
              parent : original.parent

            toedit = angular.copy asset

            for key, value of toedit
              if key is 'fields'

                for key of toedit.fields
                  copy['fields'] or= {}
                  copy['fields'][key] or= {}
                  copy['fields'][key].value or= []
                  if copy['fields'][key].value.indexOf(toedit.fields[key]) is -1
                    copy['fields'][key].value.push(toedit.fields[key])

              else
                copy[key] = toedit[key]

            assets[idx] = copy

          @update assets, {save: true}

        batchChange: (assets, keyOnly) ->
          for asset, idx in assets
            original = @find('_id' : asset._id)

            continue unless original

            copy =
              fields : original.fields
              parent : original.parent

            toedit = angular.copy asset

            for key of toedit
              if key is 'fields'
                for key of toedit.fields
                  copy['fields'] or= {}
                  if keyOnly
                    copy['fields'][key] or= {}
                    copy['fields'][key].value or= {}
                    copy['fields'][key].value[keyOnly] = toedit.fields[key].value[keyOnly]
                  else
                    copy['fields'][key] = toedit.fields[key]

              else
                copy[key] = toedit[key]

            delete copy.fields if _.isEmpty copy.fields

            assets[idx] = copy

          @update assets, {save: true}

        isDuplicated: (asset, assets, options={}) ->
          return $q (resolve, reject) ->

            options.rename = false if _.isUndefined options.rename

            return reject(asset.name) unless asset.name

            name = imagoUtils.normalize(asset.name)
            result = undefined

            assetsChildren = _.filter assets, (chr) =>
              return false unless chr.name
              return name is imagoUtils.normalize(chr.name)

            if assetsChildren.length

              if assetsChildren.length is 1 and assetsChildren[0]._id is asset._id
                return resolve false

              if options.rename
                i = 1
                exists = true
                original_name = name
                while exists
                  name = "#{original_name}_#{i}"
                  i++
                  findName = _.find assets, (chr) =>
                    return _.kebabCase(name) is _.kebabCase(chr.name)
                  exists = (if findName then true else false)

                return resolve name
              else
                return resolve true
            else
              return resolve false

        prepareCreation: (asset, parent, order, rename = false) ->
          return $q (resolve, reject) =>
            return reject(asset.name) unless asset.name

            @isDuplicated(asset, parent.assets, {rename: rename}).then (isDuplicated) =>

              if isDuplicated and _.isBoolean isDuplicated
                return resolve('duplicated')

              else
                if _.isString isDuplicated
                  asset.name = isDuplicated

                if order
                  asset.order = order

                else
                  if parent.sortorder is '-order'
                    assets = parent.assets
                    asset.order = (if assets.length then assets[0].order + indexRange else indexRange)

                  else
                    if parent.assets.length
                      orderedList = @reindexAll(parent.assets)
                      @update orderedList, {save: true}
                      asset.order = orderedList[0].order + indexRange

                    else
                      asset.order = indexRange

                    parent.sortorder = '-order'
                    @update parent, {save: true}

                asset.parent = parent._id
                return resolve asset
        }
