class imagoDownload extends Directive
  constructor: ($compile, $templateCache, $http) ->

    return {

      restrict: 'E'
      scope:
        asset: "="
        fieldname: "="
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-download.html'

      }