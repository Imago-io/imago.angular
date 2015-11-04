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

var imagoShare, imagoShareController;

imagoShare = (function() {
  function imagoShare($compile, $templateCache, $http) {
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
    if (this.asset) {
      return this.init();
    }
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
    var i, item, len, options, results;
    if (this.asset.path) {
      this.location = (this.$location.protocol()) + "://" + (this.$location.host()) + this.asset.path;
    } else {
      this.location = this.$location.absUrl();
    }
    if (!this.$attrs.imagoShare) {
      return console.log('You need to specify one service at least.');
    }
    options = this.$scope.$eval(this.$attrs.imagoShare);
    if (_.isArray(options)) {
      results = [];
      for (i = 0, len = options.length; i < len; i++) {
        item = options[i];
        results.push(this[item] = true);
      }
      return results;
    } else if (this.$attrs.imagoShare === 'all') {
      return this.all = true;
    }
  };

  return imagoShareController;

})();

angular.module('imago').directive('imagoShare', ['$compile', '$templateCache', '$http', imagoShare]).controller('imagoShareController', ['$scope', '$attrs', '$location', imagoShareController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-like.html","<div class=\"social\"><a href=\"http://instagram.com/###\" target=\"_blank\" class=\"instagram\">Instagram</a><a href=\"https://www.facebook.com/###\" target=\"_blank\" class=\"facebook\">Facebook</a><a href=\"https://plus.google.com/###\" target=\"_blank\" class=\"googleplus\">Google +</a></div>");
$templateCache.put("/imago/imago-share.html","<div class=\"share\"><a ng-href=\"http://www.facebook.com/share.php?u={{imagoshare.location}}\" target=\"_blank\" ng-if=\"imagoshare.facebook || imagoshare.all\" class=\"fa fa-facebook\"></a><a ng-href=\"http://twitter.com/home?status={{imagoshare.location}}\" target=\"_blank\" ng-if=\"imagoshare.twitter || imagoshare.all\" class=\"fa fa-twitter\"></a><a ng-href=\"https://plus.google.com/share?url={{imagoshare.location}}\" target=\"_blank\" ng-if=\"imagoshare.google || imagoshare.all\" class=\"fa fa-google\"></a><a ng-href=\"https://www.linkedin.com/shareArticle?mini=true&amp;url={{imagoshare.location}}&amp;title={{asset | meta:\'title\'}}&amp;summary=&amp;source={{asset.serving_url}}\" target=\"_blank\" ng-if=\"imagoshare.linkedin || imagoshare.all\" class=\"fa fa-linkedin\"></a><a ng-href=\"http://www.tumblr.com/share/photo?source={{imagoshare.location}}&amp;caption={{asset | meta:\'title\'}}\" target=\"_blank\" ng-if=\"imagoshare.tumblr|| imagoshare.all\" class=\"fa fa-tumblr\"></a><a ng-href=\"http://www.pinterest.com/pin/create/abutton/?url={{imagoshare.location}}/&amp;media={{asset.serving_url}}&amp;description={{asset | meta:\'title\'}}\" target=\"_blank\" title=\"Pin It\" ng-if=\"imagoshare.pinterest || imagoshare.all\" class=\"fa fa-pinterest\"></a></div>");}]);