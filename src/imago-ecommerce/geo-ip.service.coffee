class GeoIp extends Service

  data: {}
  loaded: false

  constructor: (@$rootScope, @$http, @imagoUtils) ->
    @get()

  get: ->
    if @imagoUtils.cookie('countryGeo')
      @data.country = @imagoUtils.cookie('countryGeo')
      @$rootScope.$emit 'geoip:loaded', @data
      @loaded = true
      return
    @$http.get('//api.imago.io/geoip').then (response) =>
      @data = response.data
      @imagoUtils.cookie 'countryGeo', @data.country
      @$rootScope.$emit 'geoip:loaded', @data
      @loaded = true
    , (err) =>
      @data = null
      @$rootScope.$emit 'geoip:loaded', @data
      @loaded = true
