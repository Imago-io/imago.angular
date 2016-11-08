(function() {
  var imagoDownload;

  imagoDownload = (function() {
    function imagoDownload($compile, $templateCache, $http) {
      return {
        restrict: 'E',
        scope: {
          asset: "=",
          fieldname: "="
        },
        templateUrl: function(element, attrs) {
          return attrs.templateUrl || '/imago/imago-download.html';
        }
      };
    }

    return imagoDownload;

  })();

  angular.module('imago').directive('imagoDownload', ['$compile', '$templateCache', '$http', imagoDownload]);

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/imago-download.html','<a ng-href="{{asset.fields[fieldname].download_url}}" ng-if="asset.fields[fieldname].download_url" analytics-on="click" analytics-event="Download {{ asset.fields[fieldname].filename }}"><i class="fa fa-file-pdf-o"> {{ asset.fields[fieldname].filename }}</i></a>');}]);