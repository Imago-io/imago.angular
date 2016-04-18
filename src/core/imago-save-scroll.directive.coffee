class ImagoSaveScroll extends Directive

  constructor: ($window, $timeout, $state, $location) ->

    return {

      restrict: 'A'
      link: (scope, element, attrs) ->
        scope.scrollPos = []

        scope.$on '$viewContentLoaded', ->
          scope.scrollPos.unshift({})
          history = _.find scope.scrollPos, {path: $state.href($state.current, $state.params)}
          if scope.scrollPos.length > 2
            scope.scrollPos = scope.scrollPos.slice 0, 2

          if !history?.scroll
            $window.scrollTo(0, 0)
            return

          $timeout ->
            $window.scrollTo(0, history?.scroll)
          , 500

         scope.$on '$stateChangeStart', (evt, newState, newParams, oldState, oldParams, opts) ->
          scope.scrollPos[0] =
            path   : $state.href(oldState, oldParams)
            scroll : $window.scrollY

    }
