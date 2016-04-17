(function() {
  var imagoVideo, imagoVideoController;

  imagoVideo = (function() {
    function imagoVideo($rootScope, imagoUtils1, imagoModel) {
      this.$rootScope = $rootScope;
      this.imagoUtils = imagoUtils1;
      return {
        restrict: 'E',
        scope: true,
        templateUrl: '/imago/imago-video.html',
        controller: 'imagoVideoController as imagovideo',
        bindToController: true,
        link: function(scope, element, attrs) {
          var destroy, key, ref, watcher;
          for (key in attrs) {
            if (_.isUndefined(scope.imagovideo.opts[key])) {
              continue;
            }
            if ((ref = attrs[key]) === 'true' || ref === 'false') {
              scope.imagovideo.opts[key] = JSON.parse(attrs[key]);
            } else if (!isNaN(attrs[key])) {
              scope.imagovideo.opts[key] = Number(attrs[key]);
            } else {
              scope.imagovideo.opts[key] = attrs[key];
            }
          }
          destroy = function() {
            return scope.$applyAsync(function() {
              scope.$destroy();
              return element.remove();
            });
          };
          if (attrs.data.match(/[0-9a-fA-F]{24}/)) {
            return watcher = attrs.$observe('data', function(asset) {
              if (!asset) {
                return;
              }
              watcher();
              return imagoModel.getById(asset).then(function(response) {
                var ref1, ref2;
                if (!(response != null ? (ref1 = response.fields) != null ? (ref2 = ref1.formats) != null ? ref2.length : void 0 : void 0 : void 0)) {
                  if (typeof trackJs !== "undefined" && trackJs !== null) {
                    trackJs.track("Video " + response._id + " has no formats");
                  }
                  return destroy();
                }
                return scope.imagovideo.init(response);
              });
            });
          } else if (attrs.data.match(/^\//)) {
            return imagoModel.getData(attrs.data).then(function(response) {
              var i, item, len, ref1, ref2;
              for (i = 0, len = response.length; i < len; i++) {
                item = response[i];
                if (!((ref1 = item.fields) != null ? (ref2 = ref1.formats) != null ? ref2.length : void 0 : void 0)) {
                  if (typeof trackJs !== "undefined" && trackJs !== null) {
                    trackJs.track("Video " + item._id + " has no formats");
                  }
                  return destroy();
                }
                scope.imagovideo.init(item);
                break;
              }
            });
          } else {
            return watcher = scope.$watch(attrs.data, (function(_this) {
              return function(asset) {
                var ref1, ref2;
                if (!asset) {
                  return;
                }
                watcher();
                if (!((ref1 = asset.fields) != null ? (ref2 = ref1.formats) != null ? ref2.length : void 0 : void 0)) {
                  if (typeof trackJs !== "undefined" && trackJs !== null) {
                    trackJs.track("Video " + asset._id + " has no formats");
                  }
                  return destroy();
                }
                return scope.imagovideo.init(asset);
              };
            })(this));
          }
        }
      };
    }

    return imagoVideo;

  })();

  imagoVideoController = (function() {
    function imagoVideoController($rootScope, $attrs, $scope, $element, $sce, imagoModel1) {
      this.$rootScope = $rootScope;
      this.$attrs = $attrs;
      this.$scope = $scope;
      this.$element = $element;
      this.$sce = $sce;
      this.imagoModel = imagoModel1;
      this.watchers = [];
      this.sources = [];
      this.dpr = Math.ceil(window.devicePixelRatio, 1) || 1;
      this.opts = {
        autobuffer: null,
        autoplay: false,
        controls: true,
        controlsAutohide: true,
        preload: false,
        size: 'hd',
        align: 'center center',
        sizemode: 'fit',
        loop: false,
        responsive: true,
        theme: '//storage.googleapis.com/videoangular-default-theme/videogular.min.css'
      };
      this.$scope.$on('$destroy', (function(_this) {
        return function() {
          var i, len, ref, results, watcher;
          ref = _this.watchers;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            watcher = ref[i];
            results.push(watcher());
          }
          return results;
        };
      })(this));
    }

    imagoVideoController.prototype.init = function(asset) {
      var ref, ref1, ref2, ref3;
      this.asset = asset;
      this.resolution = this.asset.resolution.split('x');
      this.assetRatio = _.first(this.resolution) / _.last(this.resolution);
      this.spacerStyle = {
        paddingBottom: (_.last(this.resolution) / _.first(this.resolution) * 100) + "%"
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
          if (imagoUtils.isMobile()) {
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
            src: _this.$sce.trustAsResourceUrl("//" + _this.imagoModel.host + "/api/play_redirect?uuid=" + _this.asset.uuid + "&codec=" + (_.first(mp4s).codec) + "&size=" + (_.first(mp4s).size)),
            type: "video/" + (_.first(mp4s).codec)
          });
          _this.sources.push({
            src: _this.$sce.trustAsResourceUrl("//" + _this.imagoModel.host + "/api/play_redirect?uuid=" + _this.asset.uuid + "&codec=" + (_.first(webms).codec) + "&size=" + (_.first(webms).size)),
            type: "video/" + (_.first(webms).codec)
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

  angular.module('imago').directive('imagoVideo', ['$rootScope', 'imagoUtils', 'imagoModel', imagoVideo]).controller('imagoVideoController', ['$rootScope', '$attrs', '$scope', '$element', '$sce', 'imagoModel', imagoVideoController]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-video.html","<div ng-class=\"[imagovideo.opts.align, imagovideo.opts.sizemode, imagovideo.mainSide]\" class=\"imago-video-content\"><div class=\"imago-video-wrapper\"><div ng-style=\"imagovideo.spacerStyle\" class=\"spacer\"></div><videogular vg-auto-play=\"::imagovideo.opts.autoplay\" vg-theme=\"::imagovideo.opts.theme\" ng-if=\"imagovideo.ready\"><vg-media vg-src=\"::imagovideo.sources\" vg-loop=\"::imagovideo.opts.loop\" vg-preload=\"::imagovideo.opts.preload\"></vg-media><vg-controls ng-show=\"::imagovideo.opts.controls\" vg-autohide=\"::imagovideo.opts.controlsAutohide\"><vg-play-pause-button></vg-play-pause-button><vg-time-display>{{ currentTime | date:\'mm:ss\' }}</vg-time-display><vg-scrub-bar><vg-scrub-bar-current-time></vg-scrub-bar-current-time></vg-scrub-bar><vg-time-display>{{ timeLeft | date:\'mm:ss\' }}</vg-time-display><vg-volume><vg-mute-button></vg-mute-button><vg-volume-bar></vg-volume-bar></vg-volume><vg-fullscreen-button></vg-fullscreen-button></vg-controls><vg-overlay-play></vg-overlay-play><vg-poster vg-url=\"::imagovideo.poster\"></vg-poster></videogular></div></div>");}]);