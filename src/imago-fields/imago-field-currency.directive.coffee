class ImagoFieldCurrency extends Directive

  constructor: ->

    return {

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
      link: (scope, element, attrs, ctrl) ->

        element.on 'blur', ->
          ctrl.$render()

        formatView = (value) ->
          if angular.isDefined(value) and not _.isNull(value)
            value = (value / 100).toFixed(2)
          if isNaN(value)
            value = undefined
          return value

        ctrl.$formatters.push (value) ->
          return formatView(value)

        ctrl.$parsers.push (value) ->
          if value
            plainNumber = value.replace(/[^\d|\-+|\.+]/g, "")
            plainNumber = parseFloat(plainNumber).toFixed(2) * 100
            ctrl.$setViewValue(formatView(plainNumber))
            return plainNumber
          else
            return undefined

    }
