class imagoShare extends Directive

  constructor: ($compile, $templateCache, $http) ->

    return {

      scope:
        asset: "="
      controller: 'imagoShareController as imagoshare'
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-share.html'

    }

class imagoShareController extends Controller

  constructor: ($scope, $attrs, $location) ->
    @location = $location.absUrl()

    return console.log 'You need to specify one service at least.' unless $attrs.imagoShare

    options = $scope.$eval $attrs.imagoShare

    if _.isArray options
      for item in options
        @[item] = true
    else if $attrs.imagoShare is 'all'
      @all = true

