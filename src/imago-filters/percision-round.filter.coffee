class PercisionRound extends Filter

  constructor: () ->
    return (number, precision=2) ->
      factor = Math.pow(10, precision)
      return Math.round(number * factor) / factor
