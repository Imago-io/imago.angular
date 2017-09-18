class FocusElement extends Directive

  constructor: ($timeout) ->
    return {

      link: (scope, element, attrs) ->
        return unless element[0]
        $timeout =>
          element[0].focus()
        , 1000

    }
