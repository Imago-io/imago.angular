(function() {
  var imagoVideo, imagoVideoController,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  imagoVideo = (function() {
    function imagoVideo() {
      return {
        templateUrl: function($attrs) {
          return $attrs.templateUrl || '/imago/imago-video.html';
        },
        controller: 'imagoVideoController as imagovideo',
        bindings: {
          data: '<?',
          onReady: '&?'
        }
      };
    }

    return imagoVideo;

  })();

  imagoVideoController = (function() {
    function imagoVideoController($rootScope, $attrs1, $scope, $element, $sce, imagoUtils, imagoModel) {
      this.$rootScope = $rootScope;
      this.$attrs = $attrs1;
      this.$scope = $scope;
      this.$element = $element;
      this.$sce = $sce;
      this.imagoUtils = imagoUtils;
      this.imagoModel = imagoModel;
      this.onPlayerReady = bind(this.onPlayerReady, this);
      this.watchers = [];
      this.sources = [];
      this.dpr = Math.ceil(window.devicePixelRatio, 1) || 1;
      this.opts = {
        autobuffer: null,
        autoplay: false,
        controls: true,
        preload: false,
        size: 'hd',
        align: 'center center',
        sizemode: 'fit',
        loop: false,
        autoplayInview: false,
        responsive: true,
        theme: '//storage.googleapis.com/videoangular-default-theme/videogular.min.css'
      };
    }

    imagoVideoController.prototype.$postLink = function() {
      var key, ref, ref1, ref2, ref3, watcher;
      for (key in this.$attrs) {
        if (_.isUndefined(this.opts[key])) {
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
      if (this.$attrs.data.match(/[0-9a-fA-F]{24}/)) {
        return watcher = this.$attrs.$observe('data', (function(_this) {
          return function(asset) {
            if (!asset) {
              return;
            }
            watcher();
            return _this.imagoModel.getById(asset).then(function(response) {
              var ref1, ref2;
              if (!(response != null ? (ref1 = response.fields) != null ? (ref2 = ref1.formats) != null ? ref2.length : void 0 : void 0 : void 0)) {
                if (typeof trackJs !== "undefined" && trackJs !== null) {
                  trackJs.track("Video " + response._id + " has no formats");
                }
                return _this.destroy();
              }
              return _this.init(response);
            });
          };
        })(this));
      } else if (this.$attrs.data.match(/^\//)) {
        return this.imagoModel.getData(this.$attrs.data).then((function(_this) {
          return function(response) {
            var i, item, len, ref1, ref2;
            for (i = 0, len = response.length; i < len; i++) {
              item = response[i];
              if (!((ref1 = item.fields) != null ? (ref2 = ref1.formats) != null ? ref2.length : void 0 : void 0)) {
                if (typeof trackJs !== "undefined" && trackJs !== null) {
                  trackJs.track("Video " + item._id + " has no formats");
                }
                return _this.destroy();
              }
              _this.init(item);
              break;
            }
          };
        })(this));
      } else {
        if (!this.data) {
          return this.destroy();
        }
        if (!((ref1 = this.data) != null ? (ref2 = ref1.fields) != null ? (ref3 = ref2.formats) != null ? ref3.length : void 0 : void 0 : void 0)) {
          if (typeof trackJs !== "undefined" && trackJs !== null) {
            trackJs.track("Video " + this.data._id + " has no formats");
          }
          return this.destroy();
        }
        return this.init(this.data);
      }
    };

    imagoVideoController.prototype.$onDestroy = function() {
      var i, len, ref, results, watcher;
      ref = this.watchers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        watcher = ref[i];
        results.push(watcher());
      }
      return results;
    };

    imagoVideoController.prototype.destroy = function() {
      return this.$scope.$applyAsync(function() {
        this.$scope.$destroy();
        return this.$element.remove();
      });
    };

    imagoVideoController.prototype.init = function(asset) {
      var ref, ref1, ref2, ref3;
      this.asset = asset;
      this.resolution = this.asset.resolution.split('x');
      this.assetRatio = _.head(this.resolution) / _.last(this.resolution);
      this.spacerStyle = {
        paddingBottom: (_.last(this.resolution) / _.head(this.resolution) * 100) + "%"
      };
      if (((ref = this.asset.fields) != null ? (ref1 = ref.crop) != null ? ref1.value : void 0 : void 0) && !this.$attrs.align) {
        this.opts.align = this.asset.fields.crop.value;
      }
      if (((ref2 = this.asset.fields) != null ? (ref3 = ref2.sizemode) != null ? ref3.value : void 0 : void 0) && this.asset.fields.sizemode.value !== 'default' && !this.$attrs.sizemode) {
        this.opts.sizemode = this.asset.fields.sizemode.value;
      }
      if (this.opts.responsive) {
        this.watchers.push(this.$rootScope.$on('resize', (function(_this) {
          return function() {
            var old;
            _this.getSize();
            _this.resize();
            old = _this.mainSide;
            if (old !== _this.mainSide) {
              return _this.$scope.$digest();
            }
          };
        })(this)));
      }
      return this.$scope.$applyAsync((function(_this) {
        return function() {
          var mp4s, webms;
          _this.getSize();
          if (_this.height === 0 && _this.width === 0) {
            return console.log('need width or/and height for static or relative positioning');
          }
          if (_this.height > 0 && _this.width === 0) {
            _this.mainSide = 'autoheight';
          } else if (_this.width > 0 && _this.height === 0) {
            _this.mainSide = 'autowidth';
          } else {
            if (_this.opts.sizemode === 'crop') {
              _this.mainSide = _this.assetRatio > 1 ? 'height' : 'width';
            } else {
              _this.mainSide = _this.assetRatio < 1 ? 'height' : 'width';
            }
          }
          _this.ready = true;
          _this.resize();
          if (_this.imagoUtils.isMobile()) {
            _this.asset.fields.formats = _.filter(_this.asset.fields.formats, function(source) {
              var ref4;
              if ((ref4 = source.size) !== '1080p') {
                return true;
              }
            });
          }
          webms = _.sortBy(_.filter(_this.asset.fields.formats, {
            codec: 'webm'
          }), 'height').reverse();
          mp4s = _.sortBy(_.filter(_this.asset.fields.formats, {
            codec: 'mp4'
          }), 'height').reverse();
          _this.sources.push({
            src: _this.$sce.trustAsResourceUrl(_this.imagoModel.host + "/api/play_redirect?uuid=" + _this.asset.uuid + "&codec=" + (_.head(mp4s).codec) + "&size=" + (_.head(mp4s).size)),
            type: "video/" + (_.head(mp4s).codec)
          });
          _this.sources.push({
            src: _this.$sce.trustAsResourceUrl(_this.imagoModel.host + "/api/play_redirect?uuid=" + _this.asset.uuid + "&codec=" + (_.head(webms).codec) + "&size=" + (_.head(webms).size)),
            type: "video/" + (_.head(webms).codec)
          });
          if (_this.asset.serving_url) {
            return _this.poster = _this.asset.serving_url + "=s2000-h720";
          }
        };
      })(this));
    };

    imagoVideoController.prototype.getSize = function() {
      this.width = this.$element.children()[0].clientWidth;
      return this.height = this.$element.children()[0].clientHeight;
    };

    imagoVideoController.prototype.onPlayerReady = function(api) {
      if (this.onReady) {
        this.onReady({
          api: api
        });
      }
      if (this.opts.autoplayInview) {
        return this.$scope.$watch('imagovideo.visible', (function(_this) {
          return function(value) {
            if (value) {
              return api.play();
            } else {
              return api.pause();
            }
          };
        })(this));
      }
    };

    imagoVideoController.prototype.resize = function() {
      var ref;
      if ((ref = this.mainSide) !== 'autoheight' && ref !== 'autowidth') {
        this.wrapperRatio = this.width / this.height;
        if (this.opts.sizemode === 'crop') {
          return this.mainSide = this.assetRatio < this.wrapperRatio ? 'width' : 'height';
        } else {
          return this.mainSide = this.assetRatio > this.wrapperRatio ? 'width' : 'height';
        }
      }
    };

    return imagoVideoController;

  })();

  angular.module('imago').component('imagoVideo', new imagoVideo()).controller('imagoVideoController', ['$rootScope', '$attrs', '$scope', '$element', '$sce', 'imagoUtils', 'imagoModel', imagoVideoController]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-video.html","<div ng-class=\"[imagovideo.opts.align, imagovideo.opts.sizemode, imagovideo.mainSide, imagovideo.state]\" in-view=\"imagovideo.visible = $inview\" in-view-options=\"{debounce: 50}\" class=\"imago-video-content\"><div class=\"imago-video-wrapper\"><div ng-style=\"imagovideo.spacerStyle\" class=\"spacer\"></div><videogular vg-auto-play=\"::imagovideo.opts.autoplay\" vg-theme=\"::imagovideo.opts.theme\" ng-if=\"imagovideo.ready\" vg-update-state=\"imagovideo.state = $state\" vg-player-ready=\"imagovideo.onPlayerReady($API)\"><vg-media vg-src=\"::imagovideo.sources\" vg-loop=\"::imagovideo.opts.loop\" vg-preload=\"::imagovideo.opts.preload\"></vg-media><vg-controls ng-if=\"::imagovideo.opts.controls\"><vg-play-pause-button></vg-play-pause-button><vg-time-display>{{ currentTime | date:\'mm:ss\' }}</vg-time-display><vg-scrub-bar><vg-scrub-bar-current-time></vg-scrub-bar-current-time></vg-scrub-bar><vg-time-display>{{ timeLeft | date:\'mm:ss\' }}</vg-time-display><vg-volume><vg-mute-button></vg-mute-button><vg-volume-bar></vg-volume-bar></vg-volume><vg-fullscreen-button></vg-fullscreen-button></vg-controls><vg-overlay-play></vg-overlay-play><vg-poster vg-url=\"::imagovideo.poster\"></vg-poster></videogular></div></div>");}]);