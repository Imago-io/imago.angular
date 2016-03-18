class imagoPager extends Directive

  constructor: ->

    return {

      scope:
        state: '@'
        posts: '='
        prevPage: '&prev'
        nextPage: '&next'
        path: '@'
        pageSize: '@'
        tags: '='
        currentPage: '='
        shuffle: '='
      restrict: 'E'
      controller: 'imagoPagerController as imagopager'
      bindToController: true
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-pager.html'

    }

class imagoPagerController extends Controller

  constructor: ($scope, $attrs, imagoModel, $state) ->

    @fetchPosts = =>
      @count += 1
      @posts = []
      @pageSize = parseInt(@pageSize) or 10
      @currentPage = parseInt(@currentPage) or $state.params.page or 1
      @state = 'blog' unless @state

      query =
        path:     @path
        page:     @currentPage
        pagesize: @pageSize

      if @tags or $state.params.tag
        query['tags'] = @tags or $state.params.tag

      # console.log 'query', query
      if query?.path and _.includes query.path, '/page/'
        idx = query.path.indexOf '/page/'
        query.path = query.path.slice 0, idx

      imagoModel.getData([query], {localData: false}).then (response) =>
        # console.log 'response', response
        for collection in response
          @next = collection.next

          if @shuffle is 'true'
            @posts = _.shuffle collection.assets
          else
            @posts = collection.assets

          @totalPages = collection.count / @pageSize
          break

    @prevState = ->
      if $state.params.tag
        $state.go "#{@state}.filtered.paged", {'tag': $state.params.tag, 'page': @currentPage}
      else if @state
        $state.go "#{@state}.paged", {'page': @currentPage}

    @nextState = ->
      if $state.params.tag
        $state.go "#{@state}.filtered.paged", {'tag': $state.params.tag, 'page': @currentPage}
      else if @state
        $state.go "#{@state}.paged", {'page': @currentPage}

    @onPrev = =>
      @currentPage--
      if $attrs.prev
        @prevPage()
      else if @state
        @prevState()

    @onNext = =>
      @currentPage++
      if $attrs.next
        @nextPage()
      else if @state
        @nextState()

    $scope.$watchGroup ['imagopager.currentPage', 'imagopager.tags'], @fetchPosts

    if @state
      $scope.$on '$stateChangeSuccess', (evt, current, params) =>
        @currentPage = 1 if @state is current.name
