class imagoImage extends Directive

  constructor: (imagoModel) ->

    return {

      restrict: 'E'
      scope: true
      templateUrl: '/imago/imago-image.html'
      controller: 'imagoImageController as imagoimage'
      require: '?^imagoSlider'
      bindToController: true
      link: (scope, element, attrs, imagoSlider) ->

        for key of attrs
          continue if _.isUndefined scope.imagoimage.opts[key]
          if attrs[key] in ['true', 'false']
            scope.imagoimage.opts[key] = JSON.parse attrs[key]
          else if not isNaN attrs[key]
            scope.imagoimage.opts[key] = Number attrs[key]
          else
            scope.imagoimage.opts[key] = attrs[key]

        destroy = ->
          scope.$applyAsync ->
            scope.$destroy()
            element.remove()

        if attrs.data.match(/[0-9a-fA-F]{24}/)
          watcher = attrs.$observe 'data', (asset) ->
            return unless asset
            watcher()
            imagoModel.getById(asset).then (response) ->
              return destroy() if !response?.serving_url
              scope.imagoimage.init(response)
        else if attrs.data.match(/^\//)
          imagoModel.getData(attrs.data).then (response) ->
            for item in response
              return destroy() if !item?.serving_url
              scope.imagoimage.init(item)
              break
        else
          watcher = scope.$watch attrs.data, (asset) ->
            return unless asset
            watcher()
            return destroy() if !asset.serving_url
            scope.imagoimage.init(asset)

        # Imago Slider

        scope.setServingSize = (servingSize) ->
          return unless imagoSlider
          imagoSlider.setServingSize(servingSize)

    }

class imagoImageController extends Controller

  constructor: (@$rootScope, @$attrs, @$scope, @$element, @$timeout, @$parse) ->

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
      placeholder : false
      allowDrag   : true
      width       : undefined
      height      : undefined
      path        : ''

    @$scope.$on '$destroy', =>
      watcher() for watcher in @watchers

  init: (asset) ->
    @asset = asset
    @placeholderUrl = @asset.b64 or "#{@asset.serving_url}=s3"
    @placeholderUrl = "#{@asset.serving_url}=s300"
    @resolution  = @asset.resolution.split('x')
    @assetRatio  = _.head(@resolution) / _.last(@resolution)
    @spacerStyle = paddingBottom: "#{_.last(@resolution) / _.head(@resolution) * 100}%"

    if @asset.fields?.crop?.value and not @$attrs.align
      @opts.align = @asset.fields.crop.value
    if @asset.fields?.sizemode?.value and \
      @asset.fields.sizemode.value isnt 'default' and not @$attrs.sizemode
        @opts.sizemode = @asset.fields.sizemode.value

    if @opts.lazy is false
      @removeInView = true

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


    # console.log '@opts', @opts.width, @opts.width
    # if @opts.width or @opts.height
    #   @$scope.$applyAsync =>
    #   console.log 'asdf', @opts.width or @opts.height, @opts.width, @opts.height


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

          # @$timeout =>
          #   @getServingUrl()
          # , 250

      else
        @getSize()
        @resize()
        @getServingUrl()
        # @$timeout =>
        #   @getServingUrl()
        # , 250


  getSize: ->
    @width  = @$element.children()[0].clientWidth
    @height = @$element.children()[0].clientHeight
    # console.log "getSize #{@width}x#{@height}"

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
    @visible = true

    # console.log "before: #{@width}x#{@height}"
    if @opts.sizemode is 'fitheight'
      servingSize = Math.round(Math.max(@height, @width * @assetRatio))

    else if @mainSide is "autoheight"
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

    @$scope.setServingSize("=s#{ servingSize * @opts.scale }")

    @render()

  render: =>
    img = angular.element('<img>')
    img.on 'load', =>
      @$scope.$applyAsync =>
        @imgUrl = @opts.servingUrl
        @loaded = true

    img[0].src = @opts.servingUrl
