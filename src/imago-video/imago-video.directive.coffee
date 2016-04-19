class imagoVideo extends Directive

  constructor: ($timeout, $rootScope, imagoUtils, imagoModel) ->

    return {

      replace: true
      scope: true
      templateUrl: '/imago/imago-video.html'
      controller: 'imagoVideoController as imagovideo'
      link: (scope, element, attrs) ->
        self = {}

        scope.source = undefined

        scope.visible = false

        opts =
          autobuffer  : null
          autoplay    : false
          controls    : true
          preload     : 'none'
          size        : 'hd'
          align       : 'center center'
          sizemode    : 'fit'
          lazy        : true
          hires       : true
          loop        : false
          width       : ''
          height      : ''

        for key, value of attrs
          if value is 'true' or value is 'false'
            opts[key] = JSON.parse value
          else if key is 'width' or key is 'height'
            opts[key] = if value is 'auto' then value else parseInt value
          else
            opts[key] = value

        isId = /[0-9a-fA-F]{24}/

        if attrs.imagoVideo.match(isId)
          self.watch = attrs.$observe 'imagoVideo', (data) ->
            return unless data
            scope.source = imagoModel.find('_id': data)
            self.watch() unless attrs['watch']
            compile()
        else
          self.watch = scope.$watch attrs.imagoVideo, (data) =>
            return unless data
            scope.source = data
            self.watch() unless attrs['watch']
            compile()

        compile = ->
          return console.log 'no formats found' unless scope.source.fields?.formats?.length

          if scope.source.fields?.hasOwnProperty('crop') and not attrs['align']
            opts.align = scope.source.fields.crop.value

          if scope.source.fields?.hasOwnProperty('sizemode')
            if scope.source.fields.sizemode.value isnt 'default' and not attrs['sizemode']
              opts.sizemode = scope.source.fields.sizemode.value


          preload()

        preload = ->
          if angular.isString(scope.source.resolution)
            r = scope.source.resolution.split('x')
            resolution =
              width:  r[0]
              height: r[1]
            opts.assetRatio = r[0]/r[1]

          scope.controls = opts.controls

          if opts.width and opts.height
            width  = opts.width
            height = opts.height
          else
            width = element[0].clientWidth
            height = element[0].clientHeight

          dpr = if opts.hires then Math.ceil(window.devicePixelRatio) or 1 else 1

          if scope.source.serving_url
            serving_url = "#{scope.source.serving_url}=s#{ Math.ceil(Math.min(Math.max(width, height) * dpr)) or 1600 }"

          style =
            size:                 opts.size
            sizemode:             opts.sizemode
            backgroundPosition:   opts.align
            backgroundRepeat:     "no-repeat"

          style.backgroundImage = "url(#{serving_url})" if serving_url

          scope.wrapperStyle = style

          setPlayerAttrs()
          scope.videoFormats = loadFormats()
          render(width, height, serving_url)

        setPlayerAttrs = ->
          scope.imagovideo.player.setAttribute("autoplay", true) if opts.autoplay is true
          scope.imagovideo.player.setAttribute("preload", opts.preload)
          scope.imagovideo.player.setAttribute("x-webkit-airplay", "allow")
          scope.imagovideo.player.setAttribute("webkitAllowFullscreen", true)
          scope.imagovideo.player.setAttribute("loop", opts.loop) if opts.loop is true

        render = (width, height, servingUrl) =>
          if opts.lazy and not scope.visible
            self.visibleFunc = scope.$watch attrs.visible, (value) =>
              scope.visible = value
              return unless value
              self.visibleFunc()
              render(width, height, servingUrl)
          else
            imgLoaded = ->
              $timeout ->
                _.assign(scope.wrapperStyle, styleWrapper(width, height))
                scope.videoStyle = styleVideo(width, height)
                scope.loading = false

            img = angular.element('<img>')
            img.on 'load', imgLoaded

            if servingUrl
              return img[0].src = servingUrl
            return imgLoaded()

        styleWrapper = (width, height) ->
          return unless width and height

          style = {}

          wrapperRatio = width / height

          if opts.sizemode is 'crop'
            if opts.assetRatio < wrapperRatio
              style.backgroundSize = '100% auto'
            else
              style.backgroundSize = 'auto 100%'
          else
            if opts.assetRatio < wrapperRatio
              style.width  = "#{ Math.round(height * opts.assetRatio) }px"
              style.height = "#{ height }px"
              style.backgroundSize = 'auto 100%'
            else
              style.width  = "#{ width }px"
              style.height = "#{ Math.round(width / opts.assetRatio) }px"
              style.backgroundSize = '100% auto'

          style

        styleVideo = (width, height)=>
          return unless width and height

          style = {}

          wrapperRatio = width / height

          if imagoUtils.isiOS()
            style.width  = '100%'
            style.height = '100%'
            if opts.align is 'center center' and opts.sizemode is 'crop'
              style.top  = '0'
              style.left = '0'
          else # Not iOS
            if opts.sizemode is 'crop'
              if opts.assetRatio < wrapperRatio
                style.width  = '100%'
                style.height = 'auto'
                if opts.align is 'center center'
                  style.top  = '50%'
                  style.left = 'auto'
                  style.marginTop  = "-#{ Math.round(height / 2) }px"
                  style.marginLeft = '0px'
              else #assetRatio > wrapperRatio
                style.width  = 'auto'
                style.height = '100%'
                if opts.align is 'center center'
                  style.top  = 'auto'
                  style.left = '50%'
                  style.marginTop  = '0px'
                  style.marginLeft = "-#{ Math.round(width / 2) }px"
            else #sizemode Fit
              if opts.assetRatio < wrapperRatio
                style.width  = 'auto'
                style.height = '100%'
              else #assetRatio > wrapperRatio
                style.width  = '100%'
                style.height = 'auto'

          style

        loadFormats = ->
          formats = []
          codec = detectCodec()
          scope.source.fields.formats.sort( (a, b) -> return b.height - a.height )
          for format, i in scope.source.fields.formats
            continue unless codec is format.codec
            formats.push(
                "src" : "#{imagoModel.host}/api/play_redirect?uuid=#{scope.source.uuid}&codec=#{format.codec}&quality=hd&max_size=#{format.size}"
                "size": format.size
                "codec": format.codec
                "type": "video/#{codec}"
            )

          formats

        detectCodec = ->
          return unless scope.imagovideo.player.canPlayType
          codecs =
            mp4:  'video/mp4; codecs="mp4v.20.8"'
            mp4:  'video/mp4; codecs="avc1.42E01E"'
            mp4:  'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
            webm: 'video/webm; codecs="vp8, vorbis"'
            ogg:  'video/ogg; codecs="theora"'

          for key, value of codecs
            if scope.imagovideo.player.canPlayType value
              return key

        scope.toggleSize = ->
          if opts.size is 'hd'
            opts.size = 'sd'
            scope.wrapperStyle.size = 'sd'
          else
            opts.size = 'hd'
            scope.wrapperStyle.size = 'hd'

          scope.videoFormats.reverse()

          $timeout ->
            scope.imagovideo.player.load()
            scope.imagovideo.player.play()

        onResize = ->
          width  = element[0].clientWidth  or opts.width
          height = element[0].clientHeight or opts.height

          _.assign(scope.wrapperStyle, styleWrapper(width, height))
          scope.videoStyle = styleVideo(width, height)

          scope.$apply()

        # we should only do this if the video changes actually size

        watchers = {}

        watchers.resize = $rootScope.$on 'resize', onResize

        watchers.resizestop = $rootScope.$on 'resizestop', ->
          preload(scope.source)

        watchers.action = $rootScope.$on 'imagovideo:action', (evt, params) ->
          return if not params.id is scope.source._id or not params.action
          return unless _.isFunction scope.imagovideo.player?[params.action]
          scope.imagovideo.player[params.action]()

        scope.$on '$destroy', ->
          for key of watchers
            watchers[key]()

        scope.$on '$stateChangeSuccess', ->
          $timeout ->
            if document.createEvent
              evt = new Event('checkInView')
              window.dispatchEvent(evt)
            else
              #IE
              evt = document.createEventObject()
              evt.eventType = 'checkInView'
              evt.eventName = 'checkInView'
              window.fireEvent('on' + evt.eventType, evt)

    }

class imagoVideoController extends Controller

  constructor: ($scope, $element, $attrs) ->
    @player = $element.find('video')[0]
    $scope.loading = true

    angular.element(@player).bind 'ended', (e) =>
      @player.currentTime = 0
      @state = 'end'

    angular.element(@player).bind 'loadeddata', =>
      $scope.hasPlayed = true
      angular.element(@player).unbind 'loadeddata'

    angular.element(@player).bind 'play', =>
      @state = 'playing'

  togglePlay: ->
    if @player.paused
      @state = 'playing'
      @player.play()
    else
      @state = 'paused'
      @player.pause()

