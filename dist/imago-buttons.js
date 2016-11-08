(function() {
  var ImagoButtonConfirm, ImagoButtonConfirmController;

  ImagoButtonConfirm = (function() {
    function ImagoButtonConfirm() {
      return {
        bindings: {
          action: '&'
        },
        controller: 'imagoButtonConfirmController',
        templateUrl: '/imago/imago-button-confirm.html',
        transclude: true
      };
    }

    return ImagoButtonConfirm;

  })();

  ImagoButtonConfirmController = (function() {
    function ImagoButtonConfirmController() {}

    ImagoButtonConfirmController.prototype.onClick = function(evt) {
      if (this.confirm || evt.metaKey) {
        this.action({
          $event: evt
        });
        return this.confirm = false;
      } else {
        return this.confirm = true;
      }
    };

    return ImagoButtonConfirmController;

  })();

  angular.module('imago').component('imagoButtonConfirm', new ImagoButtonConfirm()).controller('imagoButtonConfirmController', [ImagoButtonConfirmController]);

}).call(this);

(function() {
  var ImagoButtonProgress;

  ImagoButtonProgress = (function() {
    function ImagoButtonProgress($timeout) {
      return {
        templateUrl: '/imago/imago-button-progress.html',
        transclude: true,
        scope: {
          action: '&',
          progress: '=',
          disabled: '=?ngDisabled'
        },
        link: function(scope, element, attrs) {
          var key, promise, ref;
          scope.opts = {
            duration: 1000
          };
          for (key in attrs) {
            if (!scope.opts[key]) {
              continue;
            }
            if ((ref = attrs[key]) === 'true' || ref === 'false') {
              scope.opts[key] = JSON.parse(attrs[key]);
            } else if (!isNaN(attrs[key])) {
              scope.opts[key] = Number(attrs[key]);
            } else {
              scope.opts[key] = attrs[key];
            }
          }
          scope.actionType = attrs.progress ? 'progress' : 'action';
          if (scope.actionType === 'progress') {
            return scope.$watch('progress', function(value) {
              if (!_.isBoolean(value)) {
                return;
              }
              if (value === true) {
                return scope.animateClass = ['progress'];
              } else {
                scope.animateClass = ['progress', 'done'];
                return $timeout(function() {
                  return scope.animateClass = [];
                }, scope.opts.duration);
              }
            });
          } else if (scope.actionType === 'action') {
            scope.style = {
              transitonDuration: scope.opts.duration
            };
            promise = null;
            scope.mouseUp = function() {
              scope.animateClass = [];
              scope.$digest();
              $timeout.cancel(promise);
              if (scope.allowAction) {
                scope.action();
                return scope.allowAction = false;
              }
            };
            scope.mouseDown = function() {
              scope.allowAction = false;
              scope.animateClass = ['progress'];
              scope.$digest();
              return promise = $timeout(function() {
                scope.allowAction = true;
                return scope.mouseUp();
              }, scope.opts.duration);
            };
            scope.mouseLeave = function() {
              scope.animateClass = [];
              scope.allowAction = false;
              $timeout.cancel(promise);
              return scope.$digest();
            };
            element.on('mousedown', scope.mouseDown);
            element.on('mouseup', scope.mouseUp);
            element.on('mouseleave', scope.mouseLeave);
            return scope.$on('$destroy', function() {
              element.off('mousedown', scope.mouseDown);
              element.off('mouseup', scope.mouseUp);
              return element.off('mouseleave', scope.mouseLeave);
            });
          }
        }
      };
    }

    return ImagoButtonProgress;

  })();

  angular.module('imago').directive('imagoButtonProgress', ['$timeout', ImagoButtonProgress]);

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/imago-button-confirm.html','<button ng-click="$ctrl.onClick($event)" class="btn btn-confirm"><span ng-show="$ctrl.confirm" class="message-confirm">Sure?</span><div ng-hide="$ctrl.confirm" ng-transclude="ng-transclude" class="imago-button-confirm-content"></div></button>');
$templateCache.put('/imago/imago-button-progress.html','<button ng-disabled="disabled" class="btn btn-progress"><div ng-style="style" ng-class="animateClass" class="progress-bar type-{{actionType}}"></div><div ng-class="animateClass" class="success-bar"></div><div ng-transclude="ng-transclude" class="imago-button-progress-content"></div></button>');}]);