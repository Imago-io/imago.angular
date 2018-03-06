class ImagoSaveScroll extends Directive

  constructor: ($window, $timeout, $state, $location) ->

    return {

      restrict: 'A'
      link: (scope, element, attrs) ->
        scope.scrollPos = []

        scope.$on '$viewContentLoaded', ->
          # console.log 'evt', evt
          history = _.find scope.scrollPos, {path: $state.href($state.current, $state.params)}
          # console.log 'search scrollpos for', $state.href($state.current, $state.params), ' found:', history, 'all: ', scope.scrollPos
          if scope.scrollPos.length > 2
            scope.scrollPos = scope.scrollPos.slice 0, 2

          if !history?.scroll
            $window.scrollTo(0, 0)
            return

          $timeout ->
            $window.scrollTo(0, history?.scroll)
          , 500

        scope.$on '$stateChangeStart', (evt, newState, newParams, oldState, oldParams, opts) ->
          path = $state.href(oldState, oldParams)
          return unless path
          scope.scrollPos.unshift({})
          scope.scrollPos[0] =
            path   : path
            scroll : $window.scrollY
          # console.log '$stateChangeStart', scope.scrollPos

    }
