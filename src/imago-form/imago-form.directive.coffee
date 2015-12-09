class imagoForm extends Directive

  constructor: (imagoSubmit)->
    return {
      scope: {}
      replace: true
      transclude: true
      templateUrl: '/imago/imago-form.html'
      link: (scope, element, attr, cntrl, transclude) ->

        scope.data = {}

        transclude scope, (clone, scope) ->
          element.append(clone)

        scope.submitForm = (isValid) =>
          return unless isValid
          imagoSubmit.send(scope.data).then (result) =>
            scope.status = result.status
            scope.error = result.message or ''
            if scope.status
              scope.data = {}

    }
