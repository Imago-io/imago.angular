class NotSupported extends Component

  constructor: ->

    return {

      bindings:
        data: '@'
      templateUrl: '/imago/not-supported.html'
      controller: 'notSupportedController'

    }

class NotSupportedController extends Controller

  constructor: ($scope) ->

    @mobile = bowser.mobile

    options =
      ie      : 9
      firefox : 32
      chrome  : 30
      safari  : 6
      opera   : 23
      android : 4.3

    @data = $scope.$eval @data

    if _.isArray(@data)
      for option in @data
        version = option.match(/\d+/g)
        version = Number(version)
        continue if _.isNaN(version)
        for key of options
          options[key] = version if _.includes(option.toLowerCase(), key)

    browserVersion = Number(bowser.version)

    for browser, version of options
      if bowser.msie and browser is 'ie'
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true
      else if bowser.chrome and browser is 'chrome' and not bowser.android
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true
      else if bowser.android and browser is 'android'
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true
      else if bowser.firefox and browser is 'firefox'
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true
      else if bowser.opera and browser is 'opera'
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true
      else if bowser.safari and browser is 'safari'
        if browserVersion <= version
          @invalid = true
        else if _.isNaN version
          @invalid = true

      break if @invalid
