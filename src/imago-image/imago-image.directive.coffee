class imagoImage extends Directive

  constructor: ($timeout, imagoModel) ->

    return {

      scope: true
      templateUrl: '/imago/imago-image.html'
      controller: 'imagoImageController as imagoimage'
      require: '?^imagoSlider'
      bindToController: true
      link: (scope, element, attrs, imagoSlider) ->

        self =
          destroy: ->
            scope.$destroy()
            element.remove()

        if attrs.imagoImage.match(/[0-9a-fA-F]{24}/)
          self.watch = attrs.$observe 'imagoImage', (data) ->
            return unless data
            self.watch()
            data = imagoModel.find('_id': data)
            unless data.serving_url
              return self.destroy()
            scope.imagoimage.init(data)
        else
          self.watch = scope.$watch attrs.imagoImage, (data) =>
            return unless data
            self.watch()
            unless data.serving_url
              return self.destroy()
            scope.imagoimage.init(data)

    }

class imagoImageController extends Controller

  constructor: (@$rootScope, @$attrs, @$scope, @$element, @$timeout) ->

    @imageStyle = {}
    @loaded = false
    @dpr = Math.ceil(window.devicePixelRatio, 1) or 1

    @opts =
      align      : 'center center'
      sizemode   : 'fit'
      autosize   : 'none'
      responsive : true
      scale      : 1
      lazy       : true
      maxsize    : 4000

    for key of @$attrs
      continue unless @opts[key]
      if @$attrs[key] in ['true', 'false']
        @opts[key] = JSON.parse @$attrs[key]
      else if not isNaN @$attrs[key]
        @opts[key] = Number @$attrs[key]
      else
        @opts[key] = @$attrs[key]

    # @$rootScope.$on 'resizestop', =>
    #   @compile()

    @$rootScope.$on 'resize', =>
      @resize()


  init: (data) ->
    @data = data
    @resolution =  @data.resolution.split('x')
    @assetRatio = _.first(@resolution) / _.last(@resolution)
    @spacerStyle = paddingBottom: "#{_.last(@resolution) / _.first(@resolution) * 100}%"


    # @width  = @$element[0].clientWidth

    # if @width
    #   minWidthResolution = Math.min @resolution[0], 100

    # @resolution = [minWidthResolution, minWidthResolution/@assetRatio]

    if @data.fields?.crop?.value and not @$attrs.align
      @opts.align = @data.fields.crop.value
    if @data.fields?.sizemode?.value and \
      @data.fields.sizemode.value isnt 'default' and not @$attrs.sizemode
        @opts.sizemode = @data.fields.sizemode.value

    if @opts.lazy is false
      @removeInView = true

    # @$scope.$applyAsync =>
    #   @compile()



  resize: ->
    @width  = @$element[0].clientWidth
    @height = @$element[0].clientHeight

    @wrapperRatio = @width / @height if @height
    # debugger if not @height
    console.log 'resize', @wrapperRatio, @width, @height, @resolution
    # console.log 'fit', @fit = if @opts.assetRatio < @wrapperRatio then 'width' else 'height'

  compile: ->

    @resize()

    if @opts.sizemode is 'crop' and @height
      if @assetRatio <= @wrapperRatio
        # console.log 'crop full @width'
        servingSize = Math.round(Math.max(@width, @width / @assetRatio))
      else
        # console.log 'crop full @height'
        servingSize = Math.round(Math.max(@height, @height * @assetRatio))

    # sizemode fit
    else
      # console.log 'assetratio: ', @assetRatio, 'wrapperraito: ' , @wrapperRatio
      if not @height or @opts.autosize is 'height'
        @opts.autosize = 'height'
        # console.log '@opts.autosize inside', @opts.autosize, @width, height, @assetRatio, @opts.autosize
        servingSize = Math.round(Math.max(@width, @width / @assetRatio))

      else if not @width or @opts.autosize is 'width'
        @opts.autosize = 'width'
        # console.log '@opts.autosize inside', @opts.autosize
        servingSize = Math.round(Math.max(@height, @height * @assetRatio))

      else if @assetRatio <= @wrapperRatio
        # console.log 'fit full @height', width, @height, @assetRatio, @height * @assetRatio
        servingSize = Math.round(Math.max(@height, @height * @assetRatio))
      else
        # console.log 'fit full width', width, @height, @assetRatio, @wrapperRatio
        servingSize = Math.round(Math.max(@width, @width / @assetRatio))

    servingSize = parseInt Math.min(servingSize * @dpr, @opts.maxsize)

    # make sure we only load a new size
    # console.log 'new size, old size', servingSize, @servingSize, @width, @height
    if servingSize is @servingSize
      @loaded = true
      return

    @servingSize = Math.max servingSize, 320

    @opts.servingUrl = "#{ @data.serving_url }=s#{ @servingSize * @opts.scale }"

    # if imagoSlider
    #   imagoSlider.setServingSize("=s#{ servingSize * @opts.scale }")

    # console.log '@servingUrl', @servingUrl

    @render()

  render: ->
    if @opts.lazy and not @visible
      self.visibleFunc = @$scope.$watch 'imagoimage.visible', (value) =>
        return unless value
        self.visibleFunc()
        @visible = true
        @render()
    else
      img = angular.element('<img>')
      img.on 'load', =>
        @$scope.$applyAsync =>
          # @imageStyle =
          #   backgroundImage: "url(#{@opts.servingUrl})"
          #   backgroundSize: if @opts.assetRatio < @wrapperRatio then '100% auto' else 'auto 100%'
          #   backgroundPosition: @opts.align
          @imgUrl = @opts.servingUrl

          @loaded = true
      img[0].src = @opts.servingUrl
