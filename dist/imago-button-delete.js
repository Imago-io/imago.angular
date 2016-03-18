(function() {
  var ImagoButtonDelete;

  ImagoButtonDelete = (function() {
    function ImagoButtonDelete($timeout) {
      return {
        templateUrl: '/imago/button-delete.html',
        transclude: true,
        scope: {
          action: '&'
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
          scope.style = {
            transitonDuration: scope.opts.duration
          };
          promise = null;
          scope.mouseUp = function() {
            scope.animateClass = [];
            scope.$digest();
            $timeout.cancel(promise);
            if (scope.allowDelete) {
              scope.action();
              return scope.allowDelete = false;
            }
          };
          scope.mouseDown = function() {
            scope.allowDelete = false;
            scope.animateClass = ['animate', 'progress'];
            scope.$digest();
            return promise = $timeout(function() {
              scope.allowDelete = true;
              return scope.mouseUp();
            }, scope.opts.duration);
          };
          element.on('mousedown', scope.mouseDown);
          element.on('mouseup', scope.mouseUp);
          return scope.$on('$destroy', function() {
            element.off('mousedown', scope.mouseDown);
            return element.off('mouseup', scope.mouseUp);
          });
        }
      };
    }

    return ImagoButtonDelete;

  })();

  angular.module('imago').directive('imagoButtonDelete', ['$timeout', ImagoButtonDelete]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/button-delete.html","<button class=\"btn btn-delete\"><span ng-style=\"style\" ng-class=\"animateClass\"></span><ng-transclude></ng-transclude></button>");}]);