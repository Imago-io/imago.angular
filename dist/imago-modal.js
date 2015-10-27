var Modal, ModalController;

Modal = (function() {
  function Modal() {
    return {
      scope: {
        item: '=',
        active: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-modal.html',
      controller: 'modalController as modal',
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

  return Modal;

})();

ModalController = (function() {
  function ModalController($rootScope, $scope) {
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

  ModalController.prototype.activate = function(item) {
    return this.active = true;
  };

  ModalController.prototype.disable = function() {
    this.item = null;
    return this.active = false;
  };

  return ModalController;

})();

angular.module('imago').directive('modal', [Modal]).controller('modalController', ['$rootScope', '$scope', ModalController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-modal.html","<div ng-show=\"modal.active\" ng-click=\"modal.disable()\" class=\"imago-modal\"><div class=\"wrapper\"><div class=\"close icon-thin-close icon\"></div><div class=\"transclude\"></div></div></div>");}]);