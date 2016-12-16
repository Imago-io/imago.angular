class StopEvent extends Directive

  constructor: ->

    return {
      restrict: 'A'
      link: (scope, element, attrs) ->
        if attrs && attrs.stopEvent
          element.bind attrs.stopEvent, (e) ->
            e.stopPropagation()
    }
