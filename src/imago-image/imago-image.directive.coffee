class imagoImage extends Directive

  constructor: ($timeout, imagoModel) ->

    return {

      scope: true
      templateUrl: '/imago/imago-image.html'
      controller: 'imagoImageController as imagoimage'
      require: '?^imagoSlider'
      bindToController: true
      link: (scope, element, attrs, imagoSlider) ->

        destroy = ->
          scope.$destroy()
          element.remove()

        if attrs.imagoImage.match(/[0-9a-fA-F]{24}/)
          watcher = attrs.$observe 'imagoImage', (data) ->
            return unless data
            watcher()
            data = imagoModel.find('_id': data)
            unless data.serving_url
              return destroy()
            scope.imagoimage.init(data)
        else
          watcher = scope.$watch attrs.imagoImage, (data) =>
            return unless data
            watcher()
            unless data.serving_url
              return destroy()
            scope.imagoimage.init(data)

    }

class imagoImageController extends Controller

  constructor: (@$rootScope, @$attrs, @$scope, @$element, @$timeout) ->

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
      preventDrag : true

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
        @resize()

      @watchers.push @$rootScope.$on 'resizestop', =>
        @resize()

    @$scope.$on '$destroy', =>
      watcher() for watcher in @watchers

  init: (data) ->
    @data = data
    @resolution =  @data.resolution.split('x')
    @assetRatio = _.first(@resolution) / _.last(@resolution)
    @spacerStyle = paddingBottom: "#{_.last(@resolution) / _.first(@resolution) * 100}%"

    if @data.fields?.crop?.value and not @$attrs.align
      @opts.align = @data.fields.crop.value
    if @data.fields?.sizemode?.value and \
      @data.fields.sizemode.value isnt 'default' and not @$attrs.sizemode
        @opts.sizemode = @data.fields.sizemode.value

    if @opts.lazy is false
      @removeInView = true

    if @opts.lazy and not @visible
      watcher = @$scope.$watch 'imagoimage.visible', (value) =>
        return unless value
        watcher()
        @getServingUrl()
    else
      @$scope.$applyAsync =>
        @getServingUrl()

  resize: ->
    return unless @visible
    @width  = @$element.children()[0].clientWidth
    @height = @$element.children()[0].clientHeight

    @wrapperRatio = @width / @height
    return unless @height

    console.log '@wrapperRatio, @assetRatio', @wrapperRatio, @assetRatio, @height, @data._id, @visible
    if @opts.sizemode is 'crop'
      @mainSide = if @assetRatio < @wrapperRatio then 'width' else 'height'
    else
      @mainSide = if @assetRatio > @wrapperRatio then 'width' else 'height'

  getServingUrl: ->
    @visible = true
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
        console.log 'fit full height', @width, @height, @assetRatio, @height * @assetRatio
        servingSize = Math.round(Math.max(@height, @height * @assetRatio))
      else
        console.log 'fit full width', @width, @height, @assetRatio, @wrapperRatio
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

  render: =>
    img = angular.element('<img>')
    img.on 'load', =>
      @$scope.$applyAsync =>
        # @imageStyle =
        #   backgroundImage: "url(#{@opts.servingUrl})"
        #   backgroundSize: if @assetRatio < @wrapperRatio then '100% auto' else 'auto 100%'
        #   backgroundPosition: @opts.align
        @imgUrl = @opts.servingUrl
        @loaded = true

    img[0].src = @opts.servingUrl
