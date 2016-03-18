class ImagoCartMessages extends Directive

  constructor: ->

    return {

      restrict: 'E'
      scope:
        item: '=imagoCartMessages'
      templateUrl: '/imago/imago-cart-messages.html'

    }
