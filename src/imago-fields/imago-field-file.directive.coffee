class ImagoFieldFile extends Directive

  constructor: ->

    return {

      replace: true
      require: 'ngModel'
      scope:
        ngModel: '='
        sizeerror: '=?'
        label: '<?'
        maxFileSize: '<?'
        allowedFileTypes: '<?'
      transclude: true
      templateUrl: '/imago/imago-field-file.html'

      link: (scope, element, attrs, ngModelController) ->

        scope.maxFileSize or= 5
        scope.sizeerror = false
        scope.label or= 'Select Files'
        # scope.allowedFileTypes or= ['jpg','pdf','png']

        label = element.find 'label'
        input = element.find 'input'

        input.bind 'change', (changeEvent) ->
          scope.filename = changeEvent.target.value.split('\\').pop()
          reader = new FileReader

          reader.onload = (loadEvent) ->
            if loadEvent.total > 1024 * 1024 * scope.maxFileSize
              scope.$apply ->
                scope.sizeerror = true
              return

            scope.$apply ->
              scope.fileread = loadEvent.target.result

          reader.readAsDataURL changeEvent.target.files[0]


        scope.update = (value) ->
          console.log 'scope-update'
          # return if scope.disabled
          # value = !value
          # ngModelController.$setViewValue(value)
          # ngModelController.$render()
          # ngModelController.$setValidity('required', value) if attrs.required

    }


