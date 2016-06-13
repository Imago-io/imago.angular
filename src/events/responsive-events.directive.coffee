class ResponsiveEvents extends Directive

  constructor: ($window, $rootScope) ->

    return {

      restrict: 'A'
      link: ($scope) ->

        w = angular.element $window

        onResizeStart = (e) =>
          return if @resizeing
          $rootScope.$emit 'resizestart'
          @resizeing = true
          resizeStop = $rootScope.$on 'resizestop', =>
            @resizeing = false
            resizeStop()

        onScrollStart = (e) =>
          return if @scrolling
          $rootScope.$emit 'scrollstart'
          @scrolling = true
          scrollStop = $rootScope.$on 'scrollstop', =>
            @scrolling = false
            scrollStop()

        onMouseWheelStart = (e) =>
          return if @isMouseWheeling
          $rootScope.$emit 'mousewheelstart'
          @isMouseWheeling = true
          mouseStop = $rootScope.$on 'mousewheelstop', =>
            @isMouseWheeling = false
            mouseStop()

        w.on 'resize', -> $rootScope.$emit 'resize'

        w.on 'resize', onResizeStart
        w.on 'resize', _.debounce ( -> $rootScope.$emit 'resizestop' ),  200
        w.on 'resize', _.throttle ( -> $rootScope.$emit 'resizelimit' ), 150

        w.on 'scroll', onScrollStart
        w.on 'scroll', _.debounce ( -> $rootScope.$emit 'scrollstop' ),  200
        w.on 'scroll', _.throttle ( -> $rootScope.$emit 'scrolllimit' ), 150

        w.on 'mousewheel', onMouseWheelStart
        w.on 'mousewheel', _.debounce ( -> $rootScope.$emit 'mousewheelstop' ),  200
        w.on 'mousewheel', _.throttle ( -> $rootScope.$emit 'mousewheellimit' ), 150

    }