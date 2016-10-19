(function() {
  var imagoImage, imagoImageController,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  imagoImage = (function() {
    function imagoImage() {
      return {
        templateUrl: '/imago/imago-image.html',
        controller: 'imagoImageController as imagoimage',
        require: {
          sliderCtrl: '?^imagoSlider'
        },
        bindings: {
          data: '=?'
        }
      };
    }

    return imagoImage;

  })();

  imagoImageController = (function() {
    function imagoImageController($rootScope, $timeout, $attrs, $scope, $element, imagoModel1) {
      this.$rootScope = $rootScope;
      this.$timeout = $timeout;
      this.$attrs = $attrs;
      this.$scope = $scope;
      this.$element = $element;
      this.imagoModel = imagoModel1;
      this.render = bind(this.render, this);
      this.setServingSize = bind(this.setServingSize, this);
      this.loaded = false;
      this.imageStyle = {};
      this.watchers = [];
      this.opts = {
        align: 'center center',
        sizemode: 'fit',
        autosize: 'none',
        responsive: true,
        scale: 1,
        lazy: true,
        maxsize: 4000,
        placeholder: this.$rootScope.imagePlaceholder || false,
        allowDrag: true,
        width: void 0,
        height: void 0,
        path: ''
      };
    }

    imagoImageController.prototype.$postLink = function() {
      var key, ref, watcher;
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
            return imagoModel.getById(asset).then(function(response) {
              if (!(response != null ? response.serving_url : void 0)) {
                return _this.destroy();
              }
              return _this.init(response);
            });
          };
        })(this));
      } else if (this.$attrs.data.match(/^\//)) {
        return imagoModel.getData(this.$attrs.data).then((function(_this) {
          return function(response) {
            var i, item, len;
            for (i = 0, len = response.length; i < len; i++) {
              item = response[i];
              if (!(item != null ? item.serving_url : void 0)) {
                return _this.destroy();
              }
              _this.init(item);
              break;
            }
          };
        })(this));
      } else {
        return watcher = this.$scope.$watch('this.imagoimage.data', (function(_this) {
          return function() {
            var ref1;
            if (!_this.$attrs.watch) {
              watcher();
              if (!((ref1 = _this.data) != null ? ref1.serving_url : void 0)) {
                return _this.destroy();
              }
            }
            return _this.init(_this.data);
          };
        })(this));
      }
    };

    imagoImageController.prototype.$onDestroy = function() {
      var i, len, ref, results, watcher;
      ref = this.watchers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        watcher = ref[i];
        results.push(watcher());
      }
      return results;
    };

    imagoImageController.prototype.destroy = function() {
      return this.$scope.$applyAsync((function(_this) {
        return function() {
          _this.$scope.$destroy();
          return _this.$element.remove();
        };
      })(this));
    };

    imagoImageController.prototype.init = function(asset) {
      var ref, ref1, ref2, ref3;
      this.asset = asset;
      this.placeholderUrl = this.asset.b64 || (this.asset.serving_url + "=s3");
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
            if (!_this.visible) {
              return;
            }
            return _this.$scope.$applyAsync(function() {
              _this.getSize();
              return _this.resize();
            });
          };
        })(this)));
        this.watchers.push(this.$rootScope.$on('resizestop', (function(_this) {
          return function() {
            if (!_this.visible) {
              return;
            }
            return _this.$scope.$applyAsync(function() {
              _this.getSize();
              _this.resize();
              return _this.getServingUrl();
            });
          };
        })(this)));
      }
      return this.$scope.$applyAsync((function(_this) {
        return function() {
          var watcher;
          if (_this.$attrs.width || _this.$attrs.height) {
            _this.width = parseInt(_this.$attrs.width || 0);
            _this.height = parseInt(_this.$attrs.height || 0);
          } else {
            _this.getSize();
          }
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
          if (_this.opts.lazy && !_this.visible) {
            return watcher = _this.$scope.$watch('imagoimage.visible', function(value) {
              if (!value) {
                return;
              }
              watcher();
              _this.resize();
              return _this.getServingUrl();
            });
          } else {
            _this.getSize();
            _this.resize();
            return _this.getServingUrl();
          }
        };
      })(this));
    };

    imagoImageController.prototype.getSize = function() {
      this.width = this.$element.children()[0].clientWidth;
      return this.height = this.$element.children()[0].clientHeight;
    };

    imagoImageController.prototype.setServingSize = function(servingSize) {
      if (!this.sliderCtrl) {
        return;
      }
      return this.sliderCtrl.setServingSize(servingSize);
    };

    imagoImageController.prototype.inview = function(inview) {
      this.visible = inview;
      this.getSize();
      this.resize();
      return this.getServingUrl();
    };

    imagoImageController.prototype.resize = function() {
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

    imagoImageController.prototype.getServingUrl = function() {
      var servingSize;
      if (this.mainSide === "autoheight") {
        servingSize = Math.round(Math.max(this.height, this.height * this.assetRatio));
      } else if (this.opts.sizemode === 'crop' && this.height) {
        if (this.assetRatio <= this.wrapperRatio) {
          servingSize = Math.round(Math.max(this.width, this.width / this.assetRatio));
        } else {
          servingSize = Math.round(Math.max(this.height, this.height * this.assetRatio));
        }
      } else {
        if (this.assetRatio <= this.wrapperRatio && this.height) {
          servingSize = Math.round(Math.max(this.height, this.height * this.assetRatio));
        } else {
          servingSize = Math.round(Math.max(this.width, this.width / this.assetRatio));
        }
      }
      servingSize = parseInt(Math.min(servingSize * (Math.ceil(window.devicePixelRatio, 1) || 1), this.opts.maxsize));
      if (servingSize === this.servingSize) {
        this.loaded = true;
        return;
      }
      this.servingSize = Math.max(servingSize, 60);
      this.opts.servingUrl = this.asset.serving_url + "=s" + (this.servingSize * this.opts.scale);
      this.setServingSize("=s" + (servingSize * this.opts.scale));
      return this.render();
    };

    imagoImageController.prototype.render = function() {
      var img;
      img = angular.element('<img>');
      img.on('load', (function(_this) {
        return function() {
          return _this.$scope.$applyAsync(function() {
            _this.imgUrl = _this.opts.servingUrl;
            return _this.loaded = true;
          });
        };
      })(this));
      return img[0].src = this.opts.servingUrl;
    };

    return imagoImageController;

  })();

  angular.module('imago').component('imagoImage', new imagoImage()).controller('imagoImageController', ['$rootScope', '$timeout', '$attrs', '$scope', '$element', 'imagoModel', imagoImageController]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-image.html","<div ng-class=\"[{\'loaded\': imagoimage.loaded}, imagoimage.opts.align, imagoimage.opts.sizemode, imagoimage.mainSide, {\'noplaceholder\': !imagoimage.opts.placeholder}]\" in-view=\"imagoimage.inview($inview, $inviewpart)\" in-view-options=\"{debounce: 10, offsetTop: -100, offsetBottom: 100}\" class=\"imago-image-content\"><div ng-style=\"::imagoimage.spacerStyle\" class=\"spacer\"></div><img ng-src=\"{{::imagoimage.placeholderUrl}}\" class=\"small\"/><img ng-src=\"{{imagoimage.imgUrl}}\" class=\"large\"/><div ng-if=\"!imagoimage.opts.allowDrag\" class=\"prevent-drag\"></div></div>");}]);