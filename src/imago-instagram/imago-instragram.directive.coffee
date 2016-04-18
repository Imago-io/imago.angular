class ImagoInstagram extends Directive

  constructor: ->

    return {

      restrict: 'E'
      scope: true
      controller: 'imagoInstagramController as instagram'
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-instagram.html'
    }

class ImagoInstagramController extends Controller

  constructor: ($scope, $http, $attrs, imagoModel) ->

    options =
      screen_name: $scope.$eval $attrs.user
      count:       $scope.$eval $attrs.count or 10

    throw 'Instagram: you need an user' unless options.screen_name

    $http.post("#{imagoModel.host}/api/social/instagram/feed", options).then (response) =>
      @data = response.data

    return

