class imagoContact extends Directive

  constructor:->

    return {

      restrict: 'E'
      scope: true
      controller: 'imagoContactController as contact'
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-contact.html'

    }

class imagoContactController extends Controller

  constructor: (imagoSubmit) ->
    @data =
      subscribe: true

    @submitForm = (isValid) =>
      return unless isValid
      imagoSubmit.send(@data).then (result) =>
        @status = result.status
        @error  = result.message or ''