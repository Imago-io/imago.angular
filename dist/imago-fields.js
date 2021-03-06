(function() {
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

}).call(this);

(function() {
  var ImagoFieldCurrency, ImagoFieldCurrencyController, imagoFilterCurrency,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ImagoFieldCurrency = (function() {
    function ImagoFieldCurrency() {
      return {
        require: 'ngModel',
        scope: {
          currencies: '=',
          ngModel: '=',
          save: '&ngChange'
        },
        transclude: true,
        controller: 'imagoFieldCurrencyController as fieldcurrency',
        bindToController: true,
        templateUrl: '/imago/imago-field-currency.html',
        link: function(scope, element, attrs, ngModelController) {
          var ref;
          if (!((ref = scope.fieldcurrency.currencies) != null ? ref.length : void 0)) {
            return console.log('no currencies!!');
          }
          scope.$watchCollection('fieldcurrency.ngModel', function() {
            var currency, i, len, ref1, results;
            if (!_.isPlainObject(scope.fieldcurrency.ngModel)) {
              return;
            }
            scope.fieldcurrency.notComplete = {};
            ref1 = scope.fieldcurrency.currencies;
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              currency = ref1[i];
              if (angular.isDefined(scope.fieldcurrency.ngModel[currency])) {
                continue;
              }
              results.push(scope.fieldcurrency.notComplete[currency] = true);
            }
            return results;
          });
          return scope.update = function(value) {
            var key;
            for (key in value) {
              value[key] = parseFloat(value[key]);
            }
            ngModelController.$setViewValue(value);
            ngModelController.$render();
            return scope.fieldcurrency.save();
          };
        }
      };
    }

    return ImagoFieldCurrency;

  })();

  ImagoFieldCurrencyController = (function() {
    function ImagoFieldCurrencyController() {
      var ref;
      if (!((ref = this.currencies) != null ? ref.length : void 0)) {
        return;
      }
      this.currency = angular.copy(this.currencies[0]);
    }

    return ImagoFieldCurrencyController;

  })();

  imagoFilterCurrency = (function() {
    function imagoFilterCurrency(imagoUtils) {
      return {
        scope: {
          currency: '=?'
        },
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
          var formatView;
          element.on('blur', function() {
            return ctrl.$render();
          });
          formatView = function(value) {
            var ref;
            if (angular.isDefined(value) && !_.isNull(value)) {
              if (ref = scope.currency, indexOf.call(imagoUtils.ZERODECIMAL_CURRENCIES, ref) >= 0) {
                value = (value / 100).toFixed(0);
              } else {
                value = (value / 100).toFixed(2);
              }
            }
            if (isNaN(value)) {
              value = void 0;
            }
            return value;
          };
          ctrl.$formatters.push(function(value) {
            return formatView(value);
          });
          return ctrl.$parsers.push(function(value) {
            var plainNumber;
            if (value) {
              plainNumber = value.replace(/[^\d|\-+|\.+]/g, "");
              plainNumber = Number((parseFloat(plainNumber) * 100).toFixed(0));
              ctrl.$setViewValue(formatView(plainNumber));
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

  angular.module('imago').directive('imagoFieldCurrency', [ImagoFieldCurrency]).controller('imagoFieldCurrencyController', [ImagoFieldCurrencyController]).directive('imagoFilterCurrency', ['imagoUtils', imagoFilterCurrency]);

}).call(this);

(function() {
  var ImagoFieldDate;

  ImagoFieldDate = (function() {
    function ImagoFieldDate() {
      return {
        restrict: 'E',
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

}).call(this);

(function() {
  var ImagoFieldFile;

  ImagoFieldFile = (function() {
    function ImagoFieldFile() {
      return {
        require: 'ngModel',
        scope: {
          sizeerror: '=?',
          label: '<?',
          maxFileSize: '<?',
          allowedFileTypes: '<?'
        },
        transclude: true,
        templateUrl: '/imago/imago-field-file.html',
        link: function(scope, element, attrs, ngModelController) {
          var input, label;
          scope.maxFileSize || (scope.maxFileSize = 5);
          scope.sizeerror = false;
          scope.label || (scope.label = 'Select Files');
          label = element.find('label');
          input = element.find('input');
          return input.bind('change', function(changeEvent) {
            var reader;
            scope.filename = changeEvent.target.value.split('\\').pop();
            reader = new FileReader;
            reader.onload = function(loadEvent) {
              if (loadEvent.total > 1024 * 1024 * scope.maxFileSize) {
                scope.$apply(function() {
                  ngModelController.$setViewValue(null);
                  return scope.sizeerror = true;
                });
                return;
              }
              return scope.$apply(function() {
                var fileInfo;
                fileInfo = {
                  filename: scope.filename,
                  data: loadEvent.target.result,
                  type: 'file'
                };
                ngModelController.$setViewValue(fileInfo);
                return scope.sizeerror = false;
              });
            };
            return reader.readAsDataURL(changeEvent.target.files[0]);
          });
        }
      };
    }

    return ImagoFieldFile;

  })();

  angular.module('imago').directive('imagoFieldFile', [ImagoFieldFile]);

}).call(this);

(function() {
  var ImagoFieldNumber;

  ImagoFieldNumber = (function() {
    function ImagoFieldNumber() {
      return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
          min: '=',
          max: '=',
          ngModel: '=',
          readonly: '<'
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
            valid = !(scope.isLimitMin() || scope.isLimitMax());
            ngModelController.$setValidity('outOfBounds', valid);
            if (scope.isLimitMax()) {
              scope.update(scope.max);
            }
            if (scope.isLimitMin()) {
              return scope.update(scope.min);
            }
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

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/imago-field-checkbox.html','<div class="imago-checkbox"><label ng-class="{active: ngModel, disabled: disabled}" ng-click="update(ngModel)" class="topcoat-checkbox"><div class="topcoat-checkbox__checkmark"></div><span ng-transclude="ng-transclude"></span></label></div>');
$templateCache.put('/imago/imago-field-currency.html','<div class="imago-field-content-currency imago-field currency"><div ng-class="{expanded: fieldcurrency.expanded}"><button ng-click="fieldcurrency.expanded = !fieldcurrency.expanded" class="ii ii-caret-left"></button><div ng-class="{expanded: fieldcurrency.expanded}" class="fields"><div ng-if="!fieldcurrency.expanded" ng-class="{focus:onfocus}" class="wrapper compact"><label><span ng-repeat="cur in fieldcurrency.currencies" ng-click="fieldcurrency.currency = cur" ng-class="{active: fieldcurrency.currency === cur, invalid: fieldcurrency.notComplete[cur]}">{{cur}}</span></label><input type="text" imago-filter-currency="imago-filter-currency" ng-model="fieldcurrency.ngModel[fieldcurrency.currency]" ng-model-options="{updateOn: \'blur\'}" ng-change="update(fieldcurrency.ngModel); onfocus = false" ng-disabled="!fieldcurrency.currency" ng-focus="onfocus = true"/></div><div ng-repeat="cur in fieldcurrency.currencies" ng-if="fieldcurrency.expanded" ng-class="{invalid: fieldcurrency.notComplete[cur]}" class="wrapper expanded"><div class="imago-field"><label>{{cur}}</label><input type="text" currency="{{cur}}" imago-filter-currency="imago-filter-currency" ng-model="fieldcurrency.ngModel[cur]" ng-model-options="{updateOn: \'blur\'}" ng-blur="update(fieldcurrency.ngModel)"/></div></div></div></div></div>');
$templateCache.put('/imago/imago-field-date.html','<div class="imago-field-date-content imago-field date"><div ng-transclude="ng-transclude"></div><input type="text" date-time="date-time" dismiss="true" ng-model="ngModel" ng-blur="update(ngModel)" view="date" min-view="date" partial="true"/></div>');
$templateCache.put('/imago/imago-field-file.html','<input type="file" name="receipt" id="receipt" sizeerror="sizeerror"/><label for="receipt" ng-if="!filename">{{label}} (max {{maxFileSize}}mb)</label><label for="receipt" ng-if="filename">File: {{filename}}</label><div ng-show="sizeerror" class="error">Image File to large</div>');
$templateCache.put('/imago/imago-field-number.html','<div class="imago-field-number-content imago-field"><div ng-transclude="ng-transclude"></div><input type="text" ng-model="ngModel" ng-model-options="{\'updateOn\': \'blur\'}" ng-change="update(ngModel)" ng-disabled="disabled" autocomplete="off" ng-readonly="readonly"/><button type="button" ng-disabled="isOverMin() || disabled" ng-click="decrement()" class="decrement"></button><button type="button" ng-disabled="isOverMax() || disabled" ng-click="increment()" class="increment"></button></div>');}]);