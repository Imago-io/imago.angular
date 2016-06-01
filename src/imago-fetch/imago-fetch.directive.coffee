class ImagoFetch extends Directive

  constructor: ->

    return {

      restrict: 'E'
      scope: true
      templateUrl: '/imago/imago-fetch.html'
      transclude: true
      controller: 'imagoFetchController as imagofetch'
      bindToController:
        query: '@'
      link: (scope, element, attrs, ctrl, transclude) ->
        transclude scope, (clone) ->
          element.children().append(clone)

    }

class ImagoFetchController extends Controller

  constructor: ($scope, imagoModel, imagoUtils) ->
    throw 'No query set in imagofetch' unless @query

    if  _.includes @query, '{'
      @query = $scope.$eval @query

    imagoModel.getData(@query, {updatePageTitle: true}).then (response) =>
      for data in response
        for item in data.assets
          item.path = '/' if item.path is '/home'
          item.normname = imagoUtils.normalize(item.name)
        @result = data
        break
