class ImagoSubscribe extends Directive

  constructor: ->

    return {

      require: 'form'
      transclude: true
      controller: 'imagoSubscribeController as imagosubscribe'
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-subscribe.html'

    }

class ImagoSubscribeController extends Controller

  constructor:($scope, $attrs, $http, $parse, imagoModel) ->

    @submit = (validate) ->
      return if validate.$invalid
      form = $parse($attrs.data)($scope)

      @submitted = true

      $http.post("#{imagoModel.host}/api/subscribe", form).then (response) =>
        @error = false
        console.log 'response', response
      , (error) ->
        @error = true
        console.log 'error', error
