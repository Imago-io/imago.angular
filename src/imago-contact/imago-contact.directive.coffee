class imagoContact extends Directive

  constructor:->

    return {

      scope: {}
      controller: 'imagoContactController as contact'
      templateUrl: (element, attrs) ->
        return attrs.templateurl or '/imago/imago-contact.html'

    }

class imagoContactController extends Controller

  constructor: (imagoSubmit) ->

    @data =
      subscribe: true

    @submitForm = (isValid) =>
      return unless isValid
      imagoSubmit.send(@data).then (result) =>
        @status = result.status
        @error = result.message or ''