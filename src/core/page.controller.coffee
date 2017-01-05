class Page extends Controller

  constructor: (promiseData) ->
    if promiseData.length == 1
      for asset in promiseData
        @data = asset
    else
      @data = promiseData

