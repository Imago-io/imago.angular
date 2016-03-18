class StopPropagation extends Directive

  constructor: ->

    return {
      link: (scope, element, attr) ->
        element.bind 'click', (evt) ->
          evt.stopPropagation()

        element.bind 'dblclick', (evt) ->
          evt.stopPropagation()

    }
