var imagoSlider, imagoSliderController,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

imagoSlider = (function() {
  function imagoSlider($rootScope, $document, $interval, $location, $timeout) {
    return {
      transclude: true,
      scope: true,
      templateUrl: '/imago/imago-slider.html',
      controller: 'imagoSliderController as imagoslider',
      bindToController: {
        assets: '=?imagoSlider'
      },
      link: function(scope, element, attrs, ctrl, transclude) {
        var keyboardBinding, watchers;
        transclude(scope, function(clone) {
          return element.children().children().eq(0).append(clone);
        });
        watchers = [];
        scope.$watchCollection('imagoslider.assets', function(data) {
          if (!data || !_.isArray(data)) {
            return;
          }
          scope.imagoslider.length = data.length;
          scope.imagoslider.init();
          return scope.prefetch('initial');
        });
        scope.setSiblings = function() {
          return scope.imagoslider.opts.siblings = !!(scope.imagoslider.opts.next && scope.imagoslider.opts.prev);
        };
        scope.setSiblings();
        if (angular.isDefined(attrs.prev)) {
          attrs.$observe('prev', function() {
            scope.imagoslider.opts.prev = attrs.prev;
            return scope.setSiblings();
          });
        }
        if (angular.isDefined(attrs.next)) {
          attrs.$observe('next', function() {
            scope.imagoslider.opts.next = attrs.next;
            return scope.setSiblings();
          });
        }
        if ($location.path().indexOf('last')) {
          scope.currentIndex = parseInt(scope.imagoslider.opts.current);
        } else {
          scope.currentIndex = scope.getLast();
        }
        scope.clearInterval = function() {
          if (!scope.imagoslider.opts.interval) {
            return;
          }
          return $interval.cancel(scope.imagoslider.opts.interval);
        };
        scope.imagoslider.goPrev = function(ev) {
          if (typeof ev === 'object') {
            scope.clearInterval();
            ev.stopPropagation();
          }
          if (!scope.imagoslider.opts.loop) {
            scope.imagoslider.setCurrent(scope.currentIndex > 0 ? scope.currentIndex - 1 : scope.currentIndex);
          } else if (scope.imagoslider.opts.loop && !scope.imagoslider.opts.siblings) {
            scope.imagoslider.setCurrent(scope.currentIndex > 0 ? scope.currentIndex - 1 : parseInt(scope.imagoslider.length) - 1);
          } else if (scope.imagoslider.opts.loop && scope.imagoslider.opts.siblings) {
            if (scope.currentIndex > 0) {
              scope.imagoslider.setCurrent(scope.currentIndex - 1);
            } else {
              $location.path(scope.imagoslider.opts.prev);
            }
          }
          return scope.prefetch('prev');
        };
        scope.imagoslider.goNext = (function(_this) {
          return function(ev, clearInterval) {
            if (clearInterval == null) {
              clearInterval = true;
            }
            if (typeof ev === 'object' || clearInterval) {
              scope.clearInterval();
              if (ev) {
                ev.stopPropagation();
              }
            }
            if (!scope.imagoslider.opts.loop) {
              scope.imagoslider.setCurrent(scope.currentIndex < scope.imagoslider.length - 1 ? scope.currentIndex + 1 : scope.currentIndex);
            } else if (scope.imagoslider.opts.loop && !scope.imagoslider.opts.siblings) {
              scope.imagoslider.setCurrent(scope.currentIndex < scope.imagoslider.length - 1 ? scope.currentIndex + 1 : 0);
            } else if (scope.imagoslider.opts.loop && scope.imagoslider.opts.siblings) {
              if (scope.currentIndex < scope.imagoslider.length - 1) {
                scope.imagoslider.setCurrent(scope.currentIndex + 1);
              } else {
                $location.path(scope.imagoslider.opts.next);
              }
            }
            return scope.prefetch('next');
          };
        })(this);
        scope.prefetch = function(direction) {
          var idx, image, ref, ref1;
          if (!scope.imagoslider.opts.prefetch || !((ref = scope.imagoslider.assets) != null ? ref.length : void 0)) {
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
              case !(index === 0 && scope.currentIndex === (parseInt(this.length) - 1) && !scope.imagoslider.opts.siblings):
                return 'next';
              case !(index === (parseInt(this.length) - 1) && scope.currentIndex === 0 && !scope.imagoslider.opts.siblings):
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
          return $rootScope.$emit(scope.imagoslider.opts.namespace + ":changed", index);
        };
        if (!_.isUndefined(attrs.autoplay)) {
          scope.$watch(attrs.autoplay, (function(_this) {
            return function(value) {
              if (parseInt(value) > 0) {
                return scope.imagoslider.opts.interval = $interval(function() {
                  return scope.imagoslider.goNext('', false);
                }, parseInt(value));
              } else {
                return scope.clearInterval();
              }
            };
          })(this));
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
        if (scope.imagoslider.opts.enablekeys) {
          $document.on('keydown', keyboardBinding);
        }
        watchers.push($rootScope.$on(scope.imagoslider.opts.namespace + ":change", function(evt, index) {
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

  return imagoSlider;

})();

imagoSliderController = (function() {
  function imagoSliderController($scope, $attrs, $element) {
    var key, ref;
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.setServingSize = bind(this.setServingSize, this);
    this.opts = {
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
    for (key in this.$attrs) {
      if (!this.opts[key]) {
        continue;
      }
      if ((ref = this.$attrs[key]) === 'true' || ref === 'false') {
        this.opts[key] = JSON.parse(this.$attrs[key]);
      } else if (!isNaN(this.$attrs[key])) {
        this.opts[key] = Number(this.$attrs[key]);
      } else {
        this.opts[key] = this.$attrs[key];
      }
    }
  }

  imagoSliderController.prototype.init = function() {
    this.slider = new Swiper(this.$element.children(), {
      loop: true,
      initialSlide: 0,
      showNavButtons: true,
      slidesPerView: 1,
      slidesPerColumn: 1,
      lazyLoading: true,
      preloadImages: false,
      spaceBetween: 0,
      direction: 'horizontal',
      pagination: '.swiper-pagination',
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev'
    });
    return this.slider.on('slideChangeStart', (function(_this) {
      return function() {
        return _this.goNext();
      };
    })(this));
  };

  imagoSliderController.prototype.setServingSize = function(value) {
    if (this.servingSize) {
      return this.servingSize = value;
    }
    this.servingSize = value;
    return this.$scope.prefetch('initial');
  };

  return imagoSliderController;

})();

angular.module('imago').directive('imagoSlider', ['$rootScope', '$document', '$interval', '$location', '$timeout', imagoSlider]).controller('imagoSliderController', ['$scope', '$attrs', '$element', imagoSliderController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-slider.html","<div class=\"swiper-container\"><div class=\"swiper-wrapper\"></div><div class=\"swiper-pagination\"></div><div class=\"swiper-button-prev\"></div><div class=\"swiper-button-next\"></div><div class=\"swiper-scrollbar\"></div></div>");}]);