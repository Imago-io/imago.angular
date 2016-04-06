(function() {
  var ImagoButtonProgress;

  ImagoButtonProgress = (function() {
    function ImagoButtonProgress($timeout) {
      return {
        templateUrl: '/imago/imago-button-progress.html',
        transclude: true,
        scope: {
          action: '&',
          progress: '='
        },
        link: function(scope, element, attrs) {
          var key, promise, ref;
          scope.actionType = attrs.progress ? 'progress' : 'action';
          if (attrs.progress) {
            scope.$watch('progress', function(value) {
              if (value === true) {
                return scope.animateClass = ['animate', 'progress'];
              } else {
                return scope.animateClass = [];
              }
            });
          }
          if (attrs.action) {
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
              scope.animateClass = ['animate', 'progress'];
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

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-button-progress.html","<button class=\"btn btn-progress\"><div ng-style=\"style\" ng-class=\"animateClass\" class=\"progress-bar type-{{actionType}}\"></div><div ng-transclude=\"ng-transclude\" class=\"imago-button-progress-content\"></div></button>");}]);