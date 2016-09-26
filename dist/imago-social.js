(function() {
  var imagoLike;

  imagoLike = (function() {
    function imagoLike() {
      return {
        restrict: 'E',
        scope: {},
        templateUrl: '/imago/imago-like.html'
      };
    }

    return imagoLike;

  })();

  angular.module('imago').directive('imagoLike', [imagoLike]);

}).call(this);

(function() {
  var ImagoShare, ImagoShareController,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ImagoShare = (function() {
    function ImagoShare() {
      return {
        bindings: {
          asset: '<',
          data: '@'
        },
        controller: 'imagoShareController as imagoshare',
        templateUrl: function($attrs) {
          return $attrs.templateUrl || '/imago/imago-share.html';
        }
      };
    }

    return ImagoShare;

  })();

  ImagoShareController = (function() {
    function ImagoShareController($scope, $location) {
      this.$scope = $scope;
      this.$location = $location;
      this.$onChanges = bind(this.$onChanges, this);
      this.$onInit = bind(this.$onInit, this);
    }

    ImagoShareController.prototype.$onInit = function() {
      return this.init();
    };

    ImagoShareController.prototype.$onChanges = function(changes) {
      if (!changes.asset.currentValue) {
        return;
      }
      return this.init();
    };

    ImagoShareController.prototype.init = function() {
      var i, item, len, options, ref, results;
      if ((ref = this.asset) != null ? ref.path : void 0) {
        this.location = (this.$location.protocol()) + "://" + (this.$location.host()) + this.asset.path;
      } else {
        this.location = this.$location.absUrl();
      }
      this.location = encodeURIComponent(this.location);
      if (!this.data) {
        return console.log('You need to specify one service at least.');
      }
      options = this.$scope.$eval(this.data);
      if (_.isArray(options)) {
        results = [];
        for (i = 0, len = options.length; i < len; i++) {
          item = options[i];
          results.push(this.$scope[item] = true);
        }
        return results;
      } else if (this.data === 'all') {
        return this.$scope.all = true;
      }
    };

    return ImagoShareController;

  })();

  angular.module('imago').component('imagoShare', new ImagoShare()).controller('imagoShareController', ['$scope', '$location', ImagoShareController]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-like.html","<div class=\"imago-like-content\"><a href=\"http://instagram.com/###\" target=\"_blank\" class=\"instagram\">Instagram</a><a href=\"https://www.facebook.com/###\" target=\"_blank\" class=\"facebook\">Facebook</a><a href=\"https://plus.google.com/###\" target=\"_blank\" class=\"googleplus\">Google +</a></div>");
$templateCache.put("/imago/imago-share.html","<div class=\"imago-share-content\"><a ng-href=\"http://www.facebook.com/share.php?u={{imagoshare.location}}\" target=\"_blank\" ng-if=\"facebook || all\" class=\"fa fa-facebook\"></a><a ng-href=\"http://twitter.com/home?status={{imagoshare.location}}\" target=\"_blank\" ng-if=\"twitter || all\" class=\"fa fa-twitter\"></a><a ng-href=\"https://plus.google.com/share?url={{imagoshare.location}}\" target=\"_blank\" ng-if=\"google || all\" class=\"fa fa-google\"></a><a ng-href=\"https://www.linkedin.com/shareArticle?mini=true&amp;url={{imagoshare.location}}&amp;title={{imagoshare.asset | meta:\'title\'}}&amp;summary=&amp;source={{imagoshare.asset.serving_url}}\" target=\"_blank\" ng-if=\"linkedin || all\" class=\"fa fa-linkedin\"></a><a ng-href=\"http://www.tumblr.com/share/photo?source={{imagoshare.location}}&amp;caption={{imagoshare.asset | meta:\'title\'}}\" target=\"_blank\" ng-if=\"tumblr|| all\" class=\"fa fa-tumblr\"></a><a ng-href=\"http://www.pinterest.com/pin/create/abutton/?url={{imagoshare.location}}/&amp;media={{imagoshare.asset.serving_url}}&amp;description={{imagoshare.asset | meta:\'title\'}}\" target=\"_blank\" title=\"Pin It\" ng-if=\"pinterest || all\" class=\"fa fa-pinterest\"></a></div>");}]);