(function() {
  var ImagoFetchMenu;

  ImagoFetchMenu = (function() {
    function ImagoFetchMenu(imagoModel, imagoUtils) {
      return {
        restrict: 'E',
        templateUrl: '/imago/imago-fetch-menu.html',
        link: function(scope, element, attrs) {
          if (!attrs.path) {
            return;
          }
          return imagoModel.getData({
            'path': attrs.path
          }).then(function(response) {
            var data, i, item, j, len, len1, ref, results;
            results = [];
            for (i = 0, len = response.length; i < len; i++) {
              data = response[i];
              ref = data.assets;
              for (j = 0, len1 = ref.length; j < len1; j++) {
                item = ref[j];
                if (item.path === '/home') {
                  item.path = '/';
                }
                item.normname = imagoUtils.normalize(item.name);
              }
              scope.items = data.assets;
              break;
            }
            return results;
          });
        }
      };
    }

    return ImagoFetchMenu;

  })();

  angular.module('imago').directive('imagoFetchMenu', ['imagoModel', 'imagoUtils', ImagoFetchMenu]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-fetch-menu.html","<a ng-href=\"{{item.path}}\" ng-class=\"item.normname\" ng-repeat=\"item in ::items track by item._id\">{{::item.fields.title.value || item.name}}</a>");}]);