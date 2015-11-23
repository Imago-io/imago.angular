class Price extends Filter

  constructor: (imagoUtils) ->
    return (price, decimal = 2) ->
      return if _.isUndefined price
      format = 1000.5.toLocaleString()
      price = Number(price) / 100
      dec = format.charAt(5)
      thousand = format.charAt(1)
      return price if dec not in ['.', ',']
      return imagoUtils.formatCurrency(price, decimal, dec, thousand)