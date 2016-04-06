class ImagoFetchMenu extends Directive

  constructor: (imagoModel, imagoUtils) ->

    return {

      restrict: 'AE'
      templateUrl: '/imago/imago-fetch-menu.html'
      link: (scope, element, attrs) ->
        return unless attrs.path

        imagoModel.getData('path': attrs.path).then (response) ->
          for data in response
            for item in data.assets
              item.path = '/' if item.path is '/home'
              item.normname = imagoUtils.normalize(item.name)
            scope.items = data.assets
            break

    }
