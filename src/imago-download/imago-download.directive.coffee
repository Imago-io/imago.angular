class imagoDownload extends Directive
  constructor: ($compile, $templateCache, $http) ->

    return {

      scope:
        asset: "="
        fieldname: "="
      templateUrl: (element, attrs) ->
        return attrs.templateUrl or '/imago/imago-download.html'

      }