class TenantSettings extends Service

  data: {}
  loaded: false

  constructor: (@$http, @$rootScope, @imagoModel) ->
    @get()

  get: ->
    @$http.get("#{@imagoModel.host}/api/settings").then (response) =>
      @tenant = _.find(response.data, {name: 'tenant'})?.value
      @reorder response.data

  reorder: (data) ->
    @data = {}

    for item in data
      @data[item.name] = item.value

    tmp = {}
    for item in @data.settings
      tmp[item.name] = item.value
    @data.settings = tmp

    # overwrite status from server
    for setting in ['createsend', 'mailchimp']
      if @data[setting]
        if @data[setting].connected and @data[setting].active
          @data[setting].status = 'green'
        else
          @data[setting].status = 'amber'


    @$rootScope.tenantSettings = @data
    @loaded = true
    @$rootScope.$emit 'settings:loaded', @data
