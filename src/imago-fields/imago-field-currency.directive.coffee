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
      controller: 'imagoFieldCurrencyController as fieldcurrency'
      bindToController: true
      templateUrl: '/imago/imago-field-currency.html'

      link: (scope, element, attrs, ngModelController) ->
        return console.log 'no currencies!!' unless scope.fieldcurrency.currencies?.length

        scope.$watchCollection 'fieldcurrency.ngModel', ->
          return if !_.isPlainObject scope.fieldcurrency.ngModel
          scope.fieldcurrency.notComplete = {}
          for currency in scope.fieldcurrency.currencies
            continue if angular.isDefined scope.fieldcurrency.ngModel[currency]
            scope.fieldcurrency.notComplete[currency] = true

        scope.update = (value) ->
          for key of value
            value[key] = parseFloat value[key]
          ngModelController.$setViewValue(value)
          ngModelController.$render()
          scope.fieldcurrency.save()

    }

class ImagoFieldCurrencyController extends Controller

  constructor: ->
    return unless @currencies?.length
    @currency = angular.copy @currencies[0]


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
