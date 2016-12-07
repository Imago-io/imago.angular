class imagoImage extends Component

  constructor: ->

    return {

      templateUrl: '/imago/imago-image.html'
      controller: 'imagoImageController as imagoimage'
      require:
        sliderCtrl: '?^imagoSlider'
      bindings:
        data: '=?'

    }

class imagoImageController extends Controller

  constructor: (@$rootScope, @$timeout, @$attrs, @$scope, @$element, @imagoModel) ->

    @loaded     = false
    @imageStyle = {}
    @watchers   = []

    @opts =
      align       : 'center center'
      sizemode    : 'fit'
      autosize    : 'none'
      responsive  : true
      scale       : 1
      lazy        : true
      maxsize     : 4000
      placeholder : @$rootScope.imagePlaceholder or false
      allowDrag   : true
      width       : undefined
      height      : undefined
      path        : ''

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
        imagoModel.getById(asset).then (response) =>
          return @destroy() if !response?.serving_url
          @init(response)
    else if @$attrs.data.match(/^\//)
      imagoModel.getData(@$attrs.data).then (response) =>
        for item in response
          return @destroy() if !item?.serving_url
          @init(item)
          break
    else
      watcher = @$scope.$watch 'this.imagoimage.data', =>
        if !@$attrs.watch
          watcher()
          return @destroy() if !@data?.serving_url
        @init(@data)

  $onDestroy: ->
    watcher() for watcher in @watchers

  destroy: ->
    @$scope.$applyAsync =>
      @$scope.$destroy()
      @$element.remove()

  init: (asset) ->
    @asset = asset
    @placeholderUrl = @asset.b64 or "#{@asset.serving_url}=s3"
    # @placeholderUrl = "#{@asset.serving_url}=s30"
    @resolution  = @asset.resolution.split('x')
    @assetRatio  = _.head(@resolution) / _.last(@resolution)
    @spacerStyle = paddingBottom: "#{_.last(@resolution) / _.head(@resolution) * 100}%"

    if @asset.fields?.crop?.value and not @$attrs.align
      @opts.align = @asset.fields.crop.value
    if @asset.fields?.sizemode?.value and \
      @asset.fields.sizemode.value isnt 'default' and not @$attrs.sizemode
        @opts.sizemode = @asset.fields.sizemode.value

    if @opts.responsive
      @watchers.push @$rootScope.$on 'resize', =>
        return unless @visible
        @$scope.$applyAsync =>
          @getSize()
          @resize()

      @watchers.push @$rootScope.$on 'resizestop', =>
        return unless @visible
        @$scope.$applyAsync =>
          @getSize()
          @resize()
          @getServingUrl()


    # console.log '@opts', @opts
    # unless @opts.width or @opts.height
      # @$scope.$applyAsync =>
      # console.log 'asdf', @opts.width or @opts.height, @opts.width, @opts.height


    @$scope.$applyAsync =>
      if @$attrs.width or @$attrs.height
        @width  = parseInt @$attrs.width  or 0
        @height = parseInt @$attrs.height or 0
      else
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

      # console.log '@width, @height, @mainSide', @width, @height, @mainSide, @opts.sizemode,

      # lazy true
      if @opts.lazy and not @visible
        watcher = @$scope.$watch 'imagoimage.visible', (value) =>
          return unless value
          watcher()
          @resize()
          @getServingUrl()

      else
        @getSize()
        @resize()
        @getServingUrl()

  getSize: ->
    @width  = @$element.children()[0].clientWidth
    @height = @$element.children()[0].clientHeight
    # console.log "getSize #{@width}x#{@height}"

  setServingSize: (servingSize) =>
    return if !@sliderCtrl
    @sliderCtrl.setServingSize(servingSize)

  inview: (inview) ->
    @visible = inview
    @getSize()
    @resize()
    @getServingUrl()

  resize: ->
    # console.log "resize #{@width}x#{@height}"
    if @mainSide not in ['autoheight', 'autowidth']
      @wrapperRatio = @width / @height
      if @opts.sizemode is 'crop'
        @mainSide = if @assetRatio < @wrapperRatio then 'width' else 'height'
      else
        @mainSide = if @assetRatio > @wrapperRatio then 'width' else 'height'
      # console.log "resize INNER #{@width}x#{@height}"

  getServingUrl: ->
    # @visible = true

    return @destroy() unless @asset?.serving_url

    # console.log "before: #{@width}x#{@height}"

    if @mainSide is "autoheight"
      servingSize = Math.round(Math.max(@height, @height * @assetRatio))

    # else if @mainSide is "autowidth"
    #   servingSize = Math.round(Math.max(@height, @height * @assetRatio))

    else if @opts.sizemode is 'crop' and @height
      if @assetRatio <= @wrapperRatio
        # console.log 'crop full @width'
        servingSize = Math.round(Math.max(@width, @width / @assetRatio))
      else
        # console.log 'crop full @height'
        servingSize = Math.round(Math.max(@height, @height * @assetRatio))


    else # sizemode fit
      if @assetRatio <= @wrapperRatio and @height
        # console.log 'fit full height', 'asset', @assetRatio, 'wrapper', @wrapperRatio,  "#{@height * @assetRatio} x #{@height}"
        servingSize = Math.round(Math.max(@height, @height * @assetRatio))
      else
        # console.log 'fit full width', 'asset', @assetRatio, 'wrapper', @wrapperRatio,    "#{@width} x #{@width / @assetRatio}"
        servingSize = Math.round(Math.max(@width, @width / @assetRatio))

    servingSize = parseInt Math.min(servingSize * (Math.ceil(window.devicePixelRatio, 1) or 1), @opts.maxsize)

    # make sure we only load a new size
    # console.log 'new size, old size', servingSize, @servingSize, @width, @height
    if servingSize is @servingSize
      @loaded = true
      return

    @servingSize = Math.max servingSize, 60

    @opts.servingUrl = "#{ @asset.serving_url }=s#{ @servingSize * @opts.scale }"

    @setServingSize("=s#{ servingSize * @opts.scale }")

    @render()

  render: =>
    img = angular.element('<img>')
    img.on 'load', =>
      @$scope.$applyAsync =>
        @imgUrl = @opts.servingUrl
        @loaded = true

    img[0].src = @opts.servingUrl
