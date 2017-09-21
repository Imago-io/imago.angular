class ImagoContact extends Directive

  constructor:->

    return {

      restrict: 'E'
      scope:
        status: '=status'
        error:  '=error'
      controller: 'imagoContactController as contact'
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-contact.html'

    }

class ImagoContactController extends Controller

  constructor: ($scope, imagoSubmit) ->
    @data =
      subscribe: false

    @submitForm = (isValid) =>
      return unless isValid
      imagoSubmit.send(@data).then (result) =>
        $scope.status  = @status = result.status
        $scope.message = @error  = result.message or ''
