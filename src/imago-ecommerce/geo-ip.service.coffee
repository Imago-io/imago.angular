class GeoIp extends Service

  data: {}
  loaded: false

  constructor: (@$rootScope, @$http, @imagoModel, @imagoUtils) ->
    @get()

  get: ->
    @$http.get("#{@imagoModel.geoip}").then (response) =>
      return @getCookie() if _.isEmpty response.data
      code = @imagoUtils.getCountryByCode(response.data.country_code)
      @imagoUtils.cookie 'countryGeo', response.data.country_code
      response.data.country = code
      @data = response.data
      @$rootScope.$emit 'geoip:loaded', @data
      @loaded = true
      return response.data
    , (err) =>
      @getCookie()

  getCookie: ->
    if @imagoUtils.cookie('countryGeo')
      @data.country = @imagoUtils.getCountryByCode(@imagoUtils.cookie('countryGeo'))
      @$rootScope.$emit 'geoip:loaded', @data
      @loaded = true
    else
      @data = null
      @$rootScope.$emit 'geoip:loaded', @data
      @loaded = true
