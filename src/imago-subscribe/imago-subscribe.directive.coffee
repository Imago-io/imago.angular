class ImagoSubscribe extends Directive

  constructor: ->

    return {

      require: 'form'
      restrict: 'A'
      transclude: true
      scope: true
      controller: 'imagoSubscribeController as imagosubscribe'
      bindToController:
        data: '='
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-subscribe.html'

    }

class ImagoSubscribeController extends Controller

  constructor:(@$scope, @$attrs, @$http, @imagoModel) ->

  submit: ->
    if @$attrs.name
      return if @$scope.$eval(@$attrs.name).$invalid

    @submitted = true

    @$http.post("#{@imagoModel.host}/api/subscribe", @data).then (response) =>
      @error = false
    , (error) ->
      @error = true
      @submitted = false
