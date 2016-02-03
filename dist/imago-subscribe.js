(function() {
  var ImagoSubscribe, ImagoSubscribeController;

  ImagoSubscribe = (function() {
    function ImagoSubscribe() {
      return {
        require: 'form',
        restrict: 'A',
        transclude: true,
        controller: 'imagoSubscribeController as imagosubscribe',
        templateUrl: function(element, attrs) {
          return attrs.templateUrl || '/imago/imago-subscribe.html';
        }
      };
    }

    return ImagoSubscribe;

  })();

  ImagoSubscribeController = (function() {
    function ImagoSubscribeController($scope, $attrs, $http, $parse, imagoModel) {
      this.submit = function(validate) {
        var form;
        if (validate.$invalid) {
          return;
        }
        form = $parse($attrs.imagoSubscribe)($scope);
        this.submitted = true;
        return $http.post(imagoModel.host + "/api/subscribe", form).then((function(_this) {
          return function(response) {
            _this.error = false;
            return console.log('response', response);
          };
        })(this), function(error) {
          this.error = true;
          return console.log('error', error);
        });
      };
    }

    return ImagoSubscribeController;

  })();

  angular.module('imago').directive('imagoSubscribe', [ImagoSubscribe]).controller('imagoSubscribeController', ['$scope', '$attrs', '$http', '$parse', 'imagoModel', ImagoSubscribeController]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-subscribe.html","<div class=\"imago-subscribe\"><div ng-transclude=\"ng-transclude\" ng-hide=\"imagosubscribe.submitted &amp;&amp; !imagosubscribe.error\"></div><div ng-show=\"imagosubscribe.submitted &amp;&amp; imagosubscribe.error\" class=\"error\">please try again later</div><div ng-show=\"imagosubscribe.submitted &amp;&amp; !imagosubscribe.error\" class=\"submitted\">subscription created</div></div>");}]);