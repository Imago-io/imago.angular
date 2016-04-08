class ImagoFetch extends Directive

  constructor: (imagoModel, imagoUtils) ->

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

  constructor: (imagoModel) ->
    throw 'No query set in imagofetch' if !@query

    imagoModel.getData(@query).then (response) =>
      for item in response
        @result = item
        break