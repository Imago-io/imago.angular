class ImagoScrollSave extends Directive

  constructor: ($window, $document, $timeout, $location) ->

    return {

      restrict: 'A'
      link: (scope, element, attrs) ->
        scope.scrollPos = []

        scope.$on '$viewContentLoaded', ->
          $timeout ->
            history = _.find scope.scrollPos, {path: $location.path()}

            # console.log 'scope.scrollPos', JSON.stringify scope.scrollPos
            # console.log 'history', JSON.stringify history

            $window.scrollTo(0, history?.scroll or 0)

            # add empty object for next history
            scope.scrollPos.unshift({})
            # clear older values
            if scope.scrollPos.length > 2
              scope.scrollPos = scope.scrollPos.slice 0, 2

          , 500

         scope.$on '$locationChangeStart', (evt, newUrl, old, newState, oldState) ->
          scope.scrollPos[0] =
            path   : old
            scroll : $document.scrollTop()

    }