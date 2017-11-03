class imagoFindPrice extends Component

  constructor: ->

    return {

      controller: 'imagoFindPriceController as findprice'
      bindings:
        options: '=variants'
        product: '='
        attributes: '@'
      templateUrl: ($attrs) ->
        return $attrs.templateUrl or '/imago/imago-find-price.html'

    }

class imagoFindPriceController extends Controller

  constructor: ($scope, $parse, @imagoCart) ->
    @attrs = $parse(@attributes)()

    initWatcher = =>
      toWatchProperties = ['findprice.imagoCart.currency', 'findprice.options']
      createWatchFunc = (name) =>
        toWatchProperties.push(=> @product[name])

      if @attrs
        for name in @attrs
          createWatchFunc(name)

      $scope.$watchGroup toWatchProperties, =>
        @findOpts()

    watch = $scope.$watch 'findprice.product', (value) ->
      return unless value
      watch()
      initWatcher()

  findOpts: ->
    return unless @imagoCart.currency and @options?.length and @product
    @variants = _.cloneDeep @options

    if @attrs
      for name in @attrs
        continue unless @product[name]
        @variants = _.filter @variants, (item) =>
          return @product[name] is item.fields?[name]?.value

    @findPrice()

  findPrice: ->
    @prices = []
    @discounted = false

    for option in @variants
      if option.fields?.discountedPrice?.value?[@imagoCart.currency]
        @prices.push option.fields.discountedPrice.value[@imagoCart.currency]
        @discounted = true
      @prices.push option.fields.price.value[@imagoCart.currency]

    return unless @prices.length
    @highest = Math.max.apply(Math, @prices)
    @lowest  = Math.min.apply(Math, @prices)

    # console.log '@prices', @prices
    # console.log '@highest', @highest
    # console.log '@lowest', @lowest

