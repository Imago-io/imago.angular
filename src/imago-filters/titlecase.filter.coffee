class Normalize extends Filter

  constructor: (imagoUtils) ->
    return (string) ->
      return false unless string
      return imagoUtils.normalize(string)