var imagoControls;

imagoControls = (function() {
  function imagoControls() {
    return {
      replace: true,
      require: '^imagoVideo',
      controllerAs: 'imagocontrols',
      templateUrl: '/imago/controlsVideo.html',
      controller: function($scope) {
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
        return videoPlayer.bind('seeking', function(e) {
          $scope.currentTime = e.target.currentTime;
          return $scope.$digest();
        });
      },
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

angular.module('imago').directive('imagoControls', [imagoControls]);

var imagoVideo;

imagoVideo = (function() {
  function imagoVideo($q, $timeout, $window, imagoUtils) {
    return {
      replace: true,
      scope: true,
      templateUrl: '/imago/imagoVideo.html',
      controllerAs: 'imagovideo',
      controller: function($scope, $element, $attrs, $transclude) {
        this.player = $element.find('video')[0];
        $scope.loading = true;
        angular.element(this.player).bind('ended', (function(_this) {
          return function(e) {
            _this.player.currentTime = 0;
            return _this.isPlaying = false;
          };
        })(this));
        angular.element(this.player).bind('loadeddata', (function(_this) {
          return function() {
            $scope.hasPlayed = true;
            return angular.element(_this.player).unbind('loadeddata');
          };
        })(this));
        angular.element(this.player).bind('play', (function(_this) {
          return function() {
            return _this.isPlaying = true;
          };
        })(this));
        return this.togglePlay = (function(_this) {
          return function() {
            if (_this.player.paused) {
              return _this.player.play();
            } else {
              _this.isPlaying = false;
              return _this.player.pause();
            }
          };
        })(this);
      },
      link: function(scope, element, attrs) {
        var detectCodec, key, loadFormats, onResize, opts, preload, render, self, setPlayerAttrs, styleVideo, styleWrapper, value;
        self = {
          visible: false
        };
        opts = {
          autobuffer: null,
          autoplay: false,
          controls: true,
          preload: 'none',
          size: 'hd',
          align: 'center center',
          sizemode: 'fit',
          lazy: true,
          hires: true,
          loop: false,
          width: '',
          height: ''
        };
        for (key in attrs) {
          value = attrs[key];
          if (value === 'true' || value === 'false') {
            opts[key] = JSON.parse(value);
          } else if (key === 'width' || key === 'height') {
            opts[key] = value === 'auto' ? value : parseInt(value);
          } else {
            opts[key] = value;
          }
        }
        self.watch = scope.$watch(attrs['imagoVideo'], (function(_this) {
          return function(data) {
            var ref;
            if (!data) {
              return;
            }
            if (!attrs['watch']) {
              self.watch();
            }
            self.source = data;
            if (!((ref = self.source) != null ? ref.serving_url : void 0)) {
              element.remove();
              return;
            }
            if (self.source.fields.hasOwnProperty('crop') && !attrs['align']) {
              opts.align = self.source.fields.crop.value;
            }
            if (self.source.fields.hasOwnProperty('sizemode') && !attrs['sizemode']) {
              opts.sizemode = self.source.fields.sizemode.value;
            }
            return preload(self.source);
          };
        })(this));
        preload = function(data) {
          var dpr, height, r, resolution, serving_url, style, width;
          if (angular.isString(data.resolution)) {
            r = data.resolution.split('x');
            resolution = {
              width: r[0],
              height: r[1]
            };
            opts.assetRatio = r[0] / r[1];
          }
          scope.controls = opts.controls;
          if (opts.width && opts.height) {
            width = opts.width;
            height = opts.height;
          } else {
            width = element[0].clientWidth;
            height = element[0].clientHeight;
          }
          dpr = opts.hires ? Math.ceil(window.devicePixelRatio) || 1 : 1;
          serving_url = data.serving_url + "=s" + (Math.ceil(Math.min(Math.max(width, height) * dpr)) || 1600);
          style = {
            size: opts.size,
            sizemode: opts.sizemode,
            backgroundPosition: opts.align,
            backgroundImage: "url(" + serving_url + ")",
            backgroundRepeat: "no-repeat"
          };
          scope.wrapperStyle = style;
          setPlayerAttrs();
          scope.videoFormats = loadFormats(self.source);
          return render(width, height, serving_url);
        };
        setPlayerAttrs = function() {
          if (opts.autoplay === true) {
            scope.imagovideo.player.setAttribute("autoplay", true);
          }
          scope.imagovideo.player.setAttribute("preload", opts.preload);
          scope.imagovideo.player.setAttribute("x-webkit-airplay", "allow");
          scope.imagovideo.player.setAttribute("webkitAllowFullscreen", true);
          return scope.imagovideo.player.setAttribute("loop", opts.loop);
        };
        render = (function(_this) {
          return function(width, height, servingUrl) {
            var img;
            if (opts.lazy && !self.visible) {
              return self.visibleFunc = scope.$watch(attrs['visible'], function(value) {
                if (!value) {
                  return;
                }
                self.visible = true;
                self.visibleFunc();
                return render(width, height, servingUrl);
              });
            } else {
              img = angular.element('<img>');
              img.on('load', function(e) {
                _.assign(scope.wrapperStyle, styleWrapper(width, height));
                scope.videoStyle = styleVideo(width, height);
                scope.loading = false;
                return scope.$apply();
              });
              return img[0].src = servingUrl;
            }
          };
        })(this);
        styleWrapper = function(width, height) {
          var style, wrapperRatio;
          if (!(width && height)) {
            return;
          }
          style = {};
          wrapperRatio = width / height;
          if (opts.sizemode === 'crop') {
            if (opts.assetRatio < wrapperRatio) {
              style.backgroundSize = '100% auto';
            } else {
              style.backgroundSize = 'auto 100%';
            }
          } else {
            if (opts.assetRatio < wrapperRatio) {
              style.width = (Math.round(height * opts.assetRatio)) + "px";
              style.height = height + "px";
              style.backgroundSize = 'auto 100%';
            } else {
              style.width = width + "px";
              style.height = (Math.round(width / opts.assetRatio)) + "px";
              style.backgroundSize = '100% auto';
            }
          }
          return style;
        };
        styleVideo = (function(_this) {
          return function(width, height) {
            var style, wrapperRatio;
            if (!(width && height)) {
              return;
            }
            style = {};
            wrapperRatio = width / height;
            if (imagoUtils.isiOS()) {
              style.width = '100%';
              style.height = '100%';
              if (opts.align === 'center center' && opts.sizemode === 'crop') {
                style.top = '0';
                style.left = '0';
              }
            } else {
              if (opts.sizemode === 'crop') {
                if (opts.assetRatio < wrapperRatio) {
                  style.width = '100%';
                  style.height = 'auto';
                  if (opts.align === 'center center') {
                    style.top = '50%';
                    style.left = 'auto';
                    style.marginTop = "-" + (Math.round(height / 2)) + "px";
                    style.marginLeft = '0px';
                  }
                } else {
                  style.width = 'auto';
                  style.height = '100%';
                  if (opts.align === 'center center') {
                    style.top = 'auto';
                    style.left = '50%';
                    style.marginTop = '0px';
                    style.marginLeft = "-" + (Math.round(width / 2)) + "px";
                  }
                }
              } else {
                if (opts.assetRatio < wrapperRatio) {
                  style.width = 'auto';
                  style.height = '100%';
                } else {
                  style.width = '100%';
                  style.height = 'auto';
                }
              }
            }
            return style;
          };
        })(this);
        loadFormats = function(asset) {
          var codec, format, formats, host, i, j, len, ref;
          formats = [];
          codec = detectCodec();
          asset.fields.formats.sort(function(a, b) {
            return b.height - a.height;
          });
          host = data === 'online' ? 'api.imago.io' : 'localhost:8000';
          ref = asset.fields.formats;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            format = ref[i];
            if (codec !== format.codec) {
              continue;
            }
            formats.push({
              "src": "//" + host + "/api/play_redirect?uuid=" + asset.uuid + "&codec=" + format.codec + "&quality=hd&max_size=" + format.size,
              "size": format.size,
              "codec": format.codec,
              "type": "video/" + codec
            });
          }
          return formats;
        };
        detectCodec = function() {
          var codecs;
          if (!scope.imagovideo.player.canPlayType) {
            return;
          }
          codecs = {
            mp4: 'video/mp4; codecs="mp4v.20.8"',
            mp4: 'video/mp4; codecs="avc1.42E01E"',
            mp4: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
            webm: 'video/webm; codecs="vp8, vorbis"',
            ogg: 'video/ogg; codecs="theora"'
          };
          for (key in codecs) {
            value = codecs[key];
            if (scope.imagovideo.player.canPlayType(value)) {
              return key;
            }
          }
        };
        scope.toggleSize = function() {
          if (opts.size === 'hd') {
            opts.size = 'sd';
            scope.wrapperStyle.size = 'sd';
          } else {
            opts.size = 'hd';
            scope.wrapperStyle.size = 'hd';
          }
          scope.videoFormats.reverse();
          return $timeout(function() {
            scope.imagovideo.player.load();
            return scope.imagovideo.player.play();
          });
        };
        onResize = function() {
          var height, width;
          width = element[0].clientWidth || opts.width;
          height = element[0].clientHeight || opts.height;
          _.assign(scope.wrapperStyle, styleWrapper(width, height));
          scope.videoStyle = styleVideo(width, height);
          return scope.$apply();
        };
        scope.$on('resize', onResize);
        return scope.$on('resizestop', function() {
          return preload(self.source);
        });
      }
    };
  }

  return imagoVideo;

})();

angular.module('imago').directive('imagoVideo', ['$q', '$timeout', '$window', 'imagoUtils', imagoVideo]);

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

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/controlsVideo.html","<div stop-propagation=\"stop-propagation\" class=\"controls\"><a ng-click=\"imagovideo.togglePlay()\" ng-class=\"{\'fa-pause\': imagovideo.isPlaying, \'fa-play\': !imagovideo.isPlaying}\" class=\"video-play fa fa-play\"></a><span class=\"video-time\">{{currentTime | time}}</span><span class=\"video-seekbar\"><input type=\"range\" ng-model=\"currentTime\" min=\"0\" max=\"{{duration}}\" ng-change=\"seek(currentTime)\" class=\"seek\"/></span><a ng-click=\"toggleSize()\" class=\"size\">{{wrapperStyle.size}}</a><span class=\"volume\"><span ng-click=\"volumeUp()\" class=\"fa fa-volume-up icon-volume-up\"></span><input type=\"range\" ng-model=\"volumeInput\" ng-change=\"onVolumeChange(volumeInput)\"/><span ng-click=\"volumeDown()\" class=\"fa fa-volume-down icon-volume-down\"></span></span><a ng-click=\"fullScreen()\" class=\"video-fullscreen fa fa-expand\"></a><a class=\"video-screen fa fa-compress\"></a></div>");
$templateCache.put("/imago/imagoVideo.html","<div ng-class=\"{loading: loading}\" in-view=\"visible = $inview\" visible=\"visible\" responsive-events=\"responsive-events\" class=\"imagovideo {{wrapperStyle.backgroundPosition}} {{wrapperStyle.size}} {{wrapperStyle.sizemode}}\"><div ng-style=\"wrapperStyle\" ng-class=\"{playing: imagovideo.isPlaying}\" class=\"imagowrapper\"><a ng-hide=\"loading\" ng-click=\"imagovideo.togglePlay()\" ng-class=\"{playing: imagovideo.isPlaying}\" stop-propagation=\"stop-propagation\" class=\"playbig fa fa-play\"></a><video ng-style=\"videoStyle\"><source ng-repeat=\"format in videoFormats\" src=\"{{format.src}}\" data-size=\"{{format.size}}\" data-codec=\"{{format.codec}}\" type=\"{{format.type}}\"/></video><div imago-controls=\"imago-controls\" ng-style=\"controlStyle\" ng-show=\"controls &amp;&amp; hasPlayed\"></div></div></div>");}]);