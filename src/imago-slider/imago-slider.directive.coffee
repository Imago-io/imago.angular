class imagoSlider extends Directive

  constructor: ($rootScope, $document, $interval, $location, $timeout) ->

    return {

      transclude: true
      scope: true
      templateUrl: '/imago/imago-slider.html'
      controller: 'imagoSliderController as imagoslider'
      bindToController:
        assets: '=?imagoSlider'

      link: (scope, element, attrs, ctrl, transclude) ->

        transclude scope, (clone) ->
          element.children().children().eq(0).append(clone)

        watchers = []

        scope.$watchCollection 'imagoslider.assets', (data) ->
          return if not data or not _.isArray data
          scope.imagoslider.length = data.length
          scope.imagoslider.init()
          scope.prefetch('initial')

        scope.setSiblings = ->
          scope.imagoslider.opts.siblings = !!(scope.imagoslider.opts.next and scope.imagoslider.opts.prev)

        scope.setSiblings()

        if angular.isDefined attrs.prev
          attrs.$observe 'prev', ->
            scope.imagoslider.opts.prev = attrs.prev
            scope.setSiblings()

        if angular.isDefined attrs.next
          attrs.$observe 'next', ->
            scope.imagoslider.opts.next = attrs.next
            scope.setSiblings()

        if $location.path().indexOf('last')
          scope.currentIndex = parseInt(scope.imagoslider.opts.current)
        else
          scope.currentIndex = scope.getLast()

        scope.clearInterval = ->
          return unless scope.imagoslider.opts.interval
          $interval.cancel(scope.imagoslider.opts.interval)

        scope.imagoslider.goPrev = (ev) ->
          if typeof ev is 'object'
            scope.clearInterval()
            ev.stopPropagation()

          # no loop
          if not scope.imagoslider.opts.loop
            scope.imagoslider.setCurrent(
              if (scope.currentIndex > 0) then scope.currentIndex - 1 else scope.currentIndex
            )

          # loop through current collection
          else if scope.imagoslider.opts.loop and not scope.imagoslider.opts.siblings
            scope.imagoslider.setCurrent(
              if (scope.currentIndex > 0) then scope.currentIndex - 1 else parseInt(scope.imagoslider.length) - 1
            )

          # loop through sibling collections
          else if scope.imagoslider.opts.loop and scope.imagoslider.opts.siblings
            if (scope.currentIndex > 0)
              scope.imagoslider.setCurrent(scope.currentIndex - 1)
            else
              $location.path scope.imagoslider.opts.prev

          scope.prefetch('prev')

        scope.imagoslider.goNext = (ev, clearInterval = true) =>
          if typeof ev is 'object' or clearInterval
            scope.clearInterval()
            ev.stopPropagation() if ev

          # no loop
          if not scope.imagoslider.opts.loop
            scope.imagoslider.setCurrent(
              if (scope.currentIndex < scope.imagoslider.length - 1) then scope.currentIndex + 1 else scope.currentIndex
            )

          # loop through current collection
          else if scope.imagoslider.opts.loop and not scope.imagoslider.opts.siblings
            scope.imagoslider.setCurrent(
              if (scope.currentIndex < scope.imagoslider.length - 1) then scope.currentIndex + 1 else 0
            )

          # loop through sibling collections
          else if scope.imagoslider.opts.loop and scope.imagoslider.opts.siblings
            if (scope.currentIndex < scope.imagoslider.length - 1)
              scope.imagoslider.setCurrent(scope.currentIndex + 1)
            else
              $location.path scope.imagoslider.opts.next

          scope.prefetch('next')

        scope.prefetch = (direction) ->
          return if not scope.imagoslider.opts.prefetch or not scope.imagoslider.assets?.length
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
            when index is 0 and scope.currentIndex is (parseInt(@length) - 1) and not scope.imagoslider.opts.siblings then 'next'
            when index is (parseInt(@length) - 1) and scope.currentIndex is 0 and not scope.imagoslider.opts.siblings then 'prev'
            when index > scope.currentIndex then 'next'
            when index < scope.currentIndex then 'prev'
            else ''

          return @goNext() if index is undefined

          # console.log 'scope.action', scope.action
          scope.currentIndex = index
          $rootScope.$emit "#{scope.imagoslider.opts.namespace}:changed", index

        if !_.isUndefined attrs.autoplay
          scope.$watch attrs.autoplay, (value) =>
            if parseInt(value) > 0
              scope.imagoslider.opts.interval = $interval =>
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

        if scope.imagoslider.opts.enablekeys
          $document.on 'keydown', keyboardBinding

        watchers.push $rootScope.$on "#{scope.imagoslider.opts.namespace}:change", (evt, index) ->
          scope.clearInterval()
          scope.imagoslider.setCurrent(index)

        scope.$on '$destroy', ->
          $document.off "keydown", keyboardBinding
          scope.clearInterval()
          for watch in watchers
            watch()
  }


class imagoSliderController extends Controller

  constructor: (@$scope, @$attrs, @$element) ->

    @opts =
      animation    : 'fade'
      enablekeys   : true
      enablearrows : true
      loop         : true
      current      : 0
      namespace    : 'slider'
      autoplay     : 0
      next         : null
      prev         : null
      prefetch     : true

    for key of @$attrs
      continue unless @opts[key]
      if @$attrs[key] in ['true', 'false']
        @opts[key] = JSON.parse @$attrs[key]
      else if not isNaN @$attrs[key]
        @opts[key] = Number @$attrs[key]
      else
        @opts[key] = @$attrs[key]

  init: ->
    @slider = new Swiper(@$element.children(), {
      loop: true
      initialSlide: 0
      showNavButtons: true
      slidesPerView: 1
      slidesPerColumn: 1
      lazyLoading: true
      preloadImages: false
      spaceBetween: 0
      direction: 'horizontal'
      pagination: '.swiper-pagination'
      nextButton: '.swiper-button-next'
      prevButton: '.swiper-button-prev'
      # scrollbar: '.swiper-scrollbar'
    })

    @slider.on 'slideChangeStart', =>
      @goNext()

  setServingSize: (value) =>
    if @servingSize
      return @servingSize = value
    @servingSize = value
    @$scope.prefetch('initial')
