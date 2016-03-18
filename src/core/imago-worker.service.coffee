class imagoWorker extends Service

  store: []
  supported: true

  constructor: (@$q, @$http) ->
    @windowURL = window.URL or window.webkitURL
    @test()

  test: ->
    scriptText = 'this.onmessage=function(e){postMessage(e.data)}'
    try
      blob = new Blob([scriptText], {type:'text/javascript'})
    catch e
      @supported = false
    return if @supported is false
    try
      @create @windowURL.createObjectURL(blob), 'imago'
    catch e
      @supported = false

  create: (path, data, defer) =>
    worker = new Worker(path)

    worker.addEventListener 'message', (e) =>
      defer.resolve(e.data) if defer
      worker.terminate()

    worker.postMessage data

  work: (data) =>
    if !data?.path
      return @$q.reject('invalid path')

    defer = @$q.defer()

    find = _.find @store, {'path': data.path}
    if @supported is false
      @create data.path, data, defer
    else if find
      @create find.blob, data, defer
    else
      @$http.get(data.path, {cache: true}).then (response) =>
        stringified = response.data.toString()
        blob = new Blob([stringified], {type: 'application/javascript'})
        blobURL = @windowURL.createObjectURL(blob)
        @store.push {'path': data.path, 'blob': blobURL}
        @create blobURL, data, defer

    defer.promise
