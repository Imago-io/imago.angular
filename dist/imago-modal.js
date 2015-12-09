var ImagoModal, imagoModalController;

ImagoModal = (function() {
  function ImagoModal() {
    return {
      scope: {
        item: '=',
        active: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-modal.html',
      controller: 'imagoModalController as modal',
      bindToController: true,
      link: function(scope, element, attrs, ctrl, transclude) {
        return transclude(scope, function(clone) {
          var el;
          el = angular.element(document.querySelector('.imago-modal .transclude'));
          return el.append(clone);
        });
      }
    };
  }

  return ImagoModal;

})();

imagoModalController = (function() {
  function imagoModalController($rootScope, $scope) {
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.active = false;
    this.$scope.$watch('modal.active', function(value) {
      if (value) {
        return document.body.style.overflow = 'hidden';
      }
      return document.body.style.overflow = 'auto';
    });
    this.$rootScope.$on('modal:item', (function(_this) {
      return function(evt, item) {
        _this.item = item;
        return _this.activate();
      };
    })(this));
  }

  imagoModalController.prototype.activate = function(item) {
    return this.active = true;
  };

  imagoModalController.prototype.disable = function() {
    this.item = null;
    return this.active = false;
  };

  return imagoModalController;

})();

angular.module('imago').directive('imagoModal', [ImagoModal]).controller('imagoModalController', ['$rootScope', '$scope', imagoModalController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-modal.html","<div ng-show=\"modal.active\" ng-click=\"modal.disable()\" class=\"imago-modal\"><div class=\"wrapper\"><div class=\"close icon-thin-close icon\"></div><div class=\"transclude\"></div></div></div>");}]);