class StopEvent extends Directive

  constructor: ->

    return {
      restrict: 'A'
      link: (scope, element, attrs) ->
        if attrs && attrs.stopEvent
          events = attrs.stopEvent.split ' '
          for event in events
            element.bind event, (e) ->
              e.stopPropagation()
    }
