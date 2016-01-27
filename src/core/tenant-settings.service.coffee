class TenantSettings extends Service

  data: {}
  loaded: false

  constructor: (@$http, @$rootScope, @imagoModel) ->
    @get()

  get: ->
    @$http.get("#{@imagoModel.host}/api/settings").then (response) =>
      @reorder response.data

  reorder: (data) ->
    @data = {}

    for item in data
      @data[item.name] = item.value

    tmp = {}
    for item in @data.settings
      tmp[item.name] = item.value
    @data.settings = tmp

    @$rootScope.tenantSettings = @data
    @loaded = true
    @$rootScope.$emit 'settings:loaded', @data
