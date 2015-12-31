var imagoImage, imagoImageController;

imagoImage = (function() {
  function imagoImage($timeout, imagoModel) {
    return {
      scope: true,
      templateUrl: '/imago/imago-image.html',
      controller: 'imagoImageController as imagoimage',
      require: '?^imagoSlider',
      bindToController: true,
      link: function(scope, element, attrs, imagoSlider) {
        var self;
        self = {
          destroy: function() {
            scope.$destroy();
            return element.remove();
          }
        };
        if (attrs.imagoImage.match(/[0-9a-fA-F]{24}/)) {
          return self.watch = attrs.$observe('imagoImage', function(data) {
            if (!data) {
              return;
            }
            self.watch();
            data = imagoModel.find({
              '_id': data
            });
            if (!data.serving_url) {
              return self.destroy();
            }
            return scope.imagoimage.init(data);
          });
        } else {
          return self.watch = scope.$watch(attrs.imagoImage, (function(_this) {
            return function(data) {
              if (!data) {
                return;
              }
              self.watch();
              if (!data.serving_url) {
                return self.destroy();
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
      maxsize: 4000
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
    this.$rootScope.$on('resize', (function(_this) {
      return function() {
        return _this.resize();
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
      return this.removeInView = true;
    }
  };

  imagoImageController.prototype.resize = function() {
    this.width = this.$element[0].clientWidth;
    this.height = this.$element[0].clientHeight;
    if (this.height) {
      this.wrapperRatio = this.width / this.height;
    }
    return console.log('resize', this.wrapperRatio, this.width, this.height, this.resolution);
  };

  imagoImageController.prototype.compile = function() {
    var servingSize;
    this.resize();
    if (this.opts.sizemode === 'crop' && this.height) {
      if (this.assetRatio <= this.wrapperRatio) {
        servingSize = Math.round(Math.max(this.width, this.width / this.assetRatio));
      } else {
        servingSize = Math.round(Math.max(this.height, this.height * this.assetRatio));
      }
    } else {
      if (!this.height || this.opts.autosize === 'height') {
        this.opts.autosize = 'height';
        servingSize = Math.round(Math.max(this.width, this.width / this.assetRatio));
      } else if (!this.width || this.opts.autosize === 'width') {
        this.opts.autosize = 'width';
        servingSize = Math.round(Math.max(this.height, this.height * this.assetRatio));
      } else if (this.assetRatio <= this.wrapperRatio) {
        servingSize = Math.round(Math.max(this.height, this.height * this.assetRatio));
      } else {
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
    if (this.opts.lazy && !this.visible) {
      return self.visibleFunc = this.$scope.$watch('imagoimage.visible', (function(_this) {
        return function(value) {
          if (!value) {
            return;
          }
          self.visibleFunc();
          _this.visible = true;
          return _this.render();
        };
      })(this));
    } else {
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
    }
  };

  return imagoImageController;

})();

angular.module('imago').directive('imagoImage', ['$timeout', 'imagoModel', imagoImage]).controller('imagoImageController', ['$rootScope', '$attrs', '$scope', '$element', '$timeout', imagoImageController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-image.html","<div ng-class=\"[{\'loaded\': imagoimage.loaded}, imagoimage.opts.align, imagoimage.fit, imagoimage.opts.sizemode]\" class=\"imagoimage\"><div ng-style=\"::imagoimage.spacerStyle\" class=\"spacer\"></div><img ng-src=\"{{::imagoimage.data.serving_url}}=s3\" ng-style=\"::imagoimage.imgSmallStyle\" class=\"small\"/><img ng-src=\"{{imagoimage.imgUrl}}\" ng-show=\"imagoimage.imgUrl\" visible=\"imagoimage.visible\" in-view=\"imagoimage.visible = $inview &amp;&amp; imagoimage.compile()\" in-view-remove=\"imagoimage.removeInView\" class=\"large\"/><pre>sizemode: {{imagoimage.opts.sizemode}}  align: {{imagoimage.opts.align}}<br/>class {{imagoimage.loaded}}</pre></div>");}]);