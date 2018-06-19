(function() {
  var ImagoSlider, ImagoSliderController;

  ImagoSlider = (function() {
    function ImagoSlider($rootScope, $document, $interval, $location) {
      return {
        restrict: 'E',
        transclude: true,
        scope: true,
        templateUrl: '/imago/imago-slider.html',
        controller: 'imagoSliderController as imagoslider',
        bindToController: {
          assets: '=?data'
        },
        link: function(scope, element, attrs, ctrl, transclude) {
          var key, keyboardBinding, value, watchers;
          transclude(scope, function(clone) {
            return element.children().append(clone);
          });
          for (key in attrs) {
            value = attrs[key];
            if (key.charAt(0) === '$') {
              continue;
            }
            if (value === 'true' || value === 'false') {
              value = JSON.parse(value);
            }
            scope.imagoslider.conf[key] = value;
          }
          scope.$watchCollection('imagoslider.assets', function(data) {
            if (!data || !_.isArray(data)) {
              return;
            }
            scope.imagoslider.length = data.length;
            return scope.prefetch('initial');
          });
          scope.setSiblings = function() {
            return scope.imagoslider.conf.siblings = !!(scope.imagoslider.conf.next && scope.imagoslider.conf.prev);
          };
          scope.setSiblings();
          if (angular.isDefined(attrs.prev)) {
            attrs.$observe('prev', function() {
              scope.imagoslider.conf.prev = attrs.prev;
              return scope.setSiblings();
            });
          }
          if (angular.isDefined(attrs.next)) {
            attrs.$observe('next', function() {
              scope.imagoslider.conf.next = attrs.next;
              return scope.setSiblings();
            });
          }
          if ($location.path().indexOf('last')) {
            scope.currentIndex = parseInt(scope.imagoslider.conf.current);
          } else {
            scope.currentIndex = scope.getLast();
          }
          scope.clearInterval = function() {
            if (!scope.imagoslider.conf.interval) {
              return;
            }
            return $interval.cancel(scope.imagoslider.conf.interval);
          };
          scope.imagoslider.goPrev = function(ev) {
            if (typeof ev === 'object') {
              scope.clearInterval();
              ev.stopPropagation();
            }
            if (!scope.imagoslider.conf.loop) {
              scope.imagoslider.setCurrent((scope.currentIndex > 0) ? scope.currentIndex - 1 : scope.currentIndex);
            } else if (scope.imagoslider.conf.loop && !scope.imagoslider.conf.siblings) {
              scope.imagoslider.setCurrent((scope.currentIndex > 0) ? scope.currentIndex - 1 : parseInt(scope.imagoslider.length) - 1);
            } else if (scope.imagoslider.conf.loop && scope.imagoslider.conf.siblings) {
              if (scope.currentIndex > 0) {
                scope.imagoslider.setCurrent(scope.currentIndex - 1);
              } else {
                $location.path(scope.imagoslider.conf.prev);
              }
            }
            return scope.prefetch('prev');
          };
          scope.imagoslider.goNext = function(ev, clearInterval) {
            if (clearInterval == null) {
              clearInterval = true;
            }
            if (typeof ev === 'object' || clearInterval) {
              scope.clearInterval();
              if (ev) {
                ev.stopPropagation();
              }
            }
            if (!scope.imagoslider.conf.loop) {
              scope.imagoslider.setCurrent((scope.currentIndex < scope.imagoslider.length - 1) ? scope.currentIndex + 1 : scope.currentIndex);
            } else if (scope.imagoslider.conf.loop && !scope.imagoslider.conf.siblings) {
              scope.imagoslider.setCurrent((scope.currentIndex < scope.imagoslider.length - 1) ? scope.currentIndex + 1 : 0);
            } else if (scope.imagoslider.conf.loop && scope.imagoslider.conf.siblings) {
              if (scope.currentIndex < scope.imagoslider.length - 1) {
                scope.imagoslider.setCurrent(scope.currentIndex + 1);
              } else {
                $location.path(scope.imagoslider.conf.next);
              }
            }
            return scope.prefetch('next');
          };
          scope.prefetch = function(direction) {
            var idx, image, ref, ref1;
            if (!scope.imagoslider.conf.prefetch || !((ref = scope.imagoslider.assets) != null ? ref.length : void 0)) {
              return;
            }
            if (scope.currentIndex === scope.getLast()) {
              idx = 0;
            } else if (direction === 'initial') {
              idx = 1;
            } else if (direction === 'prev') {
              idx = angular.copy(scope.currentIndex) - 1;
            } else if (direction === 'next') {
              idx = angular.copy(scope.currentIndex) + 1;
            }
            if (!((ref1 = scope.imagoslider.assets[idx]) != null ? ref1.serving_url : void 0) || !scope.imagoslider.servingSize) {
              return;
            }
            image = new Image();
            return image.src = scope.imagoslider.assets[idx].serving_url + scope.imagoslider.servingSize;
          };
          scope.getLast = function() {
            return Number(scope.imagoslider.length) - 1;
          };
          scope.getCurrent = function() {
            return scope.currentIndex;
          };
          scope.imagoslider.setCurrent = function(index) {
            scope.action = (function() {
              switch (false) {
                case !(index === 0 && scope.currentIndex === (parseInt(this.length) - 1) && !this.conf.siblings):
                  return 'next';
                case !(index === (parseInt(this.length) - 1) && scope.currentIndex === 0 && !this.conf.siblings):
                  return 'prev';
                case !(index > scope.currentIndex):
                  return 'next';
                case !(index < scope.currentIndex):
                  return 'prev';
                default:
                  return '';
              }
            }).call(this);
            if (index === void 0) {
              return this.goNext();
            }
            scope.currentIndex = index;
            return $rootScope.$emit(this.conf.namespace + ":changed", index);
          };
          if (!_.isUndefined(attrs.autoplay)) {
            scope.$watch(attrs.autoplay, function(value) {
              if (parseInt(value) > 0) {
                return scope.imagoslider.conf.interval = $interval(function() {
                  return scope.imagoslider.goNext('', false);
                }, parseInt(value));
              } else {
                return scope.clearInterval();
              }
            });
          }
          keyboardBinding = function(e) {
            switch (e.keyCode) {
              case 37:
                return scope.$apply(function() {
                  return scope.imagoslider.goPrev();
                });
              case 39:
                return scope.$apply(function() {
                  return scope.imagoslider.goNext();
                });
            }
          };
          if (scope.imagoslider.conf.enablekeys) {
            $document.on('keydown', keyboardBinding);
          }
          watchers = [];
          watchers.push($rootScope.$on(scope.imagoslider.conf.namespace + ":change", function(evt, index) {
            scope.clearInterval();
            return scope.imagoslider.setCurrent(index);
          }));
          return scope.$on('$destroy', function() {
            var i, len, results, watch;
            $document.off("keydown", keyboardBinding);
            scope.clearInterval();
            results = [];
            for (i = 0, len = watchers.length; i < len; i++) {
              watch = watchers[i];
              results.push(watch());
            }
            return results;
          });
        }
      };
    }

    return ImagoSlider;

  })();

  ImagoSliderController = (function() {
    function ImagoSliderController($scope) {
      this.conf = {
        animation: 'fade',
        enablekeys: true,
        enablearrows: true,
        loop: true,
        current: 0,
        namespace: 'slider',
        autoplay: 0,
        next: null,
        prev: null,
        prefetch: true
      };
      this.setServingSize = (function(_this) {
        return function(value) {
          if (_this.servingSize) {
            return _this.servingSize = value;
          } else {
            _this.servingSize = value;
            return $scope.prefetch('initial');
          }
        };
      })(this);
    }

    return ImagoSliderController;

  })();

  angular.module('imago').directive('imagoSlider', ['$rootScope', '$document', '$interval', '$location', ImagoSlider]).controller('imagoSliderController', ['$scope', ImagoSliderController]);

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/imago-slider.html','<div ng-class="[imagoslider.conf.animation, action]" ng-swipe-left="imagoslider.goNext($event)" ng-swipe-right="imagoslider.goPrev($event)" class="imago-slider-content"><div ng-show="imagoslider.conf.enablearrows &amp;&amp; imagoslider.length &gt; 1" ng-click="imagoslider.goPrev($event)" analytics-on="click" analytics-event="Previous Slide" class="prev"></div><div ng-show="imagoslider.conf.enablearrows &amp;&amp; imagoslider.length &gt; 1" ng-click="imagoslider.goNext($event)" analytics-on="click" analytics-event="Next Slide" class="next"></div></div>');}]);