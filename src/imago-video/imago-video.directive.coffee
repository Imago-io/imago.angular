class imagoVideo extends Directive

  constructor: (@$timeout, @$rootScope, imagoUtils, imagoModel) ->

    return {

      scope: true
      templateUrl: '/imago/imago-video.html'
      controller: 'imagoVideoController as imagovideo'
      bindToController: true
      link: (scope, element, attrs) ->

        destroy = ->
          scope.$destroy()
          element.remove()

        if attrs.imagoVideo.match(/[0-9a-fA-F]{24}/)
          watcher = attrs.$observe 'imagoVideo', (data) ->
            return unless data
            watcher()
            data = imagoModel.find('_id': data)
            unless data.serving_url
              return destroy()
            scope.imagovideo.init(data)
        else
          watcher = scope.$watch attrs.imagoVideo, (data) =>
            return unless data
            watcher()
            unless data.serving_url
              return destroy()
            scope.imagovideo.init(data)

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

      @watchers.push @$rootScope.$on 'resizestop', =>
        console.log 'resizestop'

    @$scope.$on '$destroy', =>
      watcher() for watcher in @watchers


  init: (data) ->

    @data = data
    @placeholderUrl = @data.b64 or "#{@data.serving_url}=s3"
    @resolution =  @data.resolution.split('x')
    @assetRatio = _.first(@resolution) / _.last(@resolution)
    @spacerStyle = paddingBottom: "#{_.last(@resolution) / _.first(@resolution) * 100}%"

    if @opts.sizemode is 'crop'
      @mainSide = if @assetRatio > 1 then 'height' else 'width'
    else
      @mainSide = if @assetRatio < 1 then 'height' else 'width'

    # console.log '@mainSide', @mainSide, @assetRatio

    if @data.fields?.crop?.value and not @$attrs.align
      @opts.align = @data.fields.crop.value
    if @data.fields?.sizemode?.value and \
      @data.fields.sizemode.value isnt 'default' and not @$attrs.sizemode
        @opts.sizemode = @data.fields.sizemode.value

    @sources = []


    host = if data in 'online' then 'api.imago.io' else 'localhost:8000'


    unless data.fields.formats?.length
      trackJs?.track "Video #{data._id} has no formats"
      console.log "Video #{data._id} has no formats"
      return

    for source in data.fields.formats
      @sources.push({
        src: @$sce.trustAsResourceUrl("//api.imago.io/api/play_redirect?uuid=#{data.uuid}&codec=#{source.codec}&quality=sd")
        type: "video/#{source.codec}"
      })

    @poster = "#{data.serving_url}=s720"


    @$scope.$applyAsync =>
      @resize()


  resize: ->
    console.log 'resize'
    @width  = @$element.children()[0].clientWidth
    @height = @$element.children()[0].clientHeight

    @wrapperRatio = @width / @height
    return unless @height

    if @opts.sizemode is 'crop'
      @mainSide = if @assetRatio < @wrapperRatio then 'width' else 'height'
    else
      @mainSide = if @assetRatio > @wrapperRatio then 'width' else 'height'

    # console.log 'resize', '@assetRatio', @assetRatio, '@wrapperRatio', @wrapperRatio, '@mainSide', @mainSide
    console.log '@mainSide', @mainSide

  render: =>
    console.log 'render'



