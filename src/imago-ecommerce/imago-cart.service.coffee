class imagoCart extends Service

  show: false
  itemsLength: 0
  settings: []
  messages: []


  constructor: (@$q, @$rootScope, @$timeout, @$location, @$window, @$http, @imagoUtils, @imagoModel, @fulfillmentsCenter, @geoIp, @tenantSettings, @imagoCartUtils) ->

    @cart =
      items: []

    return @onSettings() if @tenantSettings.loaded

    @$rootScope.$on 'settings:loaded', (evt, message) =>
      @onSettings()

  onSettings: ->
    @currencies = @$rootScope.tenantSettings.currencies
    if @$rootScope.tenantSettings.maxQtyPerItem?.active
      @maxQtyPerItem = @$rootScope.tenantSettings.maxQtyPerItem?.value
    # console.log '@maxQtyPerItem', @maxQtyPerItem
    @checkGeoIp()
    local = @imagoUtils.cookie('imagoCart')
    @checkStatus(local) if local


  checkGeoIp: ->
    unless @geoIp.loaded
      @checkCurrency()
      watcher = @$rootScope.$on 'geoip:loaded', (evt, data) =>
        @checkCurrency()
        watcher()
    else
      @checkCurrency()

  checkCurrency: ->
    currency = @imagoUtils.CURRENCY_MAPPING[@geoIp.data.country] unless _.isEmpty @geoIp.data
    if currency and @currencies and currency in @currencies
      @currency = currency
    else if @currencies?.length
      @currency = @currencies[0]
    else
      console.log 'you need to enable at least one currency in the settings'

    @$rootScope.$emit 'imagocart:currencyloaded'

    return unless @cart
    if @cart.currency isnt @currency
      @cart.currency = angular.copy @currency
      @update()
    @calculate()

  checkStatus: (id) =>
    @$http.get("#{@imagoModel.host}/api/carts?cartid=#{id}").then (response) =>
      # console.log 'check cart', response.data
      _.assign @cart, response.data
      unless @fulfillmentsCenter.loaded
        watcher = @$rootScope.$on 'fulfillments:loaded', (evt, data) =>
          @statusLoaded()
          watcher()
      else
        @statusLoaded()

  statusLoaded: ->
    update = false
    for item in @cart.items
      item.stock = Number(item.fields?.stock?.value?[@fulfillmentsCenter.selected._id])
      item = @imagoCartUtils.updateChangedItem(item)
      if item.stock <= 0 and !item.presale
        @newmessages = true
        @show = true
        update = true
        @messages.push
          item : item
          type : 'nostock'
        _.remove(@cart.items, {_id: item._id})
      else if item.updates?.length
        @newmessages = true
        @show = true
        update = true

    @currency = angular.copy(@cart.currency) unless @currency
    @update() if update
    @calculate()
    @checkGeoIp()

  checkCart: =>
    if @cart._id
      return @$q.resolve('update')

    @create(@cart).then (response) =>
      _.assign @cart, response.data
      @imagoUtils.cookie('imagoCart', response.data._id)
      return response.data

  create: (cart) =>
    return @$http.post("#{@imagoModel.host}/api/carts", cart)

  add: (item, options, fields, cartOptions) ->
    # console.log 'cartOptions', cartOptions
    return console.log 'item required' unless item
    return console.log 'no stock' if (item.stock <= 0 or !item.stock) and !item.presale

    item.qty or= 1
    item.finalsale = item.fields?.finalSale?.value
    item.presale = item.fields?.presale?.value

    if _.isArray(options) and options?.length
      item.options = {}
      for option in options
        item.options[option] = item.fields[option]
    else if _.isPlainObject options
      item.options = options

    if item.options?.name
      item.name = item.options.name
      delete item.options.name

    parent = @imagoModel.find {'_id' : item.parent}

    if parent
      item.name = parent.fields?.title?.value unless item.name
      item.serving_url = parent.serving_url unless item.serving_url
      item.fields?.title?.value = parent.fields?.title?.value
      item.fields?.description?.value = parent.fields?.description?.value
      if _.isArray(fields) and fields.length
        for field in fields
          item.fields[field] = parent.fields[field]
      else if _.isPlainObject fields
        _.assign item.fields, parent.fields

    copy = angular.copy item
    filter = _.find @cart.items, { _id: copy._id }

    if copy.fields?.discountedPrice?.value?[@currency]
      copy.price = copy.fields.discountedPrice.value
    else
      copy.price = copy.fields.price.value

    copy.link = @$location.url()

    if filter
      filter.name = copy.name unless filter.name
      filter.qty += copy.qty
      filter.qty = Math.min(filter.stock, @maxQtyPerItem or filter.qty, filter.qty)
      _.assign filter.options, copy.options
      _.assign filter.fields, copy.fields
    else
      @cart.items.push copy

    if !cartOptions?.silent
      @$timeout => @show = true
    @calculate()

    # console.log '@cart', @cart

    @checkCart().then (response) =>
      @update() if response is 'update'

  update: =>
    return unless @cart._id
    @$rootScope.$emit 'imagocart:update'
    @$http.put("#{@imagoModel.host}/api/carts/#{@cart._id}", @cart)

  remove: (item) =>
    _.remove(@cart.items, {'_id': item._id})
    @calculate()
    @update()

  clear: ->
    @cart.items = []
    @calculate()
    @update()

  calculate: ->
    @itemsLength = 0
    @subtotal = 0

    unless @cart.items.length
      @subtotal = 0
      @itemsLength = 0
      return

    for item in @cart.items
      @itemsLength += item.qty
      continue unless item.qty and item.price?[@currency]
      @subtotal += item.qty * item.price[@currency]

  checkout: ->
    url = "https://#{@tenantSettings.tenant}.imago.io/account/checkout/#{@cart._id}"

    decorated = ''
    ga? (tracker) =>
      linker = new (@$window.gaplugins.Linker)(tracker)
      decorated = linker.decorate(url, true)

    @$window.location.href = decorated or url
