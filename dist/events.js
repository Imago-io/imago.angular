(function() {
  var ResponsiveEvents;

  ResponsiveEvents = (function() {
    function ResponsiveEvents($window, $rootScope) {
      return {
        restrict: 'A',
        link: function($scope) {
          var onMouseWheelStart, onResizeStart, onScrollStart, w;
          w = angular.element($window);
          onResizeStart = (function(_this) {
            return function(e) {
              var resizeStop;
              if (_this.resizeing) {
                return;
              }
              $rootScope.$emit('resizestart');
              _this.resizeing = true;
              return resizeStop = $rootScope.$on('resizestop', function() {
                _this.resizeing = false;
                return resizeStop();
              });
            };
          })(this);
          onScrollStart = (function(_this) {
            return function(e) {
              var scrollStop;
              if (_this.scrolling) {
                return;
              }
              $rootScope.$emit('scrollstart');
              _this.scrolling = true;
              return scrollStop = $rootScope.$on('scrollstop', function() {
                _this.scrolling = false;
                return scrollStop();
              });
            };
          })(this);
          onMouseWheelStart = (function(_this) {
            return function(e) {
              var mouseStop;
              if (_this.isMouseWheeling) {
                return;
              }
              $rootScope.$emit('mousewheelstart');
              _this.isMouseWheeling = true;
              return mouseStop = $rootScope.$on('mousewheelstop', function() {
                _this.isMouseWheeling = false;
                return mouseStop();
              });
            };
          })(this);
          w.on('resize', function() {
            return $rootScope.$emit('resize');
          });
          w.on('resize', onResizeStart);
          w.on('resize', _.debounce((function() {
            return $rootScope.$emit('resizestop');
          }), 200));
          w.on('resize', _.throttle((function() {
            return $rootScope.$emit('resizelimit');
          }), 150));
          w.on('scroll', onScrollStart);
          w.on('scroll', _.debounce((function() {
            return $rootScope.$emit('scrollstop');
          }), 200));
          w.on('scroll', _.throttle((function() {
            return $rootScope.$emit('scrolllimit');
          }), 150));
          w.on('mousewheel', onMouseWheelStart);
          w.on('mousewheel', _.debounce((function() {
            return $rootScope.$emit('mousewheelstop');
          }), 200));
          return w.on('mousewheel', _.throttle((function() {
            return $rootScope.$emit('mousewheellimit');
          }), 150));
        }
      };
    }

    return ResponsiveEvents;

  })();

  angular.module('imago').directive('responsiveEvents', ['$window', '$rootScope', ResponsiveEvents]);

}).call(this);

(function() {
  var StopEvent;

  StopEvent = (function() {
    function StopEvent() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var event, events, i, len, results;
          if (attrs && attrs.stopEvent) {
            events = attrs.stopEvent.split(' ');
            results = [];
            for (i = 0, len = events.length; i < len; i++) {
              event = events[i];
              results.push(element.bind(event, function(e) {
                return e.stopPropagation();
              }));
            }
            return results;
          }
        }
      };
    }

    return StopEvent;

  })();

  angular.module('imago').directive('stopEvent', [StopEvent]);

}).call(this);

(function() {
  var StopPropagation;

  StopPropagation = (function() {
    function StopPropagation() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var createBind, i, item, len, options, results;
          options = attrs.stopPropagation;
          if (typeof console.warn === "function") {
            console.warn('stop-propagation is deprecated, use stop-event="click" instead');
          }
          if (options === 'stop-propagation' || options === '') {
            element.bind('click', function(evt) {
              return evt.stopPropagation();
            });
            return element.bind('dblclick', function(evt) {
              return evt.stopPropagation();
            });
          } else {
            createBind = function(eventName) {
              return element.bind(eventName, function(evt) {
                return evt.stopPropagation();
              });
            };
            options = options.split(' ');
            if (!options.length) {
              return;
            }
            results = [];
            for (i = 0, len = options.length; i < len; i++) {
              item = options[i];
              results.push(createBind(item));
            }
            return results;
          }
        }
      };
    }

    return StopPropagation;

  })();

  angular.module('imago').directive('stopPropagation', [StopPropagation]);

}).call(this);

(function() {
  var StopScroll;

  StopScroll = (function() {
    function StopScroll() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          return element.on('mousewheel', function(evt) {
            var minus;
            minus = element[0].scrollHeight - element[0].clientHeight;
            if (minus === 0) {
              return;
            }
            if ((minus === element[0].scrollTop && evt.wheelDelta < 0) || (element[0].scrollTop === 0 && evt.wheelDelta > 0)) {
              return evt.preventDefault();
            }
          });
        }
      };
    }

    return StopScroll;

  })();

  angular.module('imago').directive('stopScroll', [StopScroll]);

}).call(this);
