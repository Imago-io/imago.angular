class Page extends Controller

  constructor: (promiseData) ->
    for asset in promiseData
      @data = asset
      break
