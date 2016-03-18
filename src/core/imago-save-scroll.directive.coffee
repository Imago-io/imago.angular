class ImagoSaveScroll extends Directive

  constructor: ($window, $timeout, $location) ->

    return {

      restrict: 'A'
      link: (scope, element, attrs) ->
        scope.scrollPos = []

        scope.$on '$viewContentLoaded', ->
          history = _.find scope.scrollPos, {path: $location.absUrl()}
          if !history?.scroll
            $window.scrollTo(0, 0)
            return

          $timeout ->
            $window.scrollTo(0, history?.scroll)

            # add empty object for next history
            scope.scrollPos.unshift({})
            # clear older values
            if scope.scrollPos.length > 2
              scope.scrollPos = scope.scrollPos.slice 0, 2

          , 500

         scope.$on '$locationChangeStart', (evt, newUrl, old, newState, oldState) ->
          scope.scrollPos[0] =
            path   : old
            scroll : $window.scrollY

    }
