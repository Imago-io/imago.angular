class ImagoLinkify extends Filter

  constructor: ->
    return (_str, type) ->
      if not _str or not type
        return

      _text = _str.replace /(?:https?\:\/\/|www\.)+(?![^\s]*?")([\w.,@?!^=%&amp;:\/~+#-]*[\w@?!^=%&amp;\/~+#-])?/ig, (url) ->
        wrap = document.createElement('div')
        anch = document.createElement('a')
        anch.href = url
        anch.target = '_blank'
        anch.innerHTML = url
        wrap.appendChild anch
        wrap.innerHTML

      unless _text
        return ''

      # Twitter
      if type is 'twitter'
        _text = _text.replace(/(|\s)*@([\u00C0-\u1FFF\w]+)/g, '$1<a href="https://twitter.com/$2" target="_blank">@$2</a>')
        _text = _text.replace(/(^|\s)*#([\u00C0-\u1FFF\w]+)/g, '$1<a href="https://twitter.com/search?q=%23$2" target="_blank">#$2</a>')

      # Instagram
      if type is 'instagram'
        _text = _text.replace(/(|\s)*@([\u00C0-\u1FFF\w]+)/g, '$1<a href="https://instagram.com/$2" target="_blank">@$2</a>')
        _text = _text.replace(/(^|\s)*#([\u00C0-\u1FFF\w]+)/g, '$1<span class=\'hashtag\'>#$2</span>')

      #Github
      if type is 'github'
        _text = _text.replace(/(|\s)*@(\w+)/g, '$1<a href="https://github.com/$2" target="_blank">@$2</a>')

      return _text