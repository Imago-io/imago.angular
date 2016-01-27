class ShippingCountries extends Service

  data: []
  loaded: false

  constructor: (@$http, @imagoModel) ->
    @get()

  get: ->
    @$http.get(@imagoModel.host + '/api/shippingmethods').then (response) =>

      for method in response.data
        for country in method.countries
          @data.push country

      @data = _.sortBy _.compact _.uniq @data
      @loaded = true
