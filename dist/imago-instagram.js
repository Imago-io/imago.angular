(function() {
  var ImagoInstagram, ImagoInstagramController;

  ImagoInstagram = (function() {
    function ImagoInstagram() {
      return {
        restrict: 'E',
        scope: true,
        controller: 'imagoInstagramController as instagram',
        templateUrl: function(element, attrs) {
          return attrs.templateUrl || '/imago/imago-instagram.html';
        }
      };
    }

    return ImagoInstagram;

  })();

  ImagoInstagramController = (function() {
    function ImagoInstagramController($scope, $http, $attrs, imagoModel) {
      var options;
      options = {
        screen_name: $scope.$eval($attrs.user),
        count: $scope.$eval($attrs.count || 10)
      };
      if (!options.screen_name) {
        throw 'Instagram: you need an user';
      }
      $http.post(imagoModel.host + "/api/social/instagram/feed", options).then((function(_this) {
        return function(response) {
          return _this.data = response.data;
        };
      })(this));
      return;
    }

    return ImagoInstagramController;

  })();

  angular.module('imago').directive('imagoInstagram', [ImagoInstagram]).controller('imagoInstagramController', ['$scope', '$http', '$attrs', 'imagoModel', ImagoInstagramController]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-instagram.html","<div class=\"imago-instagram-content\"><a ng-href=\"{{item.link}}\" target=\"_blank\" ng-repeat=\"item in instagram.data track by item.id\" class=\"item\"><div ng-style=\"{\'background-image\': \'url({{ item.images.standard_resolution.url }})\'}\" class=\"img\"></div><div class=\"caption\"><div ng-bind-html=\"::item.caption.text | imagoLinkify: \'instagram\'\" class=\"text\"></div><div class=\"likes\">{{::item.likes.count}}</div></div></a></div>");}]);