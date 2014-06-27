class imagoSlider extends Directive

  constructor: ->
    return {
      replace: true
      scope: false
      transclude: true
      templateUrl: '/imagoWidgets/slider-widget.html'
      controller: ($scope, $element, $attrs, $window, imagoPanel) ->

        source = $attrs.source or 'assets'

        $scope.$watch source, (assetsData) ->
          if assetsData
            unless angular.isArray(assetsData)
              imagoPanel.getData(assetsData.path).then (response) ->
                assetsData = response[0].items
                prepareSlides(assetsData)
            else
              prepareSlides(assetsData)

        prepareSlides = (assetsData) ->
          $scope.loadedData = true
          $scope.slideSource = []

          #If slider has one slide
          for item in assetsData
            if item.serving_url
              $scope.slideSource.push item

          if $scope.slideSource?.length <= 1 or !$scope.slideSource
              $scope.confSlider.enablearrows = false
              $scope.confSlider.enablekeys   = false

          # @id = imagoUtils.uuid()

          $scope.currentIndex = 0

        $scope.setCurrentSlideIndex = (index) ->
          $scope.currentIndex = index

        $scope.isCurrentSlideIndex = (index) ->
          return $scope.currentIndex is index

        $scope.goPrev = () ->
          $scope.currentIndex = if ($scope.currentIndex < $scope.slideSource.length - 1) then ++$scope.currentIndex else 0

        $scope.goNext = () ->
          $scope.currentIndex = if ($scope.currentIndex > 0) then --$scope.currentIndex else $scope.slideSource.length - 1

        $scope.getLast = () ->
          $scope.slideSource.length - 1

        angular.element($window).on 'keydown', (e) ->
          return unless $scope.confSlider.enablekeys
          switch e.keyCode
            when 37
              $scope.$apply(()->
                $scope.goPrev()
              )
            when 39
              $scope.$apply(()->
                $scope.goNext()
              )

      compile: (tElement, tAttrs, transclude) ->
        pre: (scope, iElement, iAttrs, controller) ->

          scope.confSlider = {}

          @defaults =
            animation:    'fade'
            sizemode:     'fit'
            current:      0
            enablekeys:   true
            enablearrows: true
            enablehtml:   true
            subslides:    false
            loop:         true
            noResize:     false
            current:      0
            lazy:         false
            align:         'center center'

          angular.forEach @defaults, (value, key) ->
            scope.confSlider[key] = value

          angular.forEach iAttrs, (value, key) ->
            scope.confSlider[key] = value

          scope.elementStyle = scope.confSlider.animation
    }
