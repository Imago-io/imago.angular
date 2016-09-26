class imagoCart extends Directive

  constructor: ->

    return {

      restrict: 'E'
      transclude: true
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-cart.html'
      controller: 'imagoCartController as cart'

    }

class imagoCartController extends Controller

  constructor: (@imagoCart, @$location) ->

  maxQty: (item) ->
    return unless item
    if item.presale
      @imagoCart.maxQtyPerItem or 100
    else
      Math.min @imagoCart.maxQtyPerItem or 100, item.stock



  goToProduct: (url) ->
    @$location.url(url)



