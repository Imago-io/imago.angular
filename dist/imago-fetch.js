(function() {
  var ImagoFetch, ImagoFetchController;

  ImagoFetch = (function() {
    function ImagoFetch(imagoModel, imagoUtils) {
      return {
        restrict: 'E',
        scope: true,
        templateUrl: '/imago/imago-fetch.html',
        transclude: true,
        controller: 'imagoFetchController as imagofetch',
        bindToController: {
          query: '@'
        },
        link: function(scope, element, attrs, ctrl, transclude) {
          return transclude(scope, function(clone) {
            return element.children().append(clone);
          });
        }
      };
    }

    return ImagoFetch;

  })();

  ImagoFetchController = (function() {
    function ImagoFetchController(imagoModel) {
      if (!this.query) {
        throw 'No query set in imagofetch';
      }
      imagoModel.getData(this.query).then((function(_this) {
        return function(response) {
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
            }
            _this.result = data;
            break;
          }
          return results;
        };
      })(this));
    }

    return ImagoFetchController;

  })();

  angular.module('imago').directive('imagoFetch', ['imagoModel', 'imagoUtils', ImagoFetch]).controller('imagoFetchController', ['imagoModel', ImagoFetchController]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-fetch.html","<div class=\"imago-fetch-content\"></div>");}]);