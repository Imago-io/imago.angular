class FulfillmentsCenter extends Service

  data: []
  loaded: false
  selected: {}

  constructor: (@$http, @$rootScope, @geoIp, @imagoModel, @imagoUtils) ->
    @get()

  get: ->
    @$http.get(@imagoModel.host + '/api/fulfillmentcenters').then (response) =>
      @data = response.data
      @getOptions()

  getOptions: ->
    if @data.length is 1
      @selected = @data[0]
      @loaded = true
      return @$rootScope.$emit 'fulfillments:loaded', @data

    if @geoIp.data?.country
      @geoValid()
    else if @geoIp.data is null
      @getGeneric()
    else if not @geoIp.loaded
      watcher = @$rootScope.$on 'geoip:loaded', (evt, data) =>
        watcher()
        if @geoIp.data?.country
          @geoValid()
        else
          @getGeneric()

  getGeneric: ->
    @selected = _.find @data, (ffc) -> !ffc.countries.length
    @$rootScope.$emit('fulfillments:loaded', @data)
    @loaded = true

  geoValid: ->
    @selected = _.find @data, (ffc) => @geoIp.data.country in ffc.countries
    if @selected
      @$rootScope.$emit('fulfillments:loaded', @data)
      @loaded = true
      return
    else
      @getGeneric()
