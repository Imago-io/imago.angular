class imagoVideo extends Directive

  constructor: (@$timeout, @$rootScope, imagoUtils, imagoModel) ->

    return {

      scope: true
      templateUrl: '/imago/imago-video.html'
      controller: 'imagoVideoController as imagovideo'
      bindToController: true
      link: (scope, element, attrs) ->

        destroy = ->
          scope.$applyAsync ->
            scope.$destroy()
            element.remove()

        if attrs.imagoVideo.match(/[0-9a-fA-F]{24}/)
          watcher = attrs.$observe 'imagoVideo', (asset) ->
            return unless asset
            watcher()
            asset = imagoModel.find('_id': asset)
            unless asset.fields?.formats?.length
              trackJs?.track "Video #{asset._id} has no formats"
              return destroy()
            scope.imagovideo.init(asset)
        else
          watcher = scope.$watch attrs.imagoVideo, (asset) =>
            return unless asset
            watcher()
            unless asset.fields?.formats?.length
              trackJs?.track "Video #{asset._id} has no formats"
              return destroy()
            scope.imagovideo.init(asset)

    }

class imagoVideoController extends Controller

  constructor: (@$rootScope, @$attrs, @$scope, @$element, @$sce) ->

    @watchers   = []
    @dpr = Math.ceil(window.devicePixelRatio, 1) or 1

    @opts =
      autobuffer  : null
      autoplay    : false
      controls    : true
      preload     : 'none'
      size        : 'hd'
      align       : 'center center'
      sizemode    : 'fit'
      hires       : true
      loop        : false
      width       : ''
      height      : ''
      responsive  : true

    for key of @$attrs
      continue unless @opts[key]
      if @$attrs[key] in ['true', 'false']
        @opts[key] = JSON.parse @$attrs[key]
      else if not isNaN @$attrs[key]
        @opts[key] = Number @$attrs[key]
      else
        @opts[key] = @$attrs[key]

    if @opts.responsive
      @watchers.push @$rootScope.$on 'resize', =>
        @$scope.$applyAsync =>
          @resize()

      # @watchers.push @$rootScope.$on 'resizestop', =>
      #   console.log 'resizestop'

    @$scope.$on '$destroy', =>
      watcher() for watcher in @watchers


  init: (asset) ->
    @asset = asset
    @placeholderUrl = @asset.b64 or "#{@asset.serving_url}=s3"
    @resolution =  @asset.resolution.split('x')
    @assetRatio = _.first(@resolution) / _.last(@resolution)
    @spacerStyle = paddingBottom: "#{_.last(@resolution) / _.first(@resolution) * 100}%"

    if @opts.sizemode is 'crop'
      @mainSide = if @assetRatio > 1 then 'height' else 'width'
    else
      @mainSide = if @assetRatio < 1 then 'height' else 'width'

    # console.log '@mainSide', @mainSide, @assetRatio

    if @asset.fields?.crop?.value and not @$attrs.align
      @opts.align = @asset.fields.crop.value
    if @asset.fields?.sizemode?.value and \
      @asset.fields.sizemode.value isnt 'default' and not @$attrs.sizemode
        @opts.sizemode = @asset.fields.sizemode.value

    @sources = []

    host = if data is 'online' then 'api.imago.io' else 'localhost:8000'

    for source in @asset.fields.formats
      @sources.push({
        src: @$sce.trustAsResourceUrl("//#{host}/api/play_redirect?uuid=#{@asset.uuid}&codec=#{source.codec}&quality=hd")
        type: "video/#{source.codec}"
      })

    @poster = "#{@asset.serving_url}=s720" if @asset.serving_url

    @$scope.$applyAsync =>
      @resize()


  resize: ->
    @width  = @$element.children()[0].clientWidth
    @height = @$element.children()[0].clientHeight

    @wrapperRatio = @width / @height
    return unless @height

    if @opts.sizemode is 'crop'
      @mainSide = if @assetRatio < @wrapperRatio then 'width' else 'height'
    else
      @mainSide = if @assetRatio > @wrapperRatio then 'width' else 'height'


  # render: =>
  #   console.log 'render'



