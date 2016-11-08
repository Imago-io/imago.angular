(function() {
  var imagoForm;

  imagoForm = (function() {
    function imagoForm(imagoSubmit) {
      return {
        restrict: 'E',
        scope: {},
        transclude: true,
        templateUrl: '/imago/imago-form.html',
        link: function(scope, element, attr, cntrl, transclude) {
          scope.data = {};
          transclude(scope, function(clone, scope) {
            return element.append(clone);
          });
          return scope.submitForm = (function(_this) {
            return function(isValid) {
              if (!isValid) {
                return;
              }
              return imagoSubmit.send(scope.data).then(function(result) {
                scope.status = result.status;
                scope.error = result.message || '';
                if (scope.status) {
                  return scope.data = {};
                }
              });
            };
          })(this);
        }
      };
    }

    return imagoForm;

  })();

  angular.module('imago').directive('imagoForm', ['imagoSubmit', imagoForm]);

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/imago-form.html','<div class="imago-form-content"></div>');}]);