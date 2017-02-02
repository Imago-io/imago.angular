class imagoProduct extends Factory

  constructor: (imagoCart, fulfillmentsCenter) ->

    return class ProductInstance

      constructor: (@variants, options) ->
        return if !@variants?.length or !options

        for key of options
          @[key] = options[key]
        unless @optionsWhitelist
          return console.log 'no optionsWhitelist set.'
        @lowStock or= 3
        @getOptions()

      getOptions: ->
        # build an object with all values from the variants which are in the option white list
        @options = {}

        if @variants.length is 1
          for variant in @variants
            variant.stock = Number(variant.fields?.stock?.value?[fulfillmentsCenter.selected._id])
            variant.presale = variant.fields?.presale?.value
            variant.lowstock = if variant.stock <= @lowStock and variant.stock then true else false

          @selected = _.head @variants

        else
          for variant in @variants
            # onmit variants with no price in current currency
            continue unless angular.isDefined(variant.fields.price?.value?[imagoCart.currency])

            # build options
            for item in @optionsWhitelist
              continue unless variant.fields[item.name]?.value
              obj = {}
              for key of item
                obj[key] = variant.fields?[item[key]]?.value
              obj.normname = _.kebabCase(obj.name)
              @options[item.name] or= []
              @options[item.name].push obj

            # save stock and low stock
            variant.stock = Number(variant.fields?.stock?.value?[fulfillmentsCenter.selected._id])
            variant.presale = variant.fields?.presale?.value
            variant.lowstock = if variant.stock <= @lowStock and variant.stock then true else false

          # option massage
          for key of @options
            # uniqify options
            @options[key] = _.uniqBy @options[key], 'name'

            # if an option has only value select it
            if @options[key]?.length is 1
              @[key] = _.head(@options[key]).name

          # order values if custom order provided
          for item in @optionsWhitelist
            continue unless item.sortorder
            continue unless @options[item.name]
            @options[item.name].sort (a, b) ->
              item.sortorder.indexOf(a.name) - item.sortorder.indexOf(b.name)

          @selectVariant()

      setOption: (attr, value) ->
        @[attr] = value
        @selectVariant()

      findVariant: (field, value) ->
        opts = []

        for opt in @optionsWhitelist
          obj =
            name: opt.name
          obj.value = if obj.name is field then value else @[opt.name]
          return true unless obj.value
          opts.push obj

        item = _.find @variants, (variant) ->
          valid = true
          for opt in opts
            valid = false if _.kebabCase(variant.fields?[opt.name]?.value) isnt _.kebabCase(opt.value)
          return true if valid

        if item?.stock or item?.presale
          return true
        else
          return false

      selectVariant: ->
        keys = {}
        valid = true
        for key of @options
          valid = false unless @[key]
          keys[key] = @[key]

        return unless valid

        variant = _.find @variants, (item) =>
          valid = true
          for key of keys
            norm = _.kebabCase(item.fields?[key]?.value)
            return false if norm isnt _.kebabCase(@[key])

          return valid

        if !variant
          @selected = 0
          return

        variant.price = variant.fields?.price?.value
        variant.discountedPrice = variant.fields?.discountedPrice?.value
        @selected = variant

