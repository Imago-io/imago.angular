class CheckTarget extends Directive

  constructor: ->

    return {

      link: (scope, element, attrs) ->
        unless _.first(attrs.ngHref) is '/'
          element.attr('target', '_blank')

    }
