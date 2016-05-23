class ImagoButtonConfirm extends Component

  constructor: ->

    return {

      bindings:
        action: '&'
      controller: 'imagoButtonConfirmController'
      templateUrl: '/imago/imago-button-confirm.html'
      transclude: true

    }

class ImagoButtonConfirmController extends Controller

  constructor: (@$timeout) ->

  onClick: (evt) ->
    if @confirm or evt.metaKey
      @action({$event: evt})
      @confirm = false
    else
      @confirm = true
