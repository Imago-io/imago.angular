class WebStorage extends Service

  store: {}

  constructor: (@$window) ->
    @valid = true

    test = 'imagoTestLocal'
    try
      @$window.localStorage.setItem test, test
      @$window.localStorage.removeItem test
    catch e
      @valid = false

  get: (key) ->
    if @valid
      value = @$window.localStorage.getItem(key)
      try
        angular.fromJson(value)
      catch e
        return value
      return angular.fromJson(value)

    # Fallback
    @store[key]

  set: (key, value) ->
    if @valid
      return @$window.localStorage.setItem(key, angular.toJson(value))

    # Fallback
    @store[key] = value

  remove: (key) ->
    if @valid
      return @$window.localStorage.removeItem(key)

    # Fallback
    delete @store[key]
