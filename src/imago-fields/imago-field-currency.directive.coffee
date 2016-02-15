class ImagoFieldCurrency extends Directive

  constructor: ->

    return {

      replace: true
      require: 'ngModel'
      scope:
        currencies: '='
        ngModel: '='
        save: '&ngChange'
      transclude: true
      templateUrl: '/imago/imago-field-currency.html'

      link: (scope, element, attrs, ngModelController) ->
        return console.log 'no currencies!!' unless scope.currencies?.length

        scope.currency = scope.currencies[0]

        scope.$watchCollection 'ngModel', (value) ->
          return scope.notComplete = true if !_.isPlainObject scope.ngModel
          for currency in scope.currencies
            return scope.notComplete = true unless angular.isDefined scope.ngModel[currency]
          return scope.notComplete = false

        scope.update = (value) ->
          for key of value
            value[key] = parseFloat value[key]
          ngModelController.$setViewValue(value)
          ngModelController.$render()
          scope.save()

    }

class imagoFilterCurrency extends Directive

  constructor: ->

    return {

      require: 'ngModel'
      link: (scope, elem, attrs, ctrl) ->

        ctrl.$formatters.unshift (value) ->
          if angular.isDefined(value) and not _.isNull(value)
            value = (value / 100).toFixed(2)
          if isNaN(value)
            value = undefined
          return value

        ctrl.$parsers.unshift (viewValue) ->
          # console.log 'viewValue', viewValue, (document.activeElement is elem[0])
          # return viewValue if document.activeElement is elem[0]
          if viewValue
            plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, "")
            plainNumber = parseFloat(plainNumber * 100)
            # console.log 'plainNumber', (plainNumber / 100).toFixed(2)
            # ctrl.$setViewValue((plainNumber / 100).toFixed(2))
            # ctrl.$render()
            plainNumber = plainNumber.toFixed(2)
            return plainNumber
          else
            return undefined

    }
