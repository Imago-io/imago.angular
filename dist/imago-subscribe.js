(function() {
  var ImagoSubscribe, ImagoSubscribeController;

  ImagoSubscribe = (function() {
    function ImagoSubscribe() {
      return {
        require: 'form',
        restrict: 'A',
        transclude: true,
        scope: true,
        controller: 'imagoSubscribeController as imagosubscribe',
        bindToController: {
          data: '='
        },
        templateUrl: function(element, attrs) {
          return attrs.templateUrl || '/imago/imago-subscribe.html';
        }
      };
    }

    return ImagoSubscribe;

  })();

  ImagoSubscribeController = (function() {
    function ImagoSubscribeController($scope, $attrs, $http, imagoModel) {
      this.$scope = $scope;
      this.$attrs = $attrs;
      this.$http = $http;
      this.imagoModel = imagoModel;
    }

    ImagoSubscribeController.prototype.submit = function() {
      if (this.$attrs.name) {
        if (this.$scope.$eval(this.$attrs.name).$invalid) {
          return;
        }
      }
      this.submitted = true;
      return this.$http.post(this.imagoModel.host + "/api/subscribe", this.data).then((function(_this) {
        return function(response) {
          return _this.error = false;
        };
      })(this), function(error) {
        return this.error = true;
      });
    };

    return ImagoSubscribeController;

  })();

  angular.module('imago').directive('imagoSubscribe', [ImagoSubscribe]).controller('imagoSubscribeController', ['$scope', '$attrs', '$http', 'imagoModel', ImagoSubscribeController]);

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/imago-subscribe.html','<div class="imago-subscribe-content"><div ng-transclude="ng-transclude" ng-hide="imagosubscribe.submitted &amp;&amp; !imagosubscribe.error"></div><div ng-show="imagosubscribe.error" class="error">please try again later</div><div ng-show="imagosubscribe.submitted &amp;&amp; !imagosubscribe.error" class="submitted">subscription created</div></div>');}]);