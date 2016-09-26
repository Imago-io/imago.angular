class ImagoShare extends Component

  constructor: ->

    return {

      bindings:
        asset : '<'
        data  : '@'
      controller: 'imagoShareController as imagoshare'
      templateUrl: ($attrs) ->
        return $attrs.templateUrl or '/imago/imago-share.html'

    }

class ImagoShareController extends Controller

  constructor: (@$scope, @$location) ->

  $onInit: =>
    @init()

  $onChanges: (changes) =>
    return if !changes.asset.currentValue
    @init()

  init: ->
    if @asset?.path
      @location = "#{@$location.protocol()}://#{@$location.host()}#{@asset.path}"
    else
      @location = @$location.absUrl()

    @location = encodeURIComponent(@location)

    return console.log 'You need to specify one service at least.' unless @data

    options = @$scope.$eval @data

    if _.isArray options
      for item in options
        @$scope[item] = true
    else if @data is 'all'
      @$scope.all = true
