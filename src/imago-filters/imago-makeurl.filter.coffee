class ImagoMakeurl extends Filter

  constructor: () ->

    return (link) ->
      if link.match('^https?://|^/')
        return link
      else
        return 'http://' + link
