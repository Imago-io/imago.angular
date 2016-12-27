(function() {
  var FulfillmentsCenter,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  FulfillmentsCenter = (function() {
    FulfillmentsCenter.prototype.data = [];

    FulfillmentsCenter.prototype.loaded = false;

    FulfillmentsCenter.prototype.selected = {};

    function FulfillmentsCenter($http, $rootScope, geoIp, imagoModel, imagoUtils) {
      this.$http = $http;
      this.$rootScope = $rootScope;
      this.geoIp = geoIp;
      this.imagoModel = imagoModel;
      this.imagoUtils = imagoUtils;
      this.get();
    }

    FulfillmentsCenter.prototype.get = function() {
      return this.$http.get(this.imagoModel.host + '/api/fulfillmentcenters').then((function(_this) {
        return function(response) {
          _this.data = response.data;
          return _this.getOptions();
        };
      })(this));
    };

    FulfillmentsCenter.prototype.getOptions = function() {
      var ref, watcher;
      if (this.data.length === 1) {
        this.selected = this.data[0];
        this.loaded = true;
        return this.$rootScope.$emit('fulfillments:loaded', this.data);
      }
      if ((ref = this.geoIp.data) != null ? ref.country : void 0) {
        return this.geoValid();
      } else if (this.geoIp.data === null) {
        return this.getGeneric();
      } else if (!this.geoIp.loaded) {
        return watcher = this.$rootScope.$on('geoip:loaded', (function(_this) {
          return function(evt, data) {
            var ref1;
            watcher();
            if ((ref1 = _this.geoIp.data) != null ? ref1.country : void 0) {
              return _this.geoValid();
            } else {
              return _this.getGeneric();
            }
          };
        })(this));
      }
    };

    FulfillmentsCenter.prototype.getGeneric = function() {
      this.selected = _.find(this.data, function(ffc) {
        return !ffc.countries.length;
      });
      this.$rootScope.$emit('fulfillments:loaded', this.data);
      return this.loaded = true;
    };

    FulfillmentsCenter.prototype.geoValid = function() {
      this.selected = _.find(this.data, (function(_this) {
        return function(ffc) {
          var ref;
          return ref = _this.geoIp.data.country, indexOf.call(ffc.countries, ref) >= 0;
        };
      })(this));
      if (this.selected) {
        this.$rootScope.$emit('fulfillments:loaded', this.data);
        this.loaded = true;
      } else {
        return this.getGeneric();
      }
    };

    return FulfillmentsCenter;

  })();

  angular.module('imago').service('fulfillmentsCenter', ['$http', '$rootScope', 'geoIp', 'imagoModel', 'imagoUtils', FulfillmentsCenter]);

}).call(this);

(function() {
  var GeoIp;

  GeoIp = (function() {
    GeoIp.prototype.data = {};

    GeoIp.prototype.loaded = false;

    function GeoIp($rootScope, $http, imagoModel, imagoUtils) {
      this.$rootScope = $rootScope;
      this.$http = $http;
      this.imagoModel = imagoModel;
      this.imagoUtils = imagoUtils;
      this.get();
    }

    GeoIp.prototype.get = function() {
      return this.$http.get(this.imagoModel.host + "/geoip").then((function(_this) {
        return function(response) {
          var code;
          if (_.isEmpty(response.data)) {
            return _this.getCookie();
          }
          code = _this.imagoUtils.getCountryByCode(response.data.country_code);
          _this.imagoUtils.cookie('countryGeo', response.data.country_code);
          response.data.country = code;
          _this.data = response.data;
          _this.$rootScope.$emit('geoip:loaded', _this.data);
          _this.loaded = true;
          return response.data;
        };
      })(this), (function(_this) {
        return function(err) {
          return _this.getCookie();
        };
      })(this));
    };

    GeoIp.prototype.getCookie = function() {
      if (this.imagoUtils.cookie('countryGeo')) {
        this.data.country = this.imagoUtils.getCountryByCode(this.imagoUtils.cookie('countryGeo'));
        this.$rootScope.$emit('geoip:loaded', this.data);
        return this.loaded = true;
      } else {
        this.data = null;
        this.$rootScope.$emit('geoip:loaded', this.data);
        return this.loaded = true;
      }
    };

    return GeoIp;

  })();

  angular.module('imago').service('geoIp', ['$rootScope', '$http', 'imagoModel', 'imagoUtils', GeoIp]);

}).call(this);

(function() {
  var ImagoCartMessages;

  ImagoCartMessages = (function() {
    function ImagoCartMessages() {
      return {
        restrict: 'E',
        scope: {
          item: '=imagoCartMessages'
        },
        templateUrl: '/imago/imago-cart-messages.html'
      };
    }

    return ImagoCartMessages;

  })();

  angular.module('imago').directive('imagoCartMessages', [ImagoCartMessages]);

}).call(this);

(function() {
  var ImagoCartUtils,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ImagoCartUtils = (function() {
    function ImagoCartUtils() {
      return {
        updateChangedItem: function(item) {
          var ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
          item.updates = [];
          if (!item.changed.length) {
            return item;
          }
          item.finalsale = (ref = item.fields) != null ? (ref1 = ref.finalSale) != null ? ref1.value : void 0 : void 0;
          item.presale = (ref2 = item.fields) != null ? (ref3 = ref2.presale) != null ? ref3.value : void 0 : void 0;
          if (item.qty > item.stock && !item.presale) {
            item.qty = item.stock;
            item.updates.push('quantity');
          }
          if (indexOf.call(item.changed, 'price') >= 0) {
            item.price = (ref4 = item.fields) != null ? (ref5 = ref4.price) != null ? ref5.value : void 0 : void 0;
            item.updates.push('price');
          }
          if (indexOf.call(item.changed, 'discountedPrice') >= 0 && ((ref6 = item.fields) != null ? (ref7 = ref6.discountedPrice) != null ? (ref8 = ref7.value) != null ? ref8[this.currency] : void 0 : void 0 : void 0)) {
            item.price = (ref9 = item.fields) != null ? (ref10 = ref9.discountedPrice) != null ? ref10.value : void 0 : void 0;
            if (indexOf.call(item.updates, 'price') < 0) {
              item.updates.push('price');
            }
          }
          return item;
        }
      };
    }

    return ImagoCartUtils;

  })();

  angular.module('imago').factory('imagoCartUtils', [ImagoCartUtils]);

}).call(this);

(function() {
  var imagoCart, imagoCartController;

  imagoCart = (function() {
    function imagoCart() {
      return {
        restrict: 'E',
        transclude: true,
        templateUrl: function(element, attrs) {
          return attrs.templateUrl || '/imago/imago-cart.html';
        },
        controller: 'imagoCartController as cart'
      };
    }

    return imagoCart;

  })();

  imagoCartController = (function() {
    function imagoCartController($rootScope, $scope, imagoCart1, $location, $attrs) {
      var i, key, len, ref, ref1;
      this.imagoCart = imagoCart1;
      this.$location = $location;
      this.opts = {
        hideOnScroll: true
      };
      ref = Object.keys(this.opts);
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        if (!$attrs[key]) {
          continue;
        }
        if ((ref1 = $attrs[key]) === 'true' || ref1 === 'false') {
          this.opts[key] = JSON.parse($attrs[key]);
        }
      }
      if (this.opts.hideOnScroll) {
        $rootScope.$on('scrollstart', (function(_this) {
          return function() {
            return _this.imagoCart.show = false;
          };
        })(this));
      }
    }

    imagoCartController.prototype.maxQty = function(item) {
      if (!item) {
        return;
      }
      if (item.presale) {
        return this.imagoCart.maxQtyPerItem || 100;
      } else {
        return Math.min(this.imagoCart.maxQtyPerItem || 100, item.stock);
      }
    };

    imagoCartController.prototype.goToProduct = function(url) {
      return this.$location.url(url);
    };

    return imagoCartController;

  })();

  angular.module('imago').directive('imagoCart', [imagoCart]).controller('imagoCartController', ['$rootScope', '$scope', 'imagoCart', '$location', '$attrs', imagoCartController]);

}).call(this);

(function() {
  var imagoCart,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  imagoCart = (function() {
    imagoCart.prototype.show = false;

    imagoCart.prototype.itemsLength = 0;

    imagoCart.prototype.settings = [];

    imagoCart.prototype.messages = [];

    function imagoCart($q, $rootScope, $timeout, $location, $window, $http, imagoUtils, imagoModel, fulfillmentsCenter, geoIp, tenantSettings, imagoCartUtils) {
      this.$q = $q;
      this.$rootScope = $rootScope;
      this.$timeout = $timeout;
      this.$location = $location;
      this.$window = $window;
      this.$http = $http;
      this.imagoUtils = imagoUtils;
      this.imagoModel = imagoModel;
      this.fulfillmentsCenter = fulfillmentsCenter;
      this.geoIp = geoIp;
      this.tenantSettings = tenantSettings;
      this.imagoCartUtils = imagoCartUtils;
      this.remove = bind(this.remove, this);
      this.update = bind(this.update, this);
      this.create = bind(this.create, this);
      this.checkCart = bind(this.checkCart, this);
      this.checkStatus = bind(this.checkStatus, this);
      this.cart = {
        items: []
      };
      if (this.tenantSettings.loaded) {
        return this.onSettings();
      }
      this.$rootScope.$on('settings:loaded', (function(_this) {
        return function(evt, message) {
          return _this.onSettings();
        };
      })(this));
    }

    imagoCart.prototype.onSettings = function() {
      var local, ref, ref1;
      this.currencies = this.$rootScope.tenantSettings.currencies;
      if ((ref = this.$rootScope.tenantSettings.maxQtyPerItem) != null ? ref.active : void 0) {
        this.maxQtyPerItem = (ref1 = this.$rootScope.tenantSettings.maxQtyPerItem) != null ? ref1.value : void 0;
      }
      this.checkGeoIp();
      local = this.imagoUtils.cookie('imagoCart');
      if (local) {
        return this.checkStatus(local);
      }
    };

    imagoCart.prototype.checkGeoIp = function() {
      var watcher;
      if (!this.geoIp.loaded) {
        this.checkCurrency();
        return watcher = this.$rootScope.$on('geoip:loaded', (function(_this) {
          return function(evt, data) {
            _this.checkCurrency();
            return watcher();
          };
        })(this));
      } else {
        return this.checkCurrency();
      }
    };

    imagoCart.prototype.checkCurrency = function() {
      var currency, ref;
      if (!_.isEmpty(this.geoIp.data)) {
        currency = this.imagoUtils.CURRENCY_MAPPING[this.geoIp.data.country];
      }
      if (currency && this.currencies && indexOf.call(this.currencies, currency) >= 0) {
        this.currency = currency;
      } else if ((ref = this.currencies) != null ? ref.length : void 0) {
        this.currency = this.currencies[0];
      } else {
        console.log('you need to enable at least one currency in the settings');
      }
      this.$rootScope.$emit('imagocart:currencyloaded');
      if (!this.cart) {
        return;
      }
      if (this.cart.currency !== this.currency) {
        this.cart.currency = angular.copy(this.currency);
        this.update();
      }
      return this.calculate();
    };

    imagoCart.prototype.checkStatus = function(id) {
      return this.$http.get(this.imagoModel.host + "/api/carts?cartid=" + id).then((function(_this) {
        return function(response) {
          var watcher;
          _.assign(_this.cart, response.data);
          if (!_this.fulfillmentsCenter.loaded) {
            return watcher = _this.$rootScope.$on('fulfillments:loaded', function(evt, data) {
              _this.statusLoaded();
              return watcher();
            });
          } else {
            return _this.statusLoaded();
          }
        };
      })(this));
    };

    imagoCart.prototype.statusLoaded = function() {
      var i, item, len, ref, ref1, ref2, ref3, ref4, update;
      update = false;
      ref = this.cart.items;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        item.stock = Number((ref1 = item.fields) != null ? (ref2 = ref1.stock) != null ? (ref3 = ref2.value) != null ? ref3[this.fulfillmentsCenter.selected._id] : void 0 : void 0 : void 0);
        item = this.imagoCartUtils.updateChangedItem(item);
        if (item.stock <= 0 && !item.presale) {
          this.newmessages = true;
          this.show = true;
          update = true;
          this.messages.push({
            item: item,
            type: 'nostock'
          });
          _.remove(this.cart.items, {
            _id: item._id
          });
        } else if ((ref4 = item.updates) != null ? ref4.length : void 0) {
          this.newmessages = true;
          this.show = true;
          update = true;
        }
      }
      if (!this.currency) {
        this.currency = angular.copy(this.cart.currency);
      }
      if (update) {
        this.update();
      }
      this.calculate();
      return this.checkGeoIp();
    };

    imagoCart.prototype.checkCart = function() {
      if (this.cart._id) {
        return this.$q.resolve('update');
      }
      return this.create(this.cart).then((function(_this) {
        return function(response) {
          _.assign(_this.cart, response.data);
          _this.imagoUtils.cookie('imagoCart', response.data._id);
          return response.data;
        };
      })(this));
    };

    imagoCart.prototype.create = function(cart) {
      return this.$http.post(this.imagoModel.host + "/api/carts", cart);
    };

    imagoCart.prototype.add = function(item, options, fields, cartOptions) {
      var copy, field, filter, i, j, len, len1, option, parent, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
      console.log('cartOptions', cartOptions);
      if (!item) {
        return console.log('item required');
      }
      if ((item.stock <= 0 || !item.stock) && !item.presale) {
        return console.log('no stock');
      }
      item.qty || (item.qty = 1);
      item.finalsale = (ref = item.fields) != null ? (ref1 = ref.finalSale) != null ? ref1.value : void 0 : void 0;
      item.presale = (ref2 = item.fields) != null ? (ref3 = ref2.presale) != null ? ref3.value : void 0 : void 0;
      if (_.isArray(options) && (options != null ? options.length : void 0)) {
        item.options = {};
        for (i = 0, len = options.length; i < len; i++) {
          option = options[i];
          item.options[option] = item.fields[option];
        }
      } else if (_.isPlainObject(options)) {
        item.options = options;
      }
      if ((ref4 = item.options) != null ? ref4.name : void 0) {
        item.name = item.options.name;
        delete item.options.name;
      }
      parent = this.imagoModel.find({
        '_id': item.parent
      });
      if (parent) {
        if (!item.name) {
          item.name = (ref5 = parent.fields) != null ? (ref6 = ref5.title) != null ? ref6.value : void 0 : void 0;
        }
        if (!item.serving_url) {
          item.serving_url = parent.serving_url;
        }
        if ((ref7 = item.fields) != null) {
          if ((ref8 = ref7.title) != null) {
            ref8.value = (ref9 = parent.fields) != null ? (ref10 = ref9.title) != null ? ref10.value : void 0 : void 0;
          }
        }
        if ((ref11 = item.fields) != null) {
          if ((ref12 = ref11.description) != null) {
            ref12.value = (ref13 = parent.fields) != null ? (ref14 = ref13.description) != null ? ref14.value : void 0 : void 0;
          }
        }
        if (_.isArray(fields) && fields.length) {
          for (j = 0, len1 = fields.length; j < len1; j++) {
            field = fields[j];
            item.fields[field] = parent.fields[field];
          }
        } else if (_.isPlainObject(fields)) {
          _.assign(item.fields, parent.fields);
        }
      }
      copy = angular.copy(item);
      filter = _.find(this.cart.items, {
        _id: copy._id
      });
      if ((ref15 = copy.fields) != null ? (ref16 = ref15.discountedPrice) != null ? (ref17 = ref16.value) != null ? ref17[this.currency] : void 0 : void 0 : void 0) {
        copy.price = copy.fields.discountedPrice.value;
      } else {
        copy.price = copy.fields.price.value;
      }
      copy.link = this.$location.url();
      if (filter) {
        if (!filter.name) {
          filter.name = copy.name;
        }
        filter.qty += copy.qty;
        filter.qty = Math.min(filter.stock, this.maxQtyPerItem || filter.qty, filter.qty);
        _.assign(filter.options, copy.options);
        _.assign(filter.fields, copy.fields);
      } else {
        this.cart.items.push(copy);
      }
      if (!(cartOptions != null ? cartOptions.silent : void 0)) {
        this.$timeout((function(_this) {
          return function() {
            return _this.show = true;
          };
        })(this));
      }
      this.calculate();
      return this.checkCart().then((function(_this) {
        return function(response) {
          if (response === 'update') {
            return _this.update();
          }
        };
      })(this));
    };

    imagoCart.prototype.update = function() {
      if (!this.cart._id) {
        return;
      }
      return this.$http.put(this.imagoModel.host + "/api/carts/" + this.cart._id, this.cart);
    };

    imagoCart.prototype.remove = function(item) {
      _.remove(this.cart.items, {
        '_id': item._id
      });
      this.calculate();
      return this.update();
    };

    imagoCart.prototype.clear = function() {
      this.cart.items = [];
      this.calculate();
      return this.update();
    };

    imagoCart.prototype.calculate = function() {
      var i, item, len, ref, ref1, results;
      this.itemsLength = 0;
      this.subtotal = 0;
      if (!this.cart.items.length) {
        this.subtotal = 0;
        this.itemsLength = 0;
        return;
      }
      ref = this.cart.items;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        this.itemsLength += item.qty;
        if (!(item.qty && ((ref1 = item.price) != null ? ref1[this.currency] : void 0))) {
          continue;
        }
        results.push(this.subtotal += item.qty * item.price[this.currency]);
      }
      return results;
    };

    imagoCart.prototype.checkout = function() {
      var decorated, url;
      url = "https://" + this.tenantSettings.tenant + ".imago.io/account/checkout/" + this.cart._id;
      decorated = '';
      if (typeof ga === "function") {
        ga((function(_this) {
          return function(tracker) {
            var linker;
            linker = new _this.$window.gaplugins.Linker(tracker);
            return decorated = linker.decorate(url, true);
          };
        })(this));
      }
      return this.$window.location.href = decorated || url;
    };

    return imagoCart;

  })();

  angular.module('imago').service('imagoCart', ['$q', '$rootScope', '$timeout', '$location', '$window', '$http', 'imagoUtils', 'imagoModel', 'fulfillmentsCenter', 'geoIp', 'tenantSettings', 'imagoCartUtils', imagoCart]);

}).call(this);

(function() {
  var imagoFindPrice, imagoFindPriceController;

  imagoFindPrice = (function() {
    function imagoFindPrice() {
      return {
        controller: 'imagoFindPriceController as findprice',
        bindings: {
          options: '=variants',
          product: '=',
          attributes: '@'
        },
        templateUrl: '/imago/imago-find-price.html'
      };
    }

    return imagoFindPrice;

  })();

  imagoFindPriceController = (function() {
    function imagoFindPriceController($scope, $parse, imagoCart) {
      var initWatcher, watch;
      this.imagoCart = imagoCart;
      this.attrs = $parse(this.attributes)();
      initWatcher = (function(_this) {
        return function() {
          var createWatchFunc, i, len, name, ref, toWatchProperties;
          toWatchProperties = ['findprice.imagoCart.currency', 'findprice.options'];
          createWatchFunc = function(name) {
            return toWatchProperties.push(function() {
              return _this.product[name];
            });
          };
          if (_this.attrs) {
            ref = _this.attrs;
            for (i = 0, len = ref.length; i < len; i++) {
              name = ref[i];
              createWatchFunc(name);
            }
          }
          return $scope.$watchGroup(toWatchProperties, function() {
            return _this.findOpts();
          });
        };
      })(this);
      watch = $scope.$watch('findprice.product', function(value) {
        if (!value) {
          return;
        }
        watch();
        return initWatcher();
      });
    }

    imagoFindPriceController.prototype.findOpts = function() {
      var i, len, name, ref, ref1;
      if (!(this.imagoCart.currency && ((ref = this.options) != null ? ref.length : void 0) && this.product)) {
        return;
      }
      this.variants = _.cloneDeep(this.options);
      if (this.attrs) {
        ref1 = this.attrs;
        for (i = 0, len = ref1.length; i < len; i++) {
          name = ref1[i];
          if (!this.product[name]) {
            continue;
          }
          this.variants = _.filter(this.variants, (function(_this) {
            return function(item) {
              var ref2, ref3;
              return _this.product[name] === ((ref2 = item.fields) != null ? (ref3 = ref2[name]) != null ? ref3.value : void 0 : void 0);
            };
          })(this));
        }
      }
      return this.findPrice();
    };

    imagoFindPriceController.prototype.findPrice = function() {
      var i, len, option, ref, ref1, ref2, ref3, ref4, ref5, ref6;
      this.prices = [];
      this.discounts = [];
      ref = this.variants;
      for (i = 0, len = ref.length; i < len; i++) {
        option = ref[i];
        if ((ref1 = option.fields) != null ? (ref2 = ref1.price) != null ? (ref3 = ref2.value) != null ? ref3[this.imagoCart.currency] : void 0 : void 0 : void 0) {
          this.prices.push(option.fields.price.value[this.imagoCart.currency]);
        }
        if ((ref4 = option.fields) != null ? (ref5 = ref4.discountedPrice) != null ? (ref6 = ref5.value) != null ? ref6[this.imagoCart.currency] : void 0 : void 0 : void 0) {
          this.discounts.push(option.fields.discountedPrice.value[this.imagoCart.currency]);
        }
      }
      if (!this.prices.length) {
        return;
      }
      this.highest = Math.max.apply(Math, this.prices);
      if (this.discounts.length) {
        return this.lowest = Math.max.apply(Math, this.discounts);
      } else {
        return this.lowest = Math.min.apply(Math, this.prices);
      }
    };

    return imagoFindPriceController;

  })();

  angular.module('imago').component('imagoFindPrice', new imagoFindPrice()).controller('imagoFindPriceController', ['$scope', '$parse', 'imagoCart', imagoFindPriceController]);

}).call(this);

(function() {
  var imagoProduct;

  imagoProduct = (function() {
    function imagoProduct(imagoCart, fulfillmentsCenter) {
      var ProductInstance;
      return ProductInstance = (function() {
        function ProductInstance(variants, options) {
          var key, ref;
          this.variants = variants;
          if (!((ref = this.variants) != null ? ref.length : void 0) || !options) {
            return;
          }
          for (key in options) {
            this[key] = options[key];
          }
          if (!this.optionsWhitelist) {
            return console.log('no optionsWhitelist set.');
          }
          this.lowStock || (this.lowStock = 3);
          this.getOptions();
        }

        ProductInstance.prototype.getOptions = function() {
          var base, i, item, j, k, key, len, len1, len2, name, obj, order, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, variant;
          this.options = {};
          if (this.variants.length === 1) {
            ref = this.variants;
            for (i = 0, len = ref.length; i < len; i++) {
              variant = ref[i];
              variant.stock = Number((ref1 = variant.fields) != null ? (ref2 = ref1.stock) != null ? (ref3 = ref2.value) != null ? ref3[fulfillmentsCenter.selected._id] : void 0 : void 0 : void 0);
              variant.presale = (ref4 = variant.fields) != null ? (ref5 = ref4.presale) != null ? ref5.value : void 0 : void 0;
              variant.lowstock = variant.stock <= this.lowStock && variant.stock ? true : false;
            }
            return this.selected = _.head(this.variants);
          } else {
            ref6 = this.variants;
            for (j = 0, len1 = ref6.length; j < len1; j++) {
              variant = ref6[j];
              if (!angular.isDefined((ref7 = variant.fields.price) != null ? (ref8 = ref7.value) != null ? ref8[imagoCart.currency] : void 0 : void 0)) {
                continue;
              }
              ref9 = this.optionsWhitelist;
              for (k = 0, len2 = ref9.length; k < len2; k++) {
                item = ref9[k];
                if (!((ref10 = variant.fields[item.name]) != null ? ref10.value : void 0)) {
                  continue;
                }
                obj = {};
                for (key in item) {
                  obj[key] = (ref11 = variant.fields) != null ? (ref12 = ref11[item[key]]) != null ? ref12.value : void 0 : void 0;
                }
                obj.normname = _.kebabCase(obj.name);
                (base = this.options)[name = item.name] || (base[name] = []);
                this.options[item.name].push(obj);
              }
              variant.stock = Number((ref13 = variant.fields) != null ? (ref14 = ref13.stock) != null ? (ref15 = ref14.value) != null ? ref15[fulfillmentsCenter.selected._id] : void 0 : void 0 : void 0);
              variant.presale = (ref16 = variant.fields) != null ? (ref17 = ref16.presale) != null ? ref17.value : void 0 : void 0;
              variant.lowstock = variant.stock <= this.lowStock && variant.stock ? true : false;
            }
            if (((ref18 = this.options.size) != null ? ref18.length : void 0) > 1) {
              order = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'];
              this.options.size.sort(function(a, b) {
                return order.indexOf(a.normname) - order.indexOf(b.normname);
              });
            }
            for (key in this.options) {
              this.options[key] = _.uniqBy(this.options[key], 'name');
              if (((ref19 = this.options[key]) != null ? ref19.length : void 0) === 1) {
                this[key] = _.head(this.options[key]).name;
              }
            }
            return this.selectVariant();
          }
        };

        ProductInstance.prototype.setOption = function(attr, value) {
          this[attr] = value;
          return this.selectVariant();
        };

        ProductInstance.prototype.findVariant = function(field, value) {
          var i, item, len, obj, opt, opts, ref;
          opts = [];
          ref = this.optionsWhitelist;
          for (i = 0, len = ref.length; i < len; i++) {
            opt = ref[i];
            obj = {
              name: opt.name
            };
            obj.value = obj.name === field ? value : this[opt.name];
            if (!obj.value) {
              return true;
            }
            opts.push(obj);
          }
          item = _.find(this.variants, function(variant) {
            var j, len1, ref1, ref2, valid;
            valid = true;
            for (j = 0, len1 = opts.length; j < len1; j++) {
              opt = opts[j];
              if (_.kebabCase((ref1 = variant.fields) != null ? (ref2 = ref1[opt.name]) != null ? ref2.value : void 0 : void 0) !== _.kebabCase(opt.value)) {
                valid = false;
              }
            }
            if (valid) {
              return true;
            }
          });
          if ((item != null ? item.stock : void 0) || (item != null ? item.presale : void 0)) {
            return true;
          } else {
            return false;
          }
        };

        ProductInstance.prototype.selectVariant = function() {
          var key, keys, ref, ref1, ref2, ref3, valid, variant;
          keys = {};
          valid = true;
          for (key in this.options) {
            if (!this[key]) {
              valid = false;
            }
            keys[key] = this[key];
          }
          if (!valid) {
            return;
          }
          variant = _.find(this.variants, (function(_this) {
            return function(item) {
              var norm, ref, ref1;
              valid = true;
              for (key in keys) {
                norm = _.kebabCase((ref = item.fields) != null ? (ref1 = ref[key]) != null ? ref1.value : void 0 : void 0);
                if (norm !== _.kebabCase(_this[key])) {
                  return false;
                }
              }
              return valid;
            };
          })(this));
          if (!variant) {
            this.selected = 0;
            return;
          }
          variant.price = (ref = variant.fields) != null ? (ref1 = ref.price) != null ? ref1.value : void 0 : void 0;
          variant.discountedPrice = (ref2 = variant.fields) != null ? (ref3 = ref2.discountedPrice) != null ? ref3.value : void 0 : void 0;
          return this.selected = variant;
        };

        return ProductInstance;

      })();
    }

    return imagoProduct;

  })();

  angular.module('imago').factory('imagoProduct', ['imagoCart', 'fulfillmentsCenter', imagoProduct]);

}).call(this);

(function() {
  var ShippingCountries;

  ShippingCountries = (function() {
    ShippingCountries.prototype.data = [];

    ShippingCountries.prototype.loaded = false;

    function ShippingCountries($http, imagoModel) {
      this.$http = $http;
      this.imagoModel = imagoModel;
      this.get();
    }

    ShippingCountries.prototype.get = function() {
      return this.$http.get(this.imagoModel.host + '/api/shippingmethods').then((function(_this) {
        return function(response) {
          var country, i, j, len, len1, method, ref, ref1;
          ref = response.data;
          for (i = 0, len = ref.length; i < len; i++) {
            method = ref[i];
            ref1 = method.countries;
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              country = ref1[j];
              _this.data.push(country);
            }
          }
          _this.data = _.sortBy(_.compact(_.uniq(_this.data)));
          return _this.loaded = true;
        };
      })(this));
    };

    return ShippingCountries;

  })();

  angular.module('imago').service('shippingCountries', ['$http', 'imagoModel', ShippingCountries]);

}).call(this);

(function() {
  var VariantsStorage;

  VariantsStorage = (function() {
    VariantsStorage.prototype.data = [];

    function VariantsStorage($http, $q, imagoModel) {
      this.$http = $http;
      this.$q = $q;
      this.imagoModel = imagoModel;
    }

    VariantsStorage.prototype.search = function(id) {
      return this.$http.get(this.imagoModel.host + "/api/variants/" + id);
    };

    VariantsStorage.prototype.get = function(parent) {
      var asset, data, defer;
      defer = this.$q.defer();
      asset = this.imagoModel.find({
        _id: parent
      });
      data = _.filter(this.data, {
        parent: parent
      });
      if ((asset != null ? asset.variants.length : void 0) === data.length) {
        defer.resolve(data);
      } else {
        this.search(parent).then(function(response) {
          return defer.resolve(response.data);
        });
      }
      return defer.promise;
    };

    return VariantsStorage;

  })();

  angular.module('imago').service('variantsStorage', ['$http', '$q', 'imagoModel', VariantsStorage]);

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/imago-cart-messages.html','<div class="imago-cart-messages-container"><div ng-repeat="key in item.updates" ng-swich="key" class="message"><p ng-swich-wen="price">price has changed.</p><p ng-swich-wen="quantity">quantity has been updated.</p></div></div>');
$templateCache.put('/imago/imago-cart.html','<div ng-class="{\'message\': cart.imagoCart.newmessages}" ng-mouseenter="cart.imagoCart.show = true" ng-click="cart.imagoCart.show = !cart.imagoCart.show" analytics-on="click" analytics-event="Show Cart {{cart.imagoCart.show}}" class="imago-cart-icon"><div ng-bind="cart.imagoCart.itemsLength" class="counter"></div></div><div ng-show="cart.imagoCart.show" stop-scroll="stop-scroll" class="imago-cart-modal"><div ng-transclude="ng-transclude"></div><div class="imago-cart-messages"><div ng-repeat="message in cart.imagoCart.messages" ng-switch="message.type" class="message"><p ng-switch-when="nostock">Item {{message.item.name}} is not in stock anymore</p></div></div><div ng-show="cart.imagoCart.itemsLength" class="itemnumber">{{cart.imagoCart.itemsLength}}<span ng-show="cart.imagoCart.itemsLength === 1"> item</span><span ng-show="cart.imagoCart.itemsLength &gt; 1"> items</span></div><div ng-show="cart.imagoCart.itemsLength === 0 &amp;&amp; !cart.imagoCart.messages.length" class="noitems">cart empty</div><div ng-show="cart.imagoCart.itemsLength" class="subtotal">subtotal:<span ng-bind-html="cart.imagoCart.currency | currencySymbol" class="currency"></span><span class="amount">{{cart.imagoCart.subtotal | price:0}}</span></div><button ng-show="cart.imagoCart.cart.items.length" type="button" ng-click="cart.imagoCart.checkout()" analytics-on="click" analytics-event="Go to Checkout" class="checkout">checkout</button></div>');
$templateCache.put('/imago/imago-find-price.html','<div class="imago-find-price-container"><div ng-show="findprice.highest === findprice.lowest" class="one-price"><span ng-bind-html="findprice.imagoCart.currency | currencySymbol" class="currency"></span><span ng-bind="findprice.highest | price: 0" class="amount"></span></div><div ng-show="findprice.highest !== findprice.lowest" ng-class="{\'discount\': findprice.discounts.length, \'range\': !findprice.discounts.length}"><span ng-bind-html="findprice.imagoCart.currency" class="currency low"></span><span ng-bind="findprice.lowest | price: 0" class="amount low"></span><span class="dash">-</span><span ng-bind-html="findprice.imagoCart.currency" class="currency high"></span><span ng-bind="findprice.highest | price: 0" class="amount high"></span></div></div>');}]);