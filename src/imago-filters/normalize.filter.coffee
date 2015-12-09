class Normalize extends Filter

  constructor: ->
    return (string) ->
      return false unless string
      return _.kebabCase(string)