var ImagoFieldCheckbox;

ImagoFieldCheckbox = (function() {
  function ImagoFieldCheckbox() {
    return {
      replace: true,
      require: 'ngModel',
      scope: {
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-field-checkbox.html',
      link: function(scope, element, attrs, ngModelController) {
        if (attrs.disabled) {
          scope.disabled = true;
        }
        attrs.$observe('disabled', function(value) {
          return scope.disabled = value;
        });
        return scope.update = function(value) {
          if (scope.disabled) {
            return;
          }
          value = !value;
          ngModelController.$setViewValue(value);
          ngModelController.$render();
          if (attrs.required) {
            return ngModelController.$setValidity('required', value);
          }
        };
      }
    };
  }

  return ImagoFieldCheckbox;

})();

angular.module('imago').directive('imagoFieldCheckbox', [ImagoFieldCheckbox]);

var ImagoFieldCurrency, imagoFilterCurrency;

ImagoFieldCurrency = (function() {
  function ImagoFieldCurrency() {
    return {
      replace: true,
      require: 'ngModel',
      scope: {
        currencies: '=',
        ngModel: '=',
        save: '&ngChange'
      },
      transclude: true,
      templateUrl: '/imago/imago-field-currency.html',
      link: function(scope, element, attrs, ngModelController) {
        var ref;
        if (!((ref = scope.currencies) != null ? ref.length : void 0)) {
          return console.log('no currencies!!');
        }
        scope.currency = scope.currencies[0];
        scope.$watchCollection('ngModel', function(value) {
          var currency, i, len, ref1;
          if (!_.isPlainObject(scope.ngModel)) {
            return scope.notComplete = true;
          }
          ref1 = scope.currencies;
          for (i = 0, len = ref1.length; i < len; i++) {
            currency = ref1[i];
            if (!angular.isDefined(scope.ngModel[currency])) {
              return scope.notComplete = true;
            }
          }
          return scope.notComplete = false;
        });
        return scope.update = function(value) {
          var key;
          for (key in value) {
            value[key] = parseFloat(value[key]);
          }
          ngModelController.$setViewValue(value);
          ngModelController.$render();
          return scope.save();
        };
      }
    };
  }

  return ImagoFieldCurrency;

})();

imagoFilterCurrency = (function() {
  function imagoFilterCurrency() {
    return {
      require: 'ngModel',
      link: function(scope, elem, attrs, ctrl) {
        ctrl.$formatters.unshift(function(value) {
          if (angular.isDefined(value) && !_.isNull(value)) {
            value = (value / 100).toFixed(2);
          }
          if (isNaN(value)) {
            value = void 0;
          }
          return value;
        });
        return ctrl.$parsers.unshift(function(viewValue) {
          var plainNumber;
          if (viewValue) {
            plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, "");
            plainNumber = parseFloat(plainNumber * 100);
            plainNumber = plainNumber.toFixed(2);
            return plainNumber;
          } else {
            return void 0;
          }
        });
      }
    };
  }

  return imagoFilterCurrency;

})();

angular.module('imago').directive('imagoFieldCurrency', [ImagoFieldCurrency]).directive('imagoFilterCurrency', [imagoFilterCurrency]);

var ImagoFieldDate;

ImagoFieldDate = (function() {
  function ImagoFieldDate() {
    return {
      replace: true,
      require: 'ngModel',
      scope: {
        min: '=',
        max: '=',
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-field-date.html',
      link: function(scope, element, attrs, ngModelController) {
        return scope.update = function(value) {
          ngModelController.$setViewValue(value);
          return ngModelController.$render();
        };
      }
    };
  }

  return ImagoFieldDate;

})();

angular.module('imago').directive('imagoFieldDate', [ImagoFieldDate]);

var ImagoFieldEmail;

ImagoFieldEmail = (function() {
  function ImagoFieldEmail() {
    return {
      replace: true,
      require: 'ngModel',
      scope: {
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-field-email.html',
      link: function(scope, element, attrs, ngModelController) {
        if (attrs.required) {
          scope.required = true;
        }
        return scope.update = function(value) {
          ngModelController.$setViewValue(value);
          return ngModelController.$render();
        };
      }
    };
  }

  return ImagoFieldEmail;

})();

angular.module('imago').directive('imagoFieldEmail', [ImagoFieldEmail]);

var ImagoFieldNumber;

ImagoFieldNumber = (function() {
  function ImagoFieldNumber() {
    return {
      replace: true,
      require: 'ngModel',
      scope: {
        min: '=',
        max: '=',
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-field-number.html',
      link: function(scope, element, attrs, ngModelController) {
        var change, checkValidity;
        if (attrs.disabled) {
          scope.disabled = true;
        }
        attrs.$observe('disabled', function(value) {
          return scope.disabled = value;
        });
        ngModelController.$render = function() {
          return checkValidity();
        };
        ngModelController.$formatters.push(function(value) {
          return parseFloat(value);
        });
        ngModelController.$parsers.push(function(value) {
          return parseFloat(value);
        });
        checkValidity = function() {
          var valid;
          valid = !(scope.isLimitMin(true) || scope.isLimitMax(true));
          return ngModelController.$setValidity('outOfBounds', valid);
        };
        change = function(offset) {
          var value;
          value = ngModelController.$viewValue + offset;
          return scope.update(value);
        };
        scope.update = function(value) {
          if (scope.disabled) {
            return;
          }
          if (_.isNaN(value)) {
            value = 1;
          }
          value = parseFloat(value);
          ngModelController.$setViewValue(value);
          return ngModelController.$render();
        };
        scope.isLimitMin = function() {
          if (ngModelController.$viewValue < scope.min) {
            return true;
          }
        };
        scope.isLimitMax = function() {
          if (ngModelController.$viewValue > scope.max) {
            return true;
          }
        };
        scope.isOverMin = function() {
          if (ngModelController.$viewValue < scope.min + 1) {
            return true;
          }
        };
        scope.isOverMax = function() {
          if (ngModelController.$viewValue > scope.max - 1) {
            return true;
          }
        };
        scope.decrement = function() {
          return change(-1);
        };
        scope.increment = function() {
          return change(+1);
        };
        checkValidity();
        return scope.$watchGroup(['min', 'max'], function() {
          return checkValidity();
        });
      }
    };
  }

  return ImagoFieldNumber;

})();

angular.module('imago').directive('imagoFieldNumber', [ImagoFieldNumber]);

var ImagoFieldString;

ImagoFieldString = (function() {
  function ImagoFieldString() {
    return {
      replace: true,
      require: 'ngModel',
      scope: {
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-field-string.html',
      link: function(scope, element, attrs, ngModelController) {
        return scope.update = function(value) {
          ngModelController.$setViewValue(value);
          return ngModelController.$render();
        };
      }
    };
  }

  return ImagoFieldString;

})();

angular.module('imago').directive('imagoFieldString', [ImagoFieldString]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-field-checkbox.html","<div class=\"imago-checkbox\"><label ng-class=\"{active: ngModel, disabled: disabled}\" ng-click=\"update(ngModel)\" class=\"topcoat-checkbox\"><div class=\"topcoat-checkbox__checkmark\"></div><span ng-transclude=\"ng-transclude\"></span></label></div>");
$templateCache.put("/imago/imago-field-currency.html","<div class=\"imago-field currency\"><div ng-class=\"{focus:onfocus}\" class=\"wrapper\"><div ng-transclude=\"ng-transclude\"></div><select ng-model=\"currency\" ng-options=\"currency for currency in currencies\"></select><input type=\"text\" imago-filter-currency=\"imago-filter-currency\" ng-model=\"ngModel[currency]\" ng-model-options=\"{updateOn: \'blur\'}\" ng-change=\"update(ngModel); onfocus = false\" ng-disabled=\"!currency\" ng-focus=\"onfocus = true\"/></div><div ng-show=\"notComplete\" class=\"error\">somes currencies do not have any value</div></div>");
$templateCache.put("/imago/imago-field-date.html","<div class=\"imago-field date\"><div ng-transclude=\"ng-transclude\"></div><input type=\"text\" date-time=\"date-time\" dismiss=\"true\" ng-model=\"ngModel\" ng-blur=\"update(ngModel)\" view=\"date\" min-view=\"date\" partial=\"true\"/></div>");
$templateCache.put("/imago/imago-field-email.html","<div class=\"imago-field email\"><div ng-transclude=\"ng-transclude\"></div><input type=\"email\" ng-model=\"ngModel\" ng-blur=\"update(ngModel)\" ng-required=\"required\"/></div>");
$templateCache.put("/imago/imago-field-number.html","<div class=\"imago-field number\"><div ng-transclude=\"ng-transclude\"></div><input type=\"text\" ng-model=\"ngModel\" ng-model-options=\"{\'updateOn\': \'blur\'}\" ng-change=\"update(ngModel)\"/><button type=\"button\" ng-disabled=\"isOverMin() || disabled\" ng-click=\"decrement()\" class=\"decrement\"></button><button type=\"button\" ng-disabled=\"isOverMax() || disabled\" ng-click=\"increment()\" class=\"increment\"></button></div>");
$templateCache.put("/imago/imago-field-string.html","<div class=\"imago-field string\"><div ng-transclude=\"ng-transclude\"></div><input type=\"text\" ng-model=\"ngModel\" ng-change=\"update(ngModel)\"/></div>");}]);