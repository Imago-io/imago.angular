class imagoImage extends Directive

  constructor: ($window, $rootScope, $timeout, $parse, $log, imagoUtils, imagoModel) ->

    return {

      replace: true
      scope: true
      templateUrl: '/imago/imago-image.html'
      controller: 'imagoImageController as imagoimage'
      require: '?^imagoSlider'
      bindToController: true
      link: (scope, element, attrs, imagoSlider) ->

        self = {}

        scope.visible = false
        scope.source = undefined

        opts =
          align     : 'center center'
          sizemode  : 'fit'
          hires     : true
          responsive: true
          scale     : 1
          lazy      : true
          maxsize   : 4000
          # width     : ''
          # height    : ''

        for key, value of attrs
          if value is 'true' or value is 'false'
            opts[key] = JSON.parse value
          else if key is 'maxsize'
            opts[key] = parseInt value
          # else if key is 'width' or key is 'height'
          #   opts[key] = if value is 'auto' then value else parseInt value
          else
            opts[key] = value

        # console.log 'attrs.imagoImage', attrs.imagoImage, typeof attrs.imagoImage

        scope.imagoimage.opts = opts

        isId = /[0-9a-fA-F]{24}/

        if attrs.imagoImage.match(isId)
          self.watch = attrs.$observe 'imagoImage', (value) ->
            return unless value
            scope.source = imagoModel.find('_id': value)
            self.watch() unless attrs['watch']
            compile()
        else
          self.watch = scope.$watch attrs.imagoImage, (data) =>
            return unless data
            scope.source = data
            self.watch() unless attrs['watch']
            compile()

        compile = ->
          opts.servingSize = null
          unless scope.source?.serving_url
            element.remove()
            return

          if scope.source.fields.hasOwnProperty('crop') and not attrs['align']
            opts.align = scope.source.fields.crop.value
          if scope.source.fields.hasOwnProperty('sizemode')
            if scope.source.fields.sizemode.value isnt 'default' and not attrs['sizemode']
              opts.sizemode = scope.source.fields.sizemode.value

          if opts.responsive
            if opts.sizemode is 'crop'
              scope.$on 'resizelimit', ->
                calcMediaSize()
                scope.$evalAsync()

          initialize()

        initialize = ->
          if angular.isString(scope.source.resolution)
            r = scope.source.resolution.split('x')
            opts.resolution =
              width:  r[0]
              height: r[1]
            opts.assetRatio = r[0]/r[1]

          return console.log('tried to render during rendering!!') if scope.imagoimage.status is 'preloading'
          scope.imagoimage.status = 'preloading'

          scope.align = opts.align
          scope.sizemode = opts.sizemode

          width  = element[0].clientWidth
          height = element[0].clientHeight

          wrapperRatio = width / height if height
          # console.log 'wrapperRatio', wrapperRatio, width, height, opts.resolution

          dpr = if opts.hires then Math.ceil($window.devicePixelRatio) or 1 else 1

          # $log.log 'width, height', width, height

          if opts.sizemode is 'crop' and height
            if opts.assetRatio <= wrapperRatio
              # $log.log 'crop full width'
              servingSize = Math.round(Math.max(width, width / opts.assetRatio))
            else
              # $log.log 'crop full height'
              servingSize = Math.round(Math.max(height, height * opts.assetRatio))

          # sizemode fit
          else
            # $log.log 'assetratio: ', opts.assetRatio, 'wrapperraito: ' , wrapperRatio
            if not height or opts.autosize is 'height'
              opts.autosize = 'height'
              opts.maxHeight = Math.round(width / opts.assetRatio)
              # console.log 'opts.autosize inside', opts.autosize, width, height, opts.assetRatio, opts.autosize, opts.maxHeight
              servingSize = Math.round(Math.max(width, width / opts.assetRatio))

            else if not width or opts.autosize is 'width'
              opts.autosize = 'width'
              # console.log 'opts.autosize inside', opts.autosize
              servingSize = Math.round(Math.max(height, height * opts.assetRatio))

            else if opts.assetRatio <= wrapperRatio
              # $log.log 'fit full height', opts.width, opts.height, opts.assetRatio, opts.height * assetRatio
              servingSize = Math.round(Math.max(height, height * opts.assetRatio))
            else
              # $log.log 'fit full width', width, height, opts.assetRatio, wrapperRatio
              servingSize = Math.round(Math.max(width, width / opts.assetRatio))

          servingSize = parseInt Math.min(servingSize * dpr, opts.maxsize), 10

          # make sure we only load a new size
          # console.log 'new size, old size', servingSize, opts.servingSize
          if servingSize is opts.servingSize
            scope.imagoimage.status = 'loaded'
            return

          opts.servingSize = servingSize

          if imagoUtils.isBaseString(scope.source.serving_url)
            opts.servingUrl = scope.source.serving_url

          else
            opts.servingUrl = "#{ scope.source.serving_url }=s#{ servingSize * opts.scale }"

          if imagoSlider
            imagoSlider.setServingSize("=s#{ servingSize * opts.scale }")

          # $log.log 'opts.servingUrl', opts.servingUrl

          render()


        render =  ->
          if opts.lazy and not scope.visible
            self.visibleFunc = scope.$watch 'visible', (value) =>
              return unless value
              self.visibleFunc()
              scope.visible = true
              render()
          else
            img = angular.element('<img>')
            img.on 'load', (e) ->
              if opts.sizemode is 'crop'
                scope.imagoimage.imageStyle =
                  backgroundImage:    "url(#{opts.servingUrl})"
                  backgroundSize:     calcMediaSize()
                  backgroundPosition: opts.align
              else
                scope.servingUrl = opts.servingUrl
                scope.imagoimage.imageStyle = {'max-height': "#{opts.maxHeight}px"} if opts.maxHeight

              scope.imagoimage.status = 'loaded'
              scope.$evalAsync()
            # console.log 'scope.imagoimage.imageStyle', scope.imagoimage.imageStyle

            img[0].src = opts.servingUrl

        calcMediaSize = ->
          # $log.log 'calcMediaSize', opts.sizemode
          width  = element[0].clientWidth
          height = element[0].clientHeight

          # return unless width and height

          wrapperRatio = width / height if height

          if opts.sizemode is 'crop'
            # crop
            if opts.assetRatio < wrapperRatio
              scope.imagoimage.imageStyle['background-size'] = "100% auto"
            else
              scope.imagoimage.imageStyle['background-size'] = "auto 100%"
          # else
          #   # fit
          #   if opts.assetRatio > wrapperRatio
          #     scope.imagoimage.imageStyle['width']  = 'auto'
          #     scope.imagoimage.imageStyle['height'] = '100%'
          #   else
          #     scope.imagoimage.imageStyle['width']  = '100%'
          #     scope.imagoimage.imageStyle['height'] = 'auto'

        setImageStyle = ->
          if opts.sizemode is 'crop'
            styles =
              backgroundImage:    "url(#{opts.servingUrl})"
              backgroundSize:     calcMediaSize()
              backgroundPosition: opts.align
            return styles

          else
            scope.servingUrl = opts.servingUrl
            # styles = calcMediaSize()
          return

        watchers = {}

        if opts.responsive
          # console.log 'resize', scope.onResize()

          # scope.$on 'resizestart', () ->
          #   scope.resizing = 'resizing'

          watchers.resizestop = $rootScope.$on 'resizestop', ->
            scope.imagoimage.status = 'loading'
            # scope.resizing = ''
            initialize() if scope.source

        scope.$on '$stateChangeSuccess', ->
          $timeout ->
            imagoUtils.fireEvent('checkInView')

        angular.element($window).on 'orientationchange', initialize

        scope.$on '$destroy', ->
          for key of watchers
            watchers[key]()

    }

class imagoImageController extends Controller

  constructor: ($attrs) ->
    @status = 'loading'
    @imageStyle = {}

    if angular.isDefined($attrs.lazy) and $attrs.lazy is 'false'
      @removeInView = true
