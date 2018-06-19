class ImagoSlider extends Directive

  constructor: ($rootScope, $document, $interval, $location) ->

    return {

      restrict: 'E'
      transclude: true
      scope: true
      templateUrl: '/imago/imago-slider.html'
      controller: 'imagoSliderController as imagoslider'
      bindToController:
        assets: '=?data'

      link: (scope, element, attrs, ctrl, transclude) ->

        transclude scope, (clone) ->
          element.children().append(clone)

        for key, value of attrs
          continue unless key.charAt(0) isnt '$'
          if value in ['true', 'false']
            value = JSON.parse value
          scope.imagoslider.conf[key] = value

        scope.$watchCollection 'imagoslider.assets', (data) ->
          return if not data or not _.isArray data
          scope.imagoslider.length = data.length
          scope.prefetch('initial')

        scope.setSiblings = ->
          scope.imagoslider.conf.siblings = !!(scope.imagoslider.conf.next and scope.imagoslider.conf.prev)

        scope.setSiblings()

        if angular.isDefined attrs.prev
          attrs.$observe 'prev', ->
            scope.imagoslider.conf.prev = attrs.prev
            scope.setSiblings()

        if angular.isDefined attrs.next
          attrs.$observe 'next', ->
            scope.imagoslider.conf.next = attrs.next
            scope.setSiblings()

        if $location.path().indexOf('last')
          scope.currentIndex = parseInt(scope.imagoslider.conf.current)
        else
          scope.currentIndex = scope.getLast()

        scope.clearInterval = ->
          return unless scope.imagoslider.conf.interval
          $interval.cancel(scope.imagoslider.conf.interval)

        scope.imagoslider.goPrev = (ev) ->
          if typeof ev is 'object'
            scope.clearInterval()
            ev.stopPropagation()

          # no loop
          if not scope.imagoslider.conf.loop
            scope.imagoslider.setCurrent(
              if (scope.currentIndex > 0) then scope.currentIndex - 1 else scope.currentIndex
            )

          # loop through current collection
          else if scope.imagoslider.conf.loop and not scope.imagoslider.conf.siblings
            scope.imagoslider.setCurrent(
              if (scope.currentIndex > 0) then scope.currentIndex - 1 else parseInt(scope.imagoslider.length) - 1
            )

          # loop through sibling collections
          else if scope.imagoslider.conf.loop and scope.imagoslider.conf.siblings
            if (scope.currentIndex > 0)
              scope.imagoslider.setCurrent(scope.currentIndex - 1)
            else
              $location.path scope.imagoslider.conf.prev

          scope.prefetch('prev')

        scope.imagoslider.goNext = (ev, clearInterval = true) ->
          if typeof ev is 'object' or clearInterval
            scope.clearInterval()
            ev.stopPropagation() if ev

          # no loop
          if not scope.imagoslider.conf.loop
            scope.imagoslider.setCurrent(
              if (scope.currentIndex < scope.imagoslider.length - 1) then scope.currentIndex + 1 else scope.currentIndex
            )

          # loop through current collection
          else if scope.imagoslider.conf.loop and not scope.imagoslider.conf.siblings
            scope.imagoslider.setCurrent(
              if (scope.currentIndex < scope.imagoslider.length - 1) then scope.currentIndex + 1 else 0
            )

          # loop through sibling collections
          else if scope.imagoslider.conf.loop and scope.imagoslider.conf.siblings
            if (scope.currentIndex < scope.imagoslider.length - 1)
              scope.imagoslider.setCurrent(scope.currentIndex + 1)
            else
              $location.path scope.imagoslider.conf.next

          scope.prefetch('next')

        scope.prefetch = (direction) ->
          return if not scope.imagoslider.conf.prefetch or not scope.imagoslider.assets?.length
          if scope.currentIndex is scope.getLast()
            idx = 0
          else if direction is 'initial'
            idx = 1
          else if direction is 'prev'
            idx = angular.copy(scope.currentIndex) - 1
          else if direction is 'next'
            idx = angular.copy(scope.currentIndex) + 1

          return if not scope.imagoslider.assets[idx]?.serving_url or not scope.imagoslider.servingSize

          image = new Image()
          image.src = scope.imagoslider.assets[idx].serving_url + scope.imagoslider.servingSize

        scope.getLast = ->
          Number(scope.imagoslider.length) - 1

        scope.getCurrent = ->
          return scope.currentIndex

        scope.imagoslider.setCurrent = (index) ->
          scope.action = switch
            # make last to first infinit if loop over one collection
            when index is 0 and scope.currentIndex is (parseInt(@length) - 1) and not @conf.siblings then 'next'
            when index is (parseInt(@length) - 1) and scope.currentIndex is 0 and not @conf.siblings then 'prev'
            when index > scope.currentIndex then 'next'
            when index < scope.currentIndex then 'prev'
            else ''

          return @goNext() if index is undefined

          # console.log 'scope.action', scope.action
          scope.currentIndex = index
          $rootScope.$emit "#{@conf.namespace}:changed", index

        if !_.isUndefined attrs.autoplay
          scope.$watch attrs.autoplay, (value) ->
            if parseInt(value) > 0
              scope.imagoslider.conf.interval = $interval ->
                scope.imagoslider.goNext('', false)
              , parseInt(value)
            else
              scope.clearInterval()

        keyboardBinding = (e) ->
          switch e.keyCode
            when 37
              scope.$apply ->
                scope.imagoslider.goPrev()
            when 39
              scope.$apply ->
                scope.imagoslider.goNext()

        if scope.imagoslider.conf.enablekeys
          $document.on 'keydown', keyboardBinding

        watchers = []

        watchers.push $rootScope.$on "#{scope.imagoslider.conf.namespace}:change", (evt, index) ->
          scope.clearInterval()
          scope.imagoslider.setCurrent(index)

        scope.$on '$destroy', ->
          $document.off "keydown", keyboardBinding
          scope.clearInterval()
          for watch in watchers
            watch()

  }


class ImagoSliderController extends Controller

  constructor: ($scope) ->

    @conf =
      animation:    'fade'
      enablekeys:   true
      enablearrows: true
      loop:         true
      current:      0
      namespace:    'slider'
      autoplay:     0
      next:         null
      prev:         null
      prefetch:     true

    @setServingSize = (value) =>
      if @servingSize
        @servingSize = value
      else
        @servingSize = value
        $scope.prefetch('initial')
