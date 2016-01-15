class imagoImage extends Directive

  constructor: (imagoModel) ->

    return {

      scope: true
      templateUrl: '/imago/imago-image.html'
      controller: 'imagoImageController as imagoimage'
      require: '?^imagoSlider'
      bindToController: true
      link: (scope, element, attrs, imagoSlider) ->

        destroy = ->
          scope.$applyAsync ->
            scope.$destroy()
            element.remove()

        if attrs.imagoImage.match(/[0-9a-fA-F]{24}/)
          watcher = attrs.$observe 'imagoImage', (asset) ->
            return unless asset
            watcher()
            asset = imagoModel.find('_id': asset)
            unless asset.serving_url
              return destroy()
            scope.imagoimage.init(asset)
        else
          watcher = scope.$watch attrs.imagoImage, (asset) =>
            return unless asset
            watcher()
            unless asset.serving_url
              return destroy()
            scope.imagoimage.init(asset)

    }

class imagoImageController extends Controller

  constructor: (@$rootScope, @$attrs, @$scope, @$element) ->

    @loaded     = false
    @imageStyle = {}
    @watchers   = []
    @dpr = Math.ceil(window.devicePixelRatio, 1) or 1

    @opts =
      align       : 'center center'
      sizemode    : 'fit'
      autosize    : 'none'
      responsive  : true
      scale       : 1
      lazy        : true
      maxsize     : 4000
      placeholder : true
      allowDrag   : true

    for key of @$attrs
      continue unless @opts[key]
      if @$attrs[key] in ['true', 'false']
        @opts[key] = JSON.parse @$attrs[key]
      else if not isNaN @$attrs[key]
        @opts[key] = Number @$attrs[key]
      else
        @opts[key] = @$attrs[key]

    # console.log '@opts', @opts

    if @opts.responsive
      @watchers.push @$rootScope.$on 'resize', =>
        return unless @visible
        @$scope.$applyAsync =>
          @resize()

      @watchers.push @$rootScope.$on 'resizestop', =>
        return unless @visible
        @$scope.$applyAsync =>
          @resize()
          @getServingUrl()

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

    if @data.fields?.crop?.value and not @$attrs.align
      @opts.align = @data.fields.crop.value
    if @data.fields?.sizemode?.value and \
      @data.fields.sizemode.value isnt 'default' and not @$attrs.sizemode
        @opts.sizemode = @data.fields.sizemode.value

    if @opts.lazy is false
      @removeInView = true

    # lazy true
    if @opts.lazy and not @visible
      watcher = @$scope.$watch 'imagoimage.visible', (value) =>
        return unless value
        watcher()
        @$scope.$applyAsync =>
          @resize()
          @getServingUrl()

    else
      @$scope.$applyAsync =>
        @resize()
        @getServingUrl()

  resize: ->
    @width  = parseInt(window.getComputedStyle(@$element[0]).width) \
              or @$element.children()[0].clientWidth
    @height = parseInt(window.getComputedStyle(@$element[0]).height) \
              or @$element.children()[0].clientHeight

    @wrapperRatio = @width / @height
    return unless @height

    if @opts.sizemode is 'crop'
      @mainSide = if @assetRatio < @wrapperRatio then 'width' else 'height'
    else
      @mainSide = if @assetRatio > @wrapperRatio then 'width' else 'height'


  getServingUrl: ->
    @visible = true

    if @opts.sizemode is 'crop' and @height
      if @assetRatio <= @wrapperRatio
        # console.log 'crop full @width'
        servingSize = Math.round(Math.max(@width, @width / @assetRatio))
      else
        # console.log 'crop full @height'
        servingSize = Math.round(Math.max(@height, @height * @assetRatio))

    # sizemode fit
    else
      # # console.log 'assetratio: ', @assetRatio, 'wrapperraito: ' , @wrapperRatio
      # if not @height or @opts.autosize is 'height'
      #   @opts.autosize = 'height'
      #   # console.log '@opts.autosize inside', @opts.autosize, @width, height, @assetRatio, @opts.autosize
      #   servingSize = Math.round(Math.max(@width, @width / @assetRatio))

      # else if not @width or @opts.autosize is 'width'
      #   @opts.autosize = 'width'
      #   # console.log '@opts.autosize inside', @opts.autosize
      #   servingSize = Math.round(Math.max(@height, @height * @assetRatio))

      if @assetRatio <= @wrapperRatio
        # console.log 'fit full height', 'asset', @assetRatio, 'wrapper', @wrapperRatio,  "#{@height * @assetRatio} x #{@height}"
        servingSize = Math.round(Math.max(@height, @height * @assetRatio))
      else
        # console.log 'fit full width', 'asset', @assetRatio, 'wrapper', @wrapperRatio,    "#{@width} x #{@width / @assetRatio}"
        servingSize = Math.round(Math.max(@width, @width / @assetRatio))

    servingSize = parseInt Math.min(servingSize * @dpr, @opts.maxsize)

    # make sure we only load a new size
    # console.log 'new size, old size', servingSize, @servingSize, @width, @height
    if servingSize is @servingSize
      @loaded = true
      return

    @servingSize = Math.max servingSize, 60

    @opts.servingUrl = "#{ @data.serving_url }=s#{ @servingSize * @opts.scale }"

    # if imagoSlider
    #   imagoSlider.setServingSize("=s#{ servingSize * @opts.scale }")

    # console.log '@servingUrl', @servingUrl

    @render()

  render: =>
    img = angular.element('<img>')
    img.on 'load', =>
      @$scope.$applyAsync =>
        @imgUrl = @opts.servingUrl
        @loaded = true

    img[0].src = @opts.servingUrl
