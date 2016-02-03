(function() {
  var imagoLike;

  imagoLike = (function() {
    function imagoLike() {
      return {
        scope: {},
        templateUrl: '/imago/imago-like.html'
      };
    }

    return imagoLike;

  })();

  angular.module('imago').directive('imagoLike', [imagoLike]);

}).call(this);

(function() {
  var imagoShare, imagoShareController;

  imagoShare = (function() {
    function imagoShare() {
      return {
        scope: {
          asset: "="
        },
        controller: 'imagoShareController as imagoshare',
        bindToController: true,
        templateUrl: function(element, attrs) {
          return attrs.templateUrl || '/imago/imago-share.html';
        }
      };
    }

    return imagoShare;

  })();

  imagoShareController = (function() {
    function imagoShareController($scope, $attrs, $location) {
      var watcher;
      this.$scope = $scope;
      this.$attrs = $attrs;
      this.$location = $location;
      this.init();
      watcher = this.$scope.$watch('imagoshare.asset', (function(_this) {
        return function(value) {
          if (!value) {
            return;
          }
          watcher();
          return _this.init();
        };
      })(this));
    }

    imagoShareController.prototype.init = function() {
      var i, item, len, options, ref, results;
      if ((ref = this.asset) != null ? ref.path : void 0) {
        this.$scope.location = (this.$location.protocol()) + "://" + (this.$location.host()) + this.asset.path;
      } else {
        this.$scope.location = this.$location.absUrl();
      }
      if (!this.$attrs.imagoShare) {
        return console.log('You need to specify one service at least.');
      }
      options = this.$scope.$eval(this.$attrs.imagoShare);
      if (_.isArray(options)) {
        results = [];
        for (i = 0, len = options.length; i < len; i++) {
          item = options[i];
          results.push(this.$scope[item] = true);
        }
        return results;
      } else if (this.$attrs.imagoShare === 'all') {
        return this.$scope.all = true;
      }
    };

    return imagoShareController;

  })();

  angular.module('imago').directive('imagoShare', [imagoShare]).controller('imagoShareController', ['$scope', '$attrs', '$location', imagoShareController]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-like.html","<div class=\"imago-like\"><a href=\"http://instagram.com/###\" target=\"_blank\" class=\"instagram\">Instagram</a><a href=\"https://www.facebook.com/###\" target=\"_blank\" class=\"facebook\">Facebook</a><a href=\"https://plus.google.com/###\" target=\"_blank\" class=\"googleplus\">Google +</a></div>");
$templateCache.put("/imago/imago-share.html","<div class=\"imago-share\"><a ng-href=\"http://www.facebook.com/share.php?u={{location}}\" target=\"_blank\" ng-if=\"facebook || all\" class=\"fa fa-facebook\"></a><a ng-href=\"http://twitter.com/home?status={{location}}\" target=\"_blank\" ng-if=\"twitter || all\" class=\"fa fa-twitter\"></a><a ng-href=\"https://plus.google.com/share?url={{location}}\" target=\"_blank\" ng-if=\"google || all\" class=\"fa fa-google\"></a><a ng-href=\"https://www.linkedin.com/shareArticle?mini=true&amp;url={{location}}&amp;title={{asset | meta:\'title\'}}&amp;summary=&amp;source={{asset.serving_url}}\" target=\"_blank\" ng-if=\"linkedin || all\" class=\"fa fa-linkedin\"></a><a ng-href=\"http://www.tumblr.com/share/photo?source={{location}}&amp;caption={{asset | meta:\'title\'}}\" target=\"_blank\" ng-if=\"tumblr|| all\" class=\"fa fa-tumblr\"></a><a ng-href=\"http://www.pinterest.com/pin/create/abutton/?url={{location}}/&amp;media={{asset.serving_url}}&amp;description={{asset | meta:\'title\'}}\" target=\"_blank\" title=\"Pin It\" ng-if=\"pinterest || all\" class=\"fa fa-pinterest\"></a></div>");}]);