var imagoControls, imagoControlsController;

imagoControls = (function() {
  function imagoControls() {
    return {
      replace: true,
      require: '^imagoVideo',
      templateUrl: '/imago/controls-video.html',
      controller: 'imagoControlsController as imagocontrols',
      link: function(scope, element, attrs) {
        scope.seek = function(value) {
          return scope.imagovideo.player.currentTime = value;
        };
        scope.onVolumeChange = (function(_this) {
          return function(e) {
            return scope.imagovideo.player.volume = parseFloat(e / 100);
          };
        })(this);
        scope.volumeDown = (function(_this) {
          return function() {
            scope.imagovideo.player.volume = 0;
            return scope.volumeInput = 0;
          };
        })(this);
        scope.volumeUp = (function(_this) {
          return function() {
            scope.imagovideo.player.volume = 1;
            return scope.volumeInput = 100;
          };
        })(this);
        scope.fullScreen = (function(_this) {
          return function() {
            if (scope.imagovideo.player.requestFullscreen) {
              return scope.imagovideo.player.requestFullscreen();
            } else if (scope.imagovideo.player.webkitRequestFullscreen) {
              return scope.imagovideo.player.webkitRequestFullscreen();
            } else if (scope.imagovideo.player.mozRequestFullScreen) {
              return scope.imagovideo.player.mozRequestFullScreen();
            } else if (scope.imagovideo.player.msRequestFullscreen) {
              return scope.imagovideo.player.msRequestFullscreen();
            }
          };
        })(this);
        element.bind('mouseup', function(e) {
          return e.stopPropagation();
        });
        return element.bind('mousedown', function(e) {
          return e.stopPropagation();
        });
      }
    };
  }

  return imagoControls;

})();

imagoControlsController = (function() {
  function imagoControlsController($scope) {
    var videoPlayer;
    videoPlayer = angular.element($scope.imagovideo.player);
    $scope.currentTime = 0;
    videoPlayer.bind('loadeddata', function(e) {
      $scope.duration = parseInt(e.target.duration);
      return $scope.$digest();
    });
    videoPlayer.bind('timeupdate', function(e) {
      $scope.currentTime = e.target.currentTime;
      return $scope.$digest();
    });
    videoPlayer.bind('seeking', function(e) {
      $scope.currentTime = e.target.currentTime;
      return $scope.$digest();
    });
  }

  return imagoControlsController;

})();

angular.module('imago').directive('imagoControls', [imagoControls]).controller('imagoControlsController', ['$scope', imagoControlsController]);

var imagoVideo, imagoVideoController,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

imagoVideo = (function() {
  function imagoVideo($timeout, $rootScope, imagoUtils, imagoModel) {
    this.$timeout = $timeout;
    this.$rootScope = $rootScope;
    return {
      scope: true,
      templateUrl: '/imago/imago-video.html',
      controller: 'imagoVideoController as imagovideo',
      bindToController: true,
      link: function(scope, element, attrs) {
        var destroy, watcher;
        destroy = function() {
          return scope.$applyAsync(function() {
            scope.$destroy();
            return element.remove();
          });
        };
        if (attrs.imagoVideo.match(/[0-9a-fA-F]{24}/)) {
          return watcher = attrs.$observe('imagoVideo', function(data) {
            if (!data) {
              return;
            }
            watcher();
            data = imagoModel.find({
              '_id': data
            });
            if (!data.serving_url) {
              return destroy();
            }
            return scope.imagovideo.init(data);
          });
        } else {
          return watcher = scope.$watch(attrs.imagoVideo, (function(_this) {
            return function(data) {
              if (!data) {
                return;
              }
              watcher();
              if (!data.serving_url) {
                return destroy();
              }
              return scope.imagovideo.init(data);
            };
          })(this));
        }
      }
    };
  }

  return imagoVideo;

})();

imagoVideoController = (function() {
  function imagoVideoController($rootScope, $attrs, $scope, $element, $sce) {
    var key, ref;
    this.$rootScope = $rootScope;
    this.$attrs = $attrs;
    this.$scope = $scope;
    this.$element = $element;
    this.$sce = $sce;
    this.render = bind(this.render, this);
    this.watchers = [];
    this.dpr = Math.ceil(window.devicePixelRatio, 1) || 1;
    this.opts = {
      autobuffer: null,
      autoplay: false,
      controls: true,
      preload: 'none',
      size: 'hd',
      align: 'center center',
      sizemode: 'fit',
      hires: true,
      loop: false,
      width: '',
      height: '',
      responsive: true
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
    if (this.opts.responsive) {
      this.watchers.push(this.$rootScope.$on('resize', (function(_this) {
        return function() {
          return _this.$scope.$applyAsync(function() {
            return _this.resize();
          });
        };
      })(this)));
      this.watchers.push(this.$rootScope.$on('resizestop', (function(_this) {
        return function() {
          return console.log('resizestop');
        };
      })(this)));
    }
    this.$scope.$on('$destroy', (function(_this) {
      return function() {
        var i, len, ref1, results, watcher;
        ref1 = _this.watchers;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          watcher = ref1[i];
          results.push(watcher());
        }
        return results;
      };
    })(this));
  }

  imagoVideoController.prototype.init = function(data) {
    var host, i, len, ref, ref1, ref2, ref3, ref4, ref5, source;
    this.data = data;
    this.placeholderUrl = this.data.b64 || (this.data.serving_url + "=s3");
    this.resolution = this.data.resolution.split('x');
    this.assetRatio = _.first(this.resolution) / _.last(this.resolution);
    this.spacerStyle = {
      paddingBottom: (_.last(this.resolution) / _.first(this.resolution) * 100) + "%"
    };
    if (this.opts.sizemode === 'crop') {
      this.mainSide = this.assetRatio > 1 ? 'height' : 'width';
    } else {
      this.mainSide = this.assetRatio < 1 ? 'height' : 'width';
    }
    if (((ref = this.data.fields) != null ? (ref1 = ref.crop) != null ? ref1.value : void 0 : void 0) && !this.$attrs.align) {
      this.opts.align = this.data.fields.crop.value;
    }
    if (((ref2 = this.data.fields) != null ? (ref3 = ref2.sizemode) != null ? ref3.value : void 0 : void 0) && this.data.fields.sizemode.value !== 'default' && !this.$attrs.sizemode) {
      this.opts.sizemode = this.data.fields.sizemode.value;
    }
    this.sources = [];
    if (!((ref4 = data.fields.formats) != null ? ref4.length : void 0)) {
      if (typeof trackJs !== "undefined" && trackJs !== null) {
        trackJs.track("Video " + data._id + " has no formats");
      }
      console.log("Video " + data._id + " has no formats");
      return;
    }
    host = data === 'online' ? 'api.imago.io' : 'localhost:8000';
    ref5 = data.fields.formats;
    for (i = 0, len = ref5.length; i < len; i++) {
      source = ref5[i];
      this.sources.push({
        src: this.$sce.trustAsResourceUrl("//" + host + "/api/play_redirect?uuid=" + data.uuid + "&codec=" + source.codec + "&quality=hd"),
        type: "video/" + source.codec
      });
    }
    this.poster = data.serving_url + "=s720";
    return this.$scope.$applyAsync((function(_this) {
      return function() {
        return _this.resize();
      };
    })(this));
  };

  imagoVideoController.prototype.resize = function() {
    console.log('resize');
    this.width = this.$element.children()[0].clientWidth;
    this.height = this.$element.children()[0].clientHeight;
    this.wrapperRatio = this.width / this.height;
    if (!this.height) {
      return;
    }
    if (this.opts.sizemode === 'crop') {
      this.mainSide = this.assetRatio < this.wrapperRatio ? 'width' : 'height';
    } else {
      this.mainSide = this.assetRatio > this.wrapperRatio ? 'width' : 'height';
    }
    return console.log('@mainSide', this.mainSide);
  };

  imagoVideoController.prototype.render = function() {
    return console.log('render');
  };

  return imagoVideoController;

})();

angular.module('imago').directive('imagoVideo', ['$timeout', '$rootScope', 'imagoUtils', 'imagoModel', imagoVideo]).controller('imagoVideoController', ['$rootScope', '$attrs', '$scope', '$element', '$sce', imagoVideoController]);

var Time;

Time = (function() {
  function Time() {
    return function(input) {
      var calc, hours, minutes, pad, seconds;
      if (typeof input !== 'number') {
        return;
      }
      pad = function(num) {
        if (num < 10) {
          return "0" + num;
        }
        return num;
      };
      calc = [];
      minutes = Math.floor(input / 60);
      hours = Math.floor(input / 3600);
      seconds = (input === 0 ? 0 : input % 60);
      seconds = Math.round(seconds);
      if (hours > 0) {
        calc.push(pad(hours));
      }
      calc.push(pad(minutes));
      calc.push(pad(seconds));
      return calc.join(":");
    };
  }

  return Time;

})();

angular.module('imago').filter('time', [Time]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-video.html","<div ng-class=\"[imagovideo.opts.align, imagovideo.opts.sizemode, imagovideo.mainSide]\" class=\"imago-video\"><div class=\"imago-video-wrapper\"><div ng-style=\"::imagovideo.spacerStyle\" class=\"spacer\"></div><videogular vg-auto-play=\"::imagovideo.opts.autoplay\"><vg-media vg-src=\"imagovideo.sources\"></vg-media><vg-controls ng-if=\"::imagovideo.opts.controls\" vg-autohide=\"true\"><vg-play-pause-button></vg-play-pause-button><vg-time-display>{{ currentTime | date:\'mm:ss\' }}</vg-time-display><vg-scrub-bar><vg-scrub-bar-current-time></vg-scrub-bar-current-time></vg-scrub-bar><vg-time-display>{{ timeLeft | date:\'mm:ss\' }}</vg-time-display><vg-volume><vg-mute-button></vg-mute-button><vg-volume-bar></vg-volume-bar></vg-volume><vg-fullscreen-button></vg-fullscreen-button></vg-controls><vg-overlay-play></vg-overlay-play><vg-poster vg-url=\"imagovideo.poster\"></vg-poster></videogular></div></div>");}]);