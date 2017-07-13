class NewlineToBr extends Filter

  constructor: (imagoUtils) ->
    return (string) ->
      return false unless string
      return imagoUtils.replaceNewLines(string)