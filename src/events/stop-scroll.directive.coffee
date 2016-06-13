class StopScroll extends Directive

  constructor: ->

    return {

      restrict: 'A'
      link: (scope, element, attrs) ->

        element.on 'mousewheel', (evt) ->
          minus = element[0].scrollHeight - element[0].clientHeight
          return if minus is 0
          if (minus is element[0].scrollTop and evt.wheelDelta < 0) or\
           (element[0].scrollTop is 0 and evt.wheelDelta > 0)
            evt.preventDefault()

    }
