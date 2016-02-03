(function() {
  var ImagoClickOut;

  ImagoClickOut = (function() {
    function ImagoClickOut($document, $parse) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var clickFunction, clickOutHandler;
          clickOutHandler = $parse(attrs.imagoClickOut);
          clickFunction = function(evt) {
            if (element[0].contains(evt.target)) {
              return;
            }
            clickOutHandler(scope, {
              $event: evt
            });
            return scope.$apply();
          };
          $document.on('click', clickFunction);
          return scope.$on('$destroy', function() {
            return $document.off('click', clickFunction);
          });
        }
      };
    }

    return ImagoClickOut;

  })();

  angular.module('imago').directive('imagoClickOut', ['$document', '$parse', ImagoClickOut]);

}).call(this);
