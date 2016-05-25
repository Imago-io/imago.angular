class StopPropagation extends Directive

  constructor: ->

    return {
      link: (scope, element, attrs) ->
        options = attrs.stopPropagation
        if options in ['stop-propagation', '']
          element.bind 'click', (evt) ->
            evt.stopPropagation()

          element.bind 'dblclick', (evt) ->
            evt.stopPropagation()
        else
          createBind = (eventName) ->
            element.bind eventName, (evt) ->
              evt.stopPropagation()
          options = options.split(' ')
          return unless options.length
          for item in options
            createBind item

    }
