class imagoPager extends Directive

  constructor: (imagoModel, $timeout, $state) ->

    return {

      scope:
        query       : '@'
        posts       : '='
        state       : '@'
        prevPage    : '&prev'
        nextPage    : '&next'
        pageSize    : '@'
        tags        : '=?'
        currentPage : '=?'
        opts        : '@'
        loaded      : '=?'
      restrict: 'E'
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-pager.html'
      link: (scope, element, attrs) ->


        if !scope.state
          scope.state = $state.current.data?.state or _.head($state.current.name.split('.'))
          # console.log 'noscope set to', scope.state

        scope.fetchPosts = ->
          $timeout ->
            scope.loaded = false
            scope.count += 1
            scope.posts = []
            scope.pageSize = $state.current.data?.pageSize or parseInt(scope.pageSize) or 10
            scope.currentPage = $state.params.page or parseInt(scope.currentPage) or 1
            if !scope.state
              scope.state = $state.current.data?.state or _.head($state.current.name.split('.'))

            query = scope.query or attrs.path or $state.current.data?.query
            if _.includes query, '{'
              query = scope.$eval query
            else
              query = {path: $state.current.data.query}

            if scope.path
              query.path = scope.path

            query.page = scope.currentPage or 1
            query.pagesize = scope.pageSize or $state.current.data.pageSize

            if scope.opts and _.includes scope.opts, '{'
              scope.opts = scope.$eval scope.opts

            scope.opts or= {}

            if $state.params.tag or scope.tags
              query['tags'] = $state.params.tag or scope.tags
              delete query.recursive

            if query?.path and _.includes query.path, '/page/'
              idx = query.path.indexOf '/page/'
              query.path = query.path.slice 0, idx

            return if angular.equals scope.lastQuery, query
            scope.lastQuery = angular.copy query

            # console.log 'query', query
            imagoModel.getData(query).then (response) =>
              for collection in response
                scope.next = collection.next

                if scope.opts.shuffle
                  collection.assets = _.shuffle collection.assets
                  scope.posts = _.shuffle collection
                else
                  scope.posts = collection

                scope.totalPages = Math.ceil(collection.count / scope.pageSize)
                scope.pages = []
                for i in [1...scope.totalPages]
                  scope.pages.push i
                break

              scope.loaded = true

        scope.changeState = ->
          if $state.params.tag
            $state.go "#{scope.state}.filtered.paged", {'tag': $state.params.tag, 'page': scope.currentPage}
          else if scope.state
            $state.go "#{scope.state}.paged", {'page': scope.currentPage}

        scope.onPrev = ->
          scope.currentPage--
          if attrs.prev
            scope.prevPage()
          else
            scope.changeState()

        scope.onNext = ->
          scope.currentPage++
          if attrs.next
            scope.nextPage()
          else if scope.state
            scope.changeState()

        scope.$watchGroup ['currentPage', 'tags'], scope.fetchPosts

        if scope.state
          scope.$on '$stateChangeSuccess', (evt, current, params) ->
            scope.fetchPosts()

    }

