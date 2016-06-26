class TagFilter extends Filter

  constructor: (imagoUtils) ->
    return (input, tag) ->
      return unless input
      if tag
        filtered = []
        for asset in input
          tags = imagoUtils.getMeta(asset, 'tags')
          normtags = []
          normtags.push _.kebabCase(t) for t in tags

          filtered.push asset if normtags and _.kebabCase(tag) in normtags
        return filtered
      else
        return input