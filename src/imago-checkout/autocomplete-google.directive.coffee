class AutocompleteGoogle extends Directive

  constructor: ($parse, imagoUtils) ->

    return {

      require: 'ngModel'
      link: (scope, element, attrs, modelCtrl) ->
        return console.log 'the google library is not loaded' if !google?.maps
        return console.log 'you need a form to fill. Use the options attribute' if !attrs.autocompleteGoogle

        autocomplete = new google.maps.places.Autocomplete(element[0], types: ['geocode'])

        google.maps.event.addDomListener element[0], 'keydown', (e) ->
          e.preventDefault() if e.keyCode is 13

        viewValue = undefined
        place = undefined

        google.maps.event.addListener autocomplete, 'place_changed',  ->
          place = autocomplete.getPlace()
          return if !place.address_components

          # element.val(place.name)
          # form['street'] = place.name
          form = $parse(attrs.autocompleteGoogle)(scope)

          viewValue = place.name or modelCtrl.$viewValue;

          componentConf =
            locality: {label: 'city', value: 'long_name'}
            administrative_area_level_1: {label: 'state', value: 'short_name'}
            country: {label: 'country', value: 'long_name'}
            postal_code: {label: 'zip', value: 'short_name'}

          data = {}

          for elem in place.address_components
            type = elem.types[0]
            continue unless componentConf[type]
            data[componentConf[type].label] = elem[componentConf[type].value] or ''

          for label, value of data
            form[label] = value

          $parse(attrs.autocompleteOnsuccess)(scope) if attrs.autocompleteOnsuccess
          scope.$apply ->
            modelCtrl.$setViewValue(viewValue)
            modelCtrl.$render()

    }
