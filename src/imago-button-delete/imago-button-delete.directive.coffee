class ImagoButtonDelete extends Directive

  constructor: ($timeout) ->

    return {
      templateUrl: '/imago/button-delete.html'
      transclude: true
      scope:
        action: '&'
      link: (scope, element, attrs) ->

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
          if scope.allowDelete
            scope.action()
            scope.allowDelete = false

        scope.mouseDown = ->
          scope.allowDelete = false
          scope.animateClass = ['animate', 'progress']
          scope.$digest()
          promise = $timeout ->
            scope.allowDelete = true
            scope.mouseUp()
          , scope.opts.duration

        scope.mouseLeave = ->
          scope.animateClass = []
          scope.allowDelete = false
          $timeout.cancel(promise)
          scope.$digest()

        element.on 'mousedown', scope.mouseDown
        element.on 'mouseup',   scope.mouseUp
        element.on 'mouseleave',scope.mouseLeave

    }