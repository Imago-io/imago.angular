class ImagoChecktarget extends Directive

  constructor: ->

    return {

      link: (scope, element, attrs) ->
        unless attrs.ngHref?.match('^/')
          element.attr('target', '_blank')

    }
