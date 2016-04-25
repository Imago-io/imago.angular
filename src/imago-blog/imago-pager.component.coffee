class imagoPagerController extends Controller

    constructor: ($location) ->
      console.log 'query', @query

class imagoPagerTest extends Component

  constructor: ->

    return {

      bindings:
        query       : '@'
        posts       : '='
        state       : '@'
        prevPage    : '&prev'
        nextPage    : '&next'
        pageSize    : '@'
        tags        : '=?'
        currentPage : '=?'
        opts        : '@'

      controller: 'imagoPagerController as imagopager'
      templateUrl: ($attrs) ->
        $attrs.templateUrl or '/imago/imago-pager-test.html'

      $routeConfig: [
          {
            path: '/'
            name: 'imagoPagerBase'
            useAsDefault: true
          }
          {
            path: '/page/:page',
            name: 'imagoPagerPage'
          }
          {
            path: '/tags/:tag'
            name: 'imagoPagerFiltered'
          }
          {
            path: '/tags/:tag/page/:page'
            name: 'imagoPagerFilteredPage'
          }
      ]

    }