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
          var i, item, len, results;
          results = [];
          for (i = 0, len = response.length; i < len; i++) {
            item = response[i];
            _this.result = item;
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