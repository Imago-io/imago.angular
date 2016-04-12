class App extends App
  constructor: ->
      return [
          'lodash'
      ]


class imagoLoad extends Run

  constructor: ($window, $http) ->
    if $window.imagoSettings
      $http.defaults.headers.common.Authorization = "Basic #{$window.imagoSettings.apikey}:"