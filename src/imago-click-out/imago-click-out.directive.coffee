class ImagoClickOut extends Directive

  constructor: ($document, $parse) ->

    return {

      restrict: 'A'
      link: (scope, element, attrs) ->
        clickOutHandler = $parse(attrs.imagoClickOut)

        clickFunction = (evt) ->
          return if element[0].contains(evt.target)
          clickOutHandler(scope, {$event: evt})
          scope.$apply()

        $document.on 'click', clickFunction

        scope.$on '$destroy', ->
          $document.off 'click', clickFunction


    }