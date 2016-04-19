class imagoPager extends Directive

  constructor: (imagoModel, $state) ->

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
      restrict: 'E'
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-pager.html'
      link: (scope, element, attrs) ->

        scope.fetchPosts = ->
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
            query = {path: query}

          query.page = scope.currentPage
          query.pagesize = scope.pageSize

          if scope.opts and _.includes scope.opts, '{'
            scope.opts = scope.$eval scope.opts

          scope.opts or= {}

          if $state.params.tag or scope.tags
            query['tags'] = $state.params.tag or scope.tags

          if query?.path and _.includes query.path, '/page/'
            idx = query.path.indexOf '/page/'
            query.path = query.path.slice 0, idx

          imagoModel.getData(query).then (response) =>
            for collection in response
              scope.next = collection.next

              if scope.opts.shuffle
                scope.posts = _.shuffle collection.assets
              else
                scope.posts = collection.assets

              scope.totalPages = collection.count / scope.pageSize
              break

            scope.loaded = true

        scope.prevState = ->
          if $state.params.tag
            $state.go "#{scope.state}.filtered.paged", {'tag': $state.params.tag, 'page': scope.currentPage}
          else if scope.state
            $state.go "#{scope.state}.paged", {'page': scope.currentPage}

        scope.nextState = ->
          if $state.params.tag
            $state.go "#{scope.state}.filtered.paged", {'tag': $state.params.tag, 'page': scope.currentPage}
          else if scope.state
            $state.go "#{scope.state}.paged", {'page': scope.currentPage}

        scope.onPrev = ->
          scope.currentPage--
          if attrs.prev
            scope.prevPage()
          else if scope.state
            scope.prevState()

        scope.onNext = ->
          scope.currentPage++
          if attrs.next
            scope.nextPage()
          else if scope.state
            scope.nextState()

        scope.$watchGroup ['currentPage', 'tags'], scope.fetchPosts

        if scope.state
          scope.$on '$stateChangeSuccess', (evt, current, params) ->
            scope.currentPage = 1 if scope.state is current.name

    }

