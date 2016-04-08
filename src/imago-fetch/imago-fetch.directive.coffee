class ImagoFetch extends Directive

  constructor: (imagoModel, imagoUtils) ->

    return {

      restrict: 'AE'
      templateUrl: '/imago/imago-fetch.html'
      transclude: true
      link: (scope, element, attrs, transclude) ->
        return unless attrs.path

        imagoModel.getData(attrs.query).then (response) ->
          for data in response
            for item in data.assets
              item.path = '/' if item.path is '/home'
              item.normname = imagoUtils.normalize(item.name)
            scope.items = data.assets
            break

    }
