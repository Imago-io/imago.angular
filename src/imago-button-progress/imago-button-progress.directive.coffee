class ImagoButtonProgress extends Directive

  constructor: ($timeout) ->

    return {
      templateUrl: '/imago/imago-button-progress.html'
      transclude: true
      scope:
        action: '&'
        progress: '='
      link: (scope, element, attrs) ->

        scope.actionType = if attrs.progress then 'progress' else 'action'

        if attrs.progress
          scope.$watch 'progress', (value) ->
            if value is true
              scope.animateClass = ['animate', 'progress']
            else
              scope.animateClass = []

        if attrs.action
          scope.opts =
            duration : 1000

          for key of attrs
            continue unless scope.opts[key]
            if attrs[key] in ['true', 'false']
              scope.opts[key] = JSON.parse attrs[key]
            else if not isNaN attrs[key]
              scope.opts[key] = Number attrs[key]
            else
              scope.opts[key] = attrs[key]

          scope.style =
            transitonDuration: scope.opts.duration

          promise = null

          scope.mouseUp = ->
            scope.animateClass = []
            scope.$digest()
            $timeout.cancel(promise)
            if scope.allowAction
              scope.action()
              scope.allowAction = false

          scope.mouseDown = ->
            scope.allowAction = false
            scope.animateClass = ['animate', 'progress']
            scope.$digest()
            promise = $timeout ->
              scope.allowAction = true
              scope.mouseUp()
            , scope.opts.duration

          scope.mouseLeave = ->
            scope.animateClass = []
            scope.allowAction = false
            $timeout.cancel(promise)
            scope.$digest()

          element.on 'mousedown', scope.mouseDown
          element.on 'mouseup',   scope.mouseUp
          element.on 'mouseleave',scope.mouseLeave

          scope.$on '$destroy', ->
            element.off 'mousedown', scope.mouseDown
            element.off 'mouseup',   scope.mouseUp
            element.off 'mouseleave',scope.mouseLeave

    }