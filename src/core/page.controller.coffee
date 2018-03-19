class Page extends Controller

  constructor: (promiseData) ->
    return unless promiseData
    if promiseData.length == 1
      for asset in promiseData
        @data = asset
    else
      @data = promiseData

