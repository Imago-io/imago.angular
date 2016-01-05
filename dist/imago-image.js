var imagoImage, imagoImageController,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

imagoImage = (function() {
  function imagoImage($timeout, imagoModel) {
    return {
      scope: true,
      templateUrl: '/imago/imago-image.html',
      controller: 'imagoImageController as imagoimage',
      require: '?^imagoSlider',
      bindToController: true,
      link: function(scope, element, attrs, imagoSlider) {
        var destroy, watcher;
        destroy = function() {
          scope.$destroy();
          return element.remove();
        };
        if (attrs.imagoImage.match(/[0-9a-fA-F]{24}/)) {
          return watcher = attrs.$observe('imagoImage', function(data) {
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
            return scope.imagoimage.init(data);
          });
        } else {
          return watcher = scope.$watch(attrs.imagoImage, (function(_this) {
            return function(data) {
              if (!data) {
                return;
              }
              watcher();
              if (!data.serving_url) {
                return destroy();
              }
              return scope.imagoimage.init(data);
            };
          })(this));
        }
      }
    };
  }

  return imagoImage;

})();

imagoImageController = (function() {
  function imagoImageController($rootScope, $attrs, $scope, $element, $timeout1) {
    var key, ref;
    this.$rootScope = $rootScope;
    this.$attrs = $attrs;
    this.$scope = $scope;
    this.$element = $element;
    this.$timeout = $timeout1;
    this.render = bind(this.render, this);
    this.imageStyle = {};
    this.loaded = false;
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
      preventDrag: true
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
    console.log('@opts', this.opts);
    if (this.opts.responsive) {
      this.$rootScope.$on('resize', (function(_this) {
        return function() {
          return _this.resize();
        };
      })(this));
    }
  }

  imagoImageController.prototype.init = function(data) {
    var ref, ref1, ref2, ref3, watcher;
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
    if (this.opts.lazy && !this.visible) {
      return watcher = this.$scope.$watch('imagoimage.visible', (function(_this) {
        return function(value) {
          if (!value) {
            return;
          }
          watcher();
          _this.visible = true;
          return _this.getServingUrl();
        };
      })(this));
    } else {
      return this.$scope.$applyAsync((function(_this) {
        return function() {
          return _this.getServingUrl();
        };
      })(this));
    }
  };

  imagoImageController.prototype.resize = function() {
    this.width = this.$element[0].clientWidth;
    this.height = this.$element[0].clientHeight;
    this.wrapperRatio = this.width / this.height;
    console.log('@wrapperRatio, @assetRatio', this.wrapperRatio, this.assetRatio, this.height);
    if (this.opts.sizemode === 'crop') {
      return this.mainSide = this.assetRatio < this.wrapperRatio ? 'width' : 'height';
    } else {
      return this.mainSide = this.assetRatio > this.wrapperRatio ? 'width' : 'height';
    }
  };

  imagoImageController.prototype.getServingUrl = function() {
    var servingSize;
    this.resize();
    if (this.opts.sizemode === 'crop' && this.height) {
      if (this.assetRatio <= this.wrapperRatio) {
        servingSize = Math.round(Math.max(this.width, this.width / this.assetRatio));
      } else {
        servingSize = Math.round(Math.max(this.height, this.height * this.assetRatio));
      }
    } else {
      if (this.assetRatio <= this.wrapperRatio) {
        console.log('fit full height', this.width, this.height, this.assetRatio, this.height * this.assetRatio);
        servingSize = Math.round(Math.max(this.height, this.height * this.assetRatio));
      } else {
        console.log('fit full width', this.width, this.height, this.assetRatio, this.wrapperRatio);
        servingSize = Math.round(Math.max(this.width, this.width / this.assetRatio));
      }
    }
    servingSize = parseInt(Math.min(servingSize * this.dpr, this.opts.maxsize));
    if (servingSize === this.servingSize) {
      this.loaded = true;
      return;
    }
    this.servingSize = Math.max(servingSize, 320);
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

angular.module('imago').directive('imagoImage', ['$timeout', 'imagoModel', imagoImage]).controller('imagoImageController', ['$rootScope', '$attrs', '$scope', '$element', '$timeout', imagoImageController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-image.html","<div ng-class=\"[{\'loaded\': imagoimage.loaded}, {\'prevent-drag\': imagoimage.opts.preventDrag}, imagoimage.opts.align, imagoimage.opts.sizemode]\" class=\"imago-image\"><div ng-style=\"::imagoimage.spacerStyle\" ng-show=\"imagoimage.height === 0\" class=\"spacer\"></div><img ng-if=\"imagoimage.opts.placeholder &amp;&amp; !imagoimage.loaded\" ng-src=\"{{::imagoimage.data.serving_url}}=s3\" ng-style=\"::imagoimage.imgSmallStyle\" class=\"small\"/><img ng-class=\"imagoimage.mainSide\" ng-src=\"{{imagoimage.imgUrl}}\" ng-show=\"imagoimage.imgUrl\" visible=\"imagoimage.visible\" in-view=\"imagoimage.visible = $inview\" in-view-remove=\"imagoimage.removeInView\" class=\"large\"/><pre>sizemode: {{imagoimage.opts.sizemode}}  align: {{imagoimage.opts.align}}<br/>class {{imagoimage.loaded}}<br/>mainSide {{imagoimage.mainSide}}</pre></div>");}]);