class ImagoFieldCheckbox extends Directive

  constructor: ->

    return {

      replace: true
      require: 'ngModel'
      scope:
        ngModel: '='
      transclude: true
      templateUrl: '/imago/imago-field-checkbox.html'

      link: (scope, element, attrs, ngModelController) ->

        scope.disabled = true if attrs.disabled

        attrs.$observe 'disabled', (value) ->
          scope.disabled = value

        scope.update = (value) ->
          return if scope.disabled
          value = !value
          ngModelController.$setViewValue(value)
          ngModelController.$render()
          ngModelController.$setValidity('required', value) if attrs.required

    }