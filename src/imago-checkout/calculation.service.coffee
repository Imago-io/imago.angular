class Calculation extends Service

  cart            : undefined
  costs           : {}
  coupon          : undefined
  stripe          : undefined
  currency        : undefined
  shippingmethods : undefined
  taxes           : undefined
  currencies      : undefined
  taxincluded     : undefined
  error           : {}

  constructor: (@$q, @$state, @$http, @$auth, @imagoUtils, @imagoSettings) ->
    @countries = @imagoUtils.COUNTRIES

  updateCart: =>
    @$http.put(@imagoSettings.host + '/api/carts/' + @cart._id, @cart)
    @calculate()

  deleteItem: (item) =>
    idx = _.findIndex @cart.items, {id: item.id}
    @cart.items.splice idx, 1
    @updateCart()

  changeAddress: (section, type) =>
    if @process.form['shipping_address']?.country and @differentshipping and type is 'country'
      @setCurrency(null, @process.form['shipping_address'].country)
    else if type is 'country'
      @setCurrency(null, @process.form[section].country)
    @[section] or= {}
    if @process.form[section].country in ['United States of America', 'United States', 'USA', 'Canada', 'Australia']
      @[section].disablestates = false
      if @process.form[section].country in ['United States of America', 'United States', 'USA']
        @[section].states = @imagoUtils.STATES['USA']
      else
        @[section].states = @imagoUtils.STATES[@process.form[section].country.toUpperCase()]
    else
      @[section].disablestates = true
      @[section].states = []
    @process.form[section].country_code = @imagoUtils.CODES[@process.form[section].country]

    if @process.form['shipping_address']?.country and @differentshipping
      @country = @process.form['shipping_address'].country
      @state   = @process.form['shipping_address'].state
      @zip     = @process.form['shipping_address'].zip
    else
      @country = @process.form[section].country
      @state   = @process.form[section].state
      @zip     = @process.form[section].zip

    @calculate()

  checkCoupon: (code) =>
    unless code
      @coupon = null
      @couponState = null
      @calculate()
      return

    @$http.get(@imagoSettings.host + '/api/coupons?code=' + code).then (response) =>
      if response.data.length is 1
        @coupon = response.data[0]
        @couponState = 'valid'
      else
        @coupon = null
        @couponState = 'invalid'
      @calculate()

  applyCoupon: (coupon, costs) =>
    unless coupon
      costs.discount = null
      return
    meta = coupon.meta
    @couponState = 'valid'

    if meta.type is 'flat'
      value = Math.min(costs.subtotal, meta.value[@currency])
      costs.discount = value
      # costs.subtotal = costs.subtotal - value
    else if meta.type is 'percent'
      percentvalue = Number((costs.subtotal * meta.value / 100).toFixed(0))
      costs.discount = percentvalue
      # costs.subtotal = costs.subtotal - percentvalue
    else if meta.type is 'free shipping'
      costs.discount = null
      codes = (code.toUpperCase() for code in meta.value) if meta.value?.length
      if meta.value?.length and (@shipping_options.code.toUpperCase() in codes)
        costs.shipping = 0
      else if not meta.value?.length
        costs.shipping = 0
      else
        @couponState = 'invalid'

  setCurrency: (currency, country) =>
    oldcurrency = angular.copy @currency
    if country
      currency = if @imagoUtils.inUsa(country) then 'USD' else \
                    @imagoUtils.CURRENCY_MAPPING[country]

    @currency = if currency in @currencies then currency else @currencies[0]
    @saveCart() if oldcurrency isnt @currency

  setShippingRates: (rates) =>
    if rates?.length
      rates = if _.isPlainObject(rates) then [rates] else rates
      rates = rates.sort (a, b) =>
        a.ranges[0].price[@currency] - b.ranges[0].price[@currency]
      @shippingRates = rates
    else
      @shippingRates = []

    if @shippingRates.length
      @shipping_options = @shippingRates[0]
      # @calculate()

  getShippingRate: =>
    deferred = @$q.defer()
    rates = @findShippingRate()
    # @setShippingRates(rates)
    deferred.resolve(rates)
    return deferred.promise

  findShippingRate: =>
    return unless @country

    if @imagoUtils.inUsa @country
      @country = 'United States'

    # get all rates for this country
    rates_by_country = _.filter @shippingmethods, (item) =>
      item.active and @country?.toUpperCase() in (c.toUpperCase() for c in item.countries)

    if @state
      # check if there is a rate specific for this state
      rates = _.filter rates_by_country, (item) => @state.toUpperCase() in (s.toUpperCase() for s in item.states)
      return rates if rates?.length

      # if we didnt find any rates yet check if there is a less specific rate.
      rates = _.filter(rates_by_country, (item) => !item.states.length)
      return rates if rates.length
      return _.filter(@shippingmethods, (item) -> !item.countries.length)

    else
      return rates_by_country if rates_by_country.length
      return _.filter @shippingmethods, (item) -> !item.countries.length

  changeShipping: =>
    @calcShipping(@shipping_options).then (response) =>
      @costs.shipping = response.shipping
      @calculate()

  calculateShipping: =>
    deferred = @$q.defer()

    return if @calculateShippingRunning
    @calculateShippingRunning = true

    @costs.shipping = 0

    @getShippingRate().then (rates) =>
      @calculateShippingRunning = false
      unless rates?.length
        @shipping_options = undefined
        @shippingRates = []
        @error.noshippingrule = true if @country
        return deferred.resolve()
      @error.noshippingrule = false
      for rate in rates
        @calcShipping(rate).then (response) =>
          if @shipping_options and @shipping_options._id is response.rate._id
            @costs.shipping = response.shipping
            deferred.resolve()
          else if not @shipping_options or _.difference(@shippingRates, rates).length
            @setShippingRates(rates)
            @costs.shipping = response.shipping
            deferred.resolve()

          rateFix = (response.shipping/100).toFixed(2)
          shipping = _.find @shippingRates, {'_id': response.rate._id}
          shipping.nameprice = "#{shipping.name} (#{@currency} #{rateFix})"

    return deferred.promise

  calcShipping: (rate) =>
    defer = @$q.defer()
    count = 0
    with_shippingcost = []
    shipping = 0
    for item in @cart.items

      if item.fields.overwriteShippingCosts?.value?[@currency]
        with_shippingcost.push(item)
      else if item.fields.calculateShippingCosts?.value
        if rate.type is 'weight'
          count += (item.fields.weight?.value or 1) * item.qty
        else
          count += item.qty

    if count is 0 and rate.type isnt 'weight' and not with_shippingcost.length
      defer.resolve({'shipping': 0, 'rate': rate})

    range = _.find rate.ranges, (range) -> count <= range.to_unit and count >= range.from_unit
    range = rate.ranges[rate.ranges.length - 1] or 0 if not range

    shipping = range.price[@currency] if count

    for item in with_shippingcost
      shipping += (item.fields.overwriteShippingCosts?.value?[@currency] or 0) * item.qty
    defer.resolve({'shipping': shipping, 'rate': rate})

    defer.promise


  calculateTax: ->
    deferred = @$q.defer()

    @getTaxRate().then =>
      @costs.tax = 0

      if @imagoUtils.includesTax(@currency)
        @costs.includedTax = 0
        if @costs.taxRate
          for item in @cart.items
            continue unless item.fields.calculateTaxes?.value
            onepercent = item.price[@currency]/(100+(@costs.taxRate*100)) * item.qty
            @costs.includedTax += onepercent*@costs.taxRate*100
          deferred.resolve()
        else
          deferred.resolve()
      else
        for item in @cart.items
          continue unless item.fields.calculateTaxes?.value
          if item.price[@currency]
            @costs.tax += Math.round(item.price[@currency] * item.qty * @costs.taxRate)
        deferred.resolve()
    return deferred.promise

  getTaxRate: =>
    deferred = @$q.defer()

    @costs.taxRate = 0
    # deferred.resolve() if @taxincluded
    deferred.resolve() if not @country

    tRate = @findTaxRate()
    return @getZipTax() if tRate.autotax and @imagoUtils.inUsa(@country)
    @costs.taxRate = tRate.rate / 100

    deferred.resolve()
    return deferred.promise

  findTaxRate: ->
    return {'rate': 0} if !@country

    if @country in ['United States of America', 'USA']
      @country = 'United States'

    rates_by_country = _.filter(@taxes, (item) => item.active and \
                                @country?.toUpperCase() in (c.toUpperCase() for c in item.countries))

    if !rates_by_country.length
      rates_by_country = _.filter(@taxes, (item) => item.active and !item.countries.length)

    if @state
      rate = _.find rates_by_country, (item) =>
          @state.toUpperCase() in (s.toUpperCase() for s in item.states)
      return rate if rate
      # if we didnt find any rates yet check if there is a less specific rate.
      rates = _.filter rates_by_country, (item) -> item.states.length is 0
      return rates?[0] or {'rate': 0}
    else
      return rates_by_country?[0] or {'rate': 0}

  getZipTax: =>
    deferred = @$q.defer()
    if not (@zip or (@zip?.length > 4))
      deferred.resolve()
    else
      @$http.get("#{@imagoSettings.host}/api/ziptax?zipcode="+@zip)
        .then (response) =>
          @costs.taxRate = response.data.taxUse
          deferred.resolve()
    return deferred.promise

  calculateTotal: =>
    @costs.total = 0
    @costs.total += @costs.subtotal if @costs.subtotal
    @costs.total -= @costs.discount if @costs.discount
    @costs.total += @costs.shipping if @costs.shipping
    # @costs.total += @costs.tax if @costs.tax and !@taxincluded
    @costs.total += @costs.tax if @costs.tax
    @costs.total


  checkStock: (cb) ->
    @cartError = {}

    @fcenter = _.find @fulfillmentcenters, (ffc) => @country in ffc.countries
    if !@fcenter
      # get the most generic one
      @fcenter = _.find @fulfillmentcenters, (ffc) -> !ffc.countries.length

    # if we cant find a suitable fulfillmentcenter execute the callback and move on
    return cb() if !@fcenter

    changed = false
    for item in @cart.items
      # stock = item.fields.stock?.value?[@fcenter._id] or 100000
      stock = if !_.isUndefined(item.fields.stock?.value?[@fcenter._id]) then item.fields.stock?.value?[@fcenter._id] else 100000
      if parseInt(stock) < item.qty and not item.fields?.presale?.value
        item.qty = stock
        changed = true

        @cartError[item._id] = {'maxStock': true} if stock != 0
        @cartError[item._id] = {'noStock': true} if stock is 0

    if changed
      @$http.put(@imagoSettings.host + '/api/carts/' + @cart._id, @cart)

    cb()


  calculate: =>
    @checkStock =>
      @costs =
        subtotal    : 0
        shipping    : 0
        tax         : 0
        includedTax : 0
        total       : 0

      for item in @cart.items
        if item.price[@currency] and item.qty
          @costs.subtotal += item.qty * item.price[@currency]
      @costs.total = @costs.subtotal

      @$q.all([@calculateTax(), @calculateShipping()]).then =>
        @applyCoupon(@coupon, @costs) if @coupon
        @calculateTotal()

  formatForm: (form) ->
    form.costs = angular.copy @costs
    form.costs.shipping_options = angular.copy @shipping_options
    form.costs.coupon = (if @coupon then angular.copy(@coupon) else null)
    form.shipping_address or= {}
    form.billing_address['phone']  = angular.copy @process.form.phone
    form.shipping_address['phone'] = angular.copy @process.form.phone
    form.fulfillmentcenter = angular.copy @fcenter?._id
    form.userData = {'browser': window.navigator?.userAgent}

    if not @differentshipping
      form.shipping_address = angular.copy @process.form['billing_address']

    return form

  submit: =>
    @process.form.items    = angular.copy @cart.items
    @process.form.currency = angular.copy @currency
    @process.form.cartId = angular.copy @cart._id
    @process.form.billing_address.name = angular.copy @process.form.user?.name
    @process.form = @formatForm(@process.form)

    return @$http.post(@imagoSettings.host + '/api/checkout', @process.form)

  saveCart: ->
    form = angular.copy @cart
    form.currency = @currency
    form.data = angular.copy @process.form
    form.data.paymentType = angular.copy @paymentType
    form.data.differentshipping = @differentshipping
    form.data = @formatForm(form.data)

    return @$http.put(@imagoSettings.host + '/api/carts/' + @cart._id, form)
