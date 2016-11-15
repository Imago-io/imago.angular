class imagoSubmit extends Service

  constructor: ($http, imagoUtils, imagoModel) ->

    return {

      formatForm: (form) ->
        defaultFields = ['message', 'subscribe']
        obj = {}
        _message = ''
        for key, value of form
          unless key in defaultFields or _.isPlainObject(value) or value.match? /data:/
            _message += "<b>#{_.startCase(key)}</b>: #{value}<br><br>"
          obj[key] = value or ''
        originalMsg =  imagoUtils.replaceNewLines(obj.message or '')
        obj.message = _message + "<b>Message</b>:<br><br> #{originalMsg}<br><br>"

        return obj

      send: (data) ->
        postUrl =  imagoModel.host + '/api/contact'

        $http.post(postUrl, @formatForm(data)).then (response) =>
          console.log 'success: ', response
          return {status: true, message: ""}
        , (error) ->
          console.log 'error: ', error
          return {status: false, message: "could not connect to Server."}

    }