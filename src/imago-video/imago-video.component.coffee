class imagoVideo extends Component

  constructor: ->

    return {

      templateUrl: ($attrs) ->
        return $attrs.templateUrl or '/imago/imago-video.html'
      controller: 'imagoVideoController as imagovideo'
      bindings:
        data: '<?'
        onReady: '&?'

    }

class imagoVideoController extends Controller

  constructor: (@$rootScope, @$attrs, @$scope, @$element, @$sce, @$timeout, @imagoUtils, @imagoModel) ->

    window.debug = false

    @watchers   = []
    @sources = []
    @dpr = Math.ceil(window.devicePixelRatio, 1) or 1

    @opts =
      autobuffer            : null
      autoplay              : false
      controls              : true
      controlsAutohide      : true
      controlsAutohideTime  : 1000
      preload               : false
      size                  : 'hd'
      align                 : 'center center'
      sizemode              : 'fit'
      loop                  : false
      autoplayInview        : false
      responsive            : true
      previewOnly           : false
      theme                 : @$rootScope.videoTheme or '//themes.imago.io/videoangular-imago-theme/videoangular-imago-theme.min.css'

  $postLink: ->
    for key of @$attrs
      continue if _.isUndefined @opts[key]
      if @$attrs[key] in ['true', 'false']
        @opts[key] = JSON.parse @$attrs[key]
      else if not isNaN @$attrs[key]
        @opts[key] = Number @$attrs[key]
      else
        @opts[key] = @$attrs[key]

    if @$attrs.data.match(/[0-9a-fA-F]{24}/)
      watcher = @$attrs.$observe 'data', (asset) =>
        return unless asset
        watcher()
        @imagoModel.getById(asset).then (response) =>
          if !response?.fields?.formats?.length
            trackJs?.track "Video #{response._id} has no formats"
            return @destroy()
          @init(response)

    else if @$attrs.data.match(/^\//)
      @imagoModel.getData(@$attrs.data).then (response) =>
        for item in response
          if !item.fields?.formats?.length
            trackJs?.track "Video #{item._id} has no formats"
            return @destroy()
          @init(item)
          break
    else
      return @destroy() if !@data
      if !@data?.fields?.formats?.length
        trackJs?.track "Video #{@data._id} has no formats"
        return @destroy()
      @init(@data)

  $onDestroy: ->
    watcher() for watcher in @watchers

  destroy: ->
    @$scope.$applyAsync ->
      @$scope.$destroy()
      @$element.remove()

  init: (asset) ->
    @asset = asset
    # @placeholderUrl = @asset.b64 or "#{@asset.serving_url}=s3"
    @resolution =  @asset.resolution.split('x')
    @assetRatio = _.head(@resolution) / _.last(@resolution)
    @spacerStyle = paddingBottom: "#{_.last(@resolution) / _.head(@resolution) * 100}%"

    if @asset.fields?.crop?.value and not @$attrs.align
      @opts.align = @asset.fields.crop.value
    if @asset.fields?.sizemode?.value and \
      @asset.fields.sizemode.value isnt 'default' and not @$attrs.sizemode
        @opts.sizemode = @asset.fields.sizemode.value

    if @opts.responsive
      @watchers.push @$rootScope.$on 'resize', =>
        @$timeout =>
          @getSize()
          @resize()
          old = @mainSide
          # @$scope.$digest() if old isnt @mainSide
        , 0

    # @$scope.$applyAsync => # we need this if video in fullsize directive
    @$timeout =>
      @getSize()

      if @height is 0 and @width is 0
        return console.log 'need width or/and height for static or relative positioning'

      if @height > 0 and @width is 0
        @mainSide = 'autoheight'
      else if @width > 0 and @height is 0
        @mainSide = 'autowidth'
      else
        if @opts.sizemode is 'crop'
          @mainSide = if @assetRatio > 1 then 'height' else 'width'
        else
          @mainSide = if @assetRatio < 1 then 'height' else 'width'

      @ready = true
      @resize()

      # remove preview
      @asset.fields.formats = _.filter @asset.fields.formats, (source) ->
        return true unless source.size in ['preview']

      # remove 1080p for mobile
      if @imagoUtils.isMobile()
        @asset.fields.formats = _.filter @asset.fields.formats, (source) ->
          return true unless source.size in ['1080p']

      if @opts.previewOnly
        webms = _.sortBy(_.filter(@asset.fields.formats, size: 'preview', codec: 'webm'), 'height').reverse()
        mp4s  = _.sortBy(_.filter(@asset.fields.formats, size: 'preview', codec: 'mp4' ), 'height').reverse()
      else
        webms = _.sortBy(_.filter(@asset.fields.formats, codec: 'webm'), 'height').reverse()
        mp4s  = _.sortBy(_.filter(@asset.fields.formats, codec: 'mp4' ), 'height').reverse()

      mp4 = _.head(mp4s)
      if mp4
        @sources.push
          src: @$sce.trustAsResourceUrl("#{@imagoModel.host}/api/play_redirect?uuid=#{@asset.uuid}&codec=#{_.head(mp4s).codec}&size=#{_.head(mp4s).size}")
          type: "video/#{_.head(mp4s).codec}"
      else
        console.error "Cound not find a mp4 for asset #{@asset._id}"

      webm = _.head(webms)
      if webm
        @sources.push
          src: @$sce.trustAsResourceUrl("#{@imagoModel.host}/api/play_redirect?uuid=#{@asset.uuid}&codec=#{_.head(webms).codec}&size=#{_.head(webms).size}")
          type: "video/#{_.head(webms).codec}"
      else
        console.error "Cound not find a webm for asset #{@asset._id}"

      @poster = "#{@asset.serving_url}=s2000-h720" if @asset.serving_url
    , 50


  getSize: ->
    @width  = @$element.children()[0].clientWidth
    @height = @$element.children()[0].clientHeight
    console.debug "imago-video: getSize #{@width}x#{@height}" if window.debug

  onPlayerReady: (api) =>
    if @onReady
      @onReady({api: api})
    if @opts.autoplayInview
      @$scope.$watch 'imagovideo.visible', (value) =>
        if value
          api.play()
        else
          api.pause()

  resize: =>
    if @mainSide not in ['autoheight', 'autowidth']
      @wrapperRatio = @width / @height
      if @opts.sizemode is 'crop'
        @mainSide = if @assetRatio < @wrapperRatio then 'width' else 'height'
      else
        @mainSide = if @assetRatio > @wrapperRatio then 'width' else 'height'
    console.debug "imago-video: resize #{@width}x#{@height} @mainSide #{@mainSide}" if window.debug


