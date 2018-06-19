class ImagoMakeurl extends Filter

  constructor: ->

    return (link) ->
      return unless link
      if link.match('^https?://|^/')
        return link
      else
        return 'http://' + link
