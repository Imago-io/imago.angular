(function() {
  var ImagoModal, imagoModalController;

  ImagoModal = (function() {
    function ImagoModal($document) {
      return {
        restrict: 'E',
        scope: true,
        transclude: true,
        templateUrl: '/imago/imago-modal.html',
        controller: 'imagoModalController as modal',
        bindToController: {
          active: '=?',
          position: '<?'
        },
        link: function(scope, element, attrs, ctrl, transclude) {
          var disableOnEsc;
          scope.fullwindow = attrs.fullwindow === 'false' ? false : true;
          if (scope.fullwindow) {
            scope.$watch('modal.active', function(value) {
              if (value) {
                return document.body.style.overflow = 'hidden';
              }
              return document.body.style.overflow = '';
            });
            disableOnEsc = function(evt) {
              if (!scope.modal.active) {
                return;
              }
              if (evt.keyCode === 27) {
                scope.modal.disable();
              }
              return scope.$digest();
            };
            $document.on('keydown', disableOnEsc);
            return scope.$on('$destroy', function() {
              document.body.style.overflow = '';
              return $document.off('keydown', disableOnEsc);
            });
          } else {
            return element.css({
              position: 'relative'
            });
          }
        }
      };
    }

    return ImagoModal;

  })();

  imagoModalController = (function() {
    function imagoModalController($rootScope, $scope) {
      this.$rootScope = $rootScope;
      this.$scope = $scope;
    }

    imagoModalController.prototype.activate = function() {
      return this.active = true;
    };

    imagoModalController.prototype.disable = function() {
      return this.active = false;
    };

    return imagoModalController;

  })();

  angular.module('imago').directive('imagoModal', ['$document', ImagoModal]).controller('imagoModalController', ['$rootScope', '$scope', imagoModalController]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-modal.html","<div ng-if=\"modal.active\" ng-class=\"[{\'fullwindow\': fullwindow, \'not-fullwindow\': !fullwindow}, modal.position]\" stop-propagation=\"stop-propagation\" class=\"imago-modal-content\"><div ng-transclude=\"ng-transclude\" class=\"wrapper\"></div></div>");}]);