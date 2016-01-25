var imagoImage, imagoImageController,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

imagoImage = (function() {
  function imagoImage(imagoModel) {
    return {
      scope: true,
      templateUrl: '/imago/imago-image.html',
      controller: 'imagoImageController as imagoimage',
      require: '?^imagoSlider',
      bindToController: true,
      link: function(scope, element, attrs, imagoSlider) {
        var destroy, watcher;
        destroy = function() {
          return scope.$applyAsync(function() {
            scope.$destroy();
            return element.remove();
          });
        };
        if (attrs.imagoImage.match(/[0-9a-fA-F]{24}/)) {
          return watcher = attrs.$observe('imagoImage', function(asset) {
            if (!asset) {
              return;
            }
            watcher();
            asset = imagoModel.find({
              '_id': asset
            });
            if (!asset.serving_url) {
              return destroy();
            }
            return scope.imagoimage.init(asset);
          });
        } else {
          return watcher = scope.$watch(attrs.imagoImage, (function(_this) {
            return function(asset) {
              if (!asset) {
                return;
              }
              watcher();
              if (!asset.serving_url) {
                return destroy();
              }
              return scope.imagoimage.init(asset);
            };
          })(this));
        }
      }
    };
  }

  return imagoImage;

})();

imagoImageController = (function() {
  function imagoImageController($rootScope, $attrs, $scope, $element) {
    var key, ref;
    this.$rootScope = $rootScope;
    this.$attrs = $attrs;
    this.$scope = $scope;
    this.$element = $element;
    this.render = bind(this.render, this);
    this.loaded = false;
    this.imageStyle = {};
    this.watchers = [];
    this.dpr = Math.ceil(window.devicePixelRatio, 1) || 1;
    this.opts = {
      align: 'center center',
      sizemode: 'fit',
      autosize: 'none',
      responsive: true,
      scale: 1,
      lazy: true,
      maxsize: 4000,
      placeholder: true,
      allowDrag: true
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
          if (!_this.visible) {
            return;
          }
          return _this.$scope.$applyAsync(function() {
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
            _this.resize();
            return _this.getServingUrl();
          });
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

  imagoImageController.prototype.init = function(data) {
    var ref, ref1, ref2, ref3;
    this.data = data;
    this.resolution = this.data.resolution.split('x');
    this.assetRatio = _.first(this.resolution) / _.last(this.resolution);
    this.spacerStyle = {
      paddingBottom: (_.last(this.resolution) / _.first(this.resolution) * 100) + "%"
    };
    if (((ref = this.data.fields) != null ? (ref1 = ref.crop) != null ? ref1.value : void 0 : void 0) && !this.$attrs.align) {
      this.opts.align = this.data.fields.crop.value;
    }
    if (((ref2 = this.data.fields) != null ? (ref3 = ref2.sizemode) != null ? ref3.value : void 0 : void 0) && this.data.fields.sizemode.value !== 'default' && !this.$attrs.sizemode) {
      this.opts.sizemode = this.data.fields.sizemode.value;
    }
    if (this.opts.lazy === false) {
      this.removeInView = true;
    }
    this.placeholderUrl = this.data.b64 || (this.data.serving_url + "=s3");
    return this.$scope.$applyAsync((function(_this) {
      return function() {
        var ref4, watcher;
        _this.getSize();
        if (_this.height === 0 && _this.width === 0) {
          return console.log('need width or/and height for static or relative positioning');
        }
        if ((ref4 = _this.position) === 'static' || ref4 === 'relative') {
          _this.opts.sizemode = 'fit';
          if (_this.height > 0) {
            _this.mainSide = 'autoheight';
          } else if (_this.width > 0 && _this.height === 0) {
            _this.mainSide = 'autowidth';
          }
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
            return _this.$scope.$applyAsync(function() {
              _this.resize();
              return _this.getServingUrl();
            });
          });
        } else {
          return _this.$scope.$applyAsync(function() {
            _this.resize();
            return _this.getServingUrl();
          });
        }
      };
    })(this));
  };

  imagoImageController.prototype.getSize = function() {
    var style;
    style = window.getComputedStyle(this.$element[0]);
    this.position = window.getComputedStyle(this.$element.children()[0]).position;
    this.width = parseInt(window.getComputedStyle(this.$element.children()[0]).width);
    this.height = parseInt(window.getComputedStyle(this.$element.children()[0]).height);
    return console.log('getSize', this.width, this.height, this.position, this.$element[0]);
  };

  imagoImageController.prototype.resize = function() {
    var ref;
    this.getSize();
    this.wrapperRatio = this.width / this.height;
    if ((ref = this.position) !== 'static' && ref !== 'relative') {
      if (this.opts.sizemode === 'crop') {
        return this.mainSide = this.assetRatio < this.wrapperRatio ? 'width' : 'height';
      } else {
        return this.mainSide = this.assetRatio > this.wrapperRatio ? 'width' : 'height';
      }
    }
  };

  imagoImageController.prototype.getServingUrl = function() {
    var ref, servingSize;
    this.visible = true;
    if ((ref = this.position) === 'relative' || ref === 'static') {
      servingSize = Math.round(Math.max(this.width, this.height));
    } else {
      if (this.opts.sizemode === 'crop' && this.height) {
        if (this.assetRatio <= this.wrapperRatio) {
          servingSize = Math.round(Math.max(this.width, this.width / this.assetRatio));
        } else {
          servingSize = Math.round(Math.max(this.height, this.height * this.assetRatio));
        }
      } else {
        if (this.assetRatio <= this.wrapperRatio) {
          servingSize = Math.round(Math.max(this.height, this.height * this.assetRatio));
        } else {
          servingSize = Math.round(Math.max(this.width, this.width / this.assetRatio));
        }
      }
    }
    servingSize = parseInt(Math.min(servingSize * this.dpr, this.opts.maxsize));
    if (servingSize === this.servingSize) {
      this.loaded = true;
      return;
    }
    this.servingSize = Math.max(servingSize, 60);
    this.opts.servingUrl = this.data.serving_url + "=s" + (this.servingSize * this.opts.scale);
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

angular.module('imago').directive('imagoImage', ['imagoModel', imagoImage]).controller('imagoImageController', ['$rootScope', '$attrs', '$scope', '$element', imagoImageController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-image.html","<div ng-class=\"[{\'loaded\': imagoimage.loaded}, imagoimage.opts.align, imagoimage.opts.sizemode, imagoimage.mainSide, {\'noplaceholder\': !imagoimage.ops.placeholder}]\" in-view=\"imagoimage.visible = $inview\" in-view-remove=\"imagoimage.removeInView\" in-view-options=\"{debounce: 50}\" class=\"imago-image\"><div ng-style=\"::imagoimage.spacerStyle\" class=\"spacer\"></div><img ng-src=\"{{::imagoimage.placeholderUrl}}\" class=\"small\"/><img ng-src=\"{{imagoimage.imgUrl}}\" ng-show=\"::imagoimage.imgUrl\" class=\"large\"/><div ng-if=\"!imagoimage.opts.allowDrag\" class=\"prevent-drag\"></div></div>");}]);