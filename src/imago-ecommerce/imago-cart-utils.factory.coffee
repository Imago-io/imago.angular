class ImagoCartUtils extends Factory

  constructor: ->

    return {

      updateChangedItem: (item) ->
        item.updates = []
        return item unless item.changed.length
        item.finalsale = item.fields?.finalSale?.value
        item.presale = item.fields?.presale?.value
        if item.qty > item.stock and !item.presale
          item.qty = item.stock
          item.updates.push 'quantity'
        if 'price' in item.changed
          item.price = item.fields?.price?.value
          item.updates.push 'price'
        if 'discountedPrice' in item.changed and item.fields?.discountedPrice?.value?[@currency]
          item.price = item.fields?.discountedPrice?.value
          item.updates.push('price') unless 'price' in item.updates

        return item

    }
