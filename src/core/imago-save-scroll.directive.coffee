class ImagoSaveScroll extends Directive

  constructor: ($window, $timeout, $location) ->

    return {

      restrict: 'A'
      link: (scope, element, attrs) ->
        scope.scrollPos = []

        scope.$on '$viewContentLoaded', ->
          scope.scrollPos.unshift({})
          history = _.find scope.scrollPos, {path: $location.absUrl()}

          if !history?.scroll
            $window.scrollTo(0, 0)
            return

          $timeout ->
            $window.scrollTo(0, history?.scroll)

            # clear older values
            if scope.scrollPos.length > 2
              scope.scrollPos = scope.scrollPos.slice 0, 2

          , 500

         scope.$on '$stateChangeStart', (evt, state1, newParams, state2, oldParams, opts) ->
          scope.scrollPos[0] =
            path   : $location.absUrl()
            scroll : $window.scrollY

    }
