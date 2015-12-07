var FulfillmentsCenter,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

FulfillmentsCenter = (function() {
  FulfillmentsCenter.prototype.data = [];

  FulfillmentsCenter.prototype.loaded = false;

  FulfillmentsCenter.prototype.selected = {};

  function FulfillmentsCenter($http, $rootScope, geoIp, imagoSettings, imagoUtils) {
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.geoIp = geoIp;
    this.imagoSettings = imagoSettings;
    this.imagoUtils = imagoUtils;
    this.get();
  }

  FulfillmentsCenter.prototype.get = function() {
    return this.$http.get(this.imagoSettings.host + '/api/fulfillmentcenters').then((function(_this) {
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

angular.module('imago').service('fulfillmentsCenter', ['$http', '$rootScope', 'geoIp', 'imagoSettings', 'imagoUtils', FulfillmentsCenter]);

var GeoIp;

GeoIp = (function() {
  GeoIp.prototype.data = {};

  GeoIp.prototype.loaded = false;

  function GeoIp($rootScope, $http, imagoUtils) {
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.imagoUtils = imagoUtils;
    this.get();
  }

  GeoIp.prototype.get = function() {
    return this.$http.get('//api.imago.io/geoip').then((function(_this) {
      return function(response) {
        var code;
        if (_.isEmpty(response.data)) {
          return _this.getCookie();
        }
        code = _this.imagoUtils.getCountryByCode(response.data.country_code);
        _this.imagoUtils.cookie('countryGeo', response.data.country_code);
        _this.data.country = code;
        _this.$rootScope.$emit('geoip:loaded', _this.data);
        return _this.loaded = true;
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

angular.module('imago').service('geoIp', ['$rootScope', '$http', 'imagoUtils', GeoIp]);

var ImagoCartMessages;

ImagoCartMessages = (function() {
  function ImagoCartMessages() {
    return {
      scope: {
        item: '=imagoCartMessages'
      },
      templateUrl: '/imago/imago-cart-messages.html'
    };
  }

  return ImagoCartMessages;

})();

angular.module('imago').directive('imagoCartMessages', [ImagoCartMessages]);

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
        if (item.qty > item.stock) {
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

var imagoCart, imagoCartController;

imagoCart = (function() {
  function imagoCart() {
    return {
      replace: true,
      scope: {
        min: '=',
        max: '=',
        ngModel: '='
      },
      transclude: true,
      templateUrl: '/imago/imago-cart.html',
      controller: 'imagoCartController as cart'
    };
  }

  return imagoCart;

})();

imagoCartController = (function() {
  function imagoCartController(imagoCart1, $location) {
    this.imagoCart = imagoCart1;
    this.$location = $location;
    this.clickOut = function(evt, className) {
      if (evt.target.tagName === 'BUTTON' && evt.target.className.indexOf(className) !== -1) {
        return;
      }
      return this.imagoCart.show = false;
    };
  }

  imagoCartController.prototype.goToProduct = function(url) {
    return this.$location.url(url);
  };

  return imagoCartController;

})();

angular.module('imago').directive('imagoCart', [imagoCart]).controller('imagoCartController', ['imagoCart', '$location', imagoCartController]);

var imagoCart,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

imagoCart = (function() {
  imagoCart.prototype.show = false;

  imagoCart.prototype.itemsLength = 0;

  imagoCart.prototype.settings = [];

  function imagoCart($q, $rootScope, $location, $window, $http, imagoUtils, imagoModel, fulfillmentsCenter, geoIp, imagoSettings, tenantSettings, imagoCartUtils) {
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$location = $location;
    this.$window = $window;
    this.$http = $http;
    this.imagoUtils = imagoUtils;
    this.imagoModel = imagoModel;
    this.fulfillmentsCenter = fulfillmentsCenter;
    this.geoIp = geoIp;
    this.imagoSettings = imagoSettings;
    this.imagoCartUtils = imagoCartUtils;
    this.remove = bind(this.remove, this);
    this.update = bind(this.update, this);
    this.create = bind(this.create, this);
    this.checkCart = bind(this.checkCart, this);
    this.checkStatus = bind(this.checkStatus, this);
    this.cart = {
      items: []
    };
    if (tenantSettings.loaded) {
      return this.onSettings();
    }
    this.$rootScope.$on('settings:loaded', (function(_this) {
      return function(evt, message) {
        return _this.onSettings();
      };
    })(this));
  }

  imagoCart.prototype.onSettings = function() {
    var local;
    this.currencies = this.$rootScope.tenantSettings.currencies;
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
    return this.$http.get(this.imagoSettings.host + "/api/carts?cartid=" + id).then((function(_this) {
      return function(response) {
        var watcher;
        console.log('check cart', response.data);
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
      if ((ref4 = item.updates) != null ? ref4.length : void 0) {
        this.newmessages = true;
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
    var defer;
    defer = this.$q.defer();
    if (this.cart._id) {
      defer.resolve('update');
    } else {
      this.create(this.cart).then((function(_this) {
        return function(response) {
          _.assign(_this.cart, response.data);
          _this.imagoUtils.cookie('imagoCart', response.data._id);
          return defer.resolve('created');
        };
      })(this));
    }
    return defer.promise;
  };

  imagoCart.prototype.create = function(cart) {
    return this.$http.post(this.imagoSettings.host + "/api/carts", cart);
  };

  imagoCart.prototype.add = function(item, options, fields) {
    var copy, field, filter, i, j, len, len1, option, parent, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
    if (!item) {
      return console.log('item required');
    }
    if (!item.qty) {
      return console.log('quantity required');
    }
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
      if (filter.qty !== filter.stock) {
        filter.qty += copy.qty;
      }
      _.assign(filter.options, copy.options);
      _.assign(filter.fields, copy.fields);
    } else {
      this.cart.items.push(copy);
    }
    this.show = true;
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
    return this.$http.put(this.imagoSettings.host + "/api/carts/" + this.cart._id, this.cart);
  };

  imagoCart.prototype.remove = function(item) {
    _.remove(this.cart.items, {
      '_id': item._id
    });
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
    if (!tenant) {
      return;
    }
    url = "https://" + tenant + ".imago.io/account/checkout/" + this.cart._id;
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

angular.module('imago').service('imagoCart', ['$q', '$rootScope', '$location', '$window', '$http', 'imagoUtils', 'imagoModel', 'fulfillmentsCenter', 'geoIp', 'imagoSettings', 'tenantSettings', 'imagoCartUtils', imagoCart]);

var ShippingCountries;

ShippingCountries = (function() {
  ShippingCountries.prototype.data = [];

  ShippingCountries.prototype.loaded = false;

  function ShippingCountries($http, imagoSettings) {
    this.$http = $http;
    this.imagoSettings = imagoSettings;
    this.get();
  }

  ShippingCountries.prototype.get = function() {
    return this.$http.get(this.imagoSettings.host + '/api/shippingmethods').then((function(_this) {
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

angular.module('imago').service('shippingCountries', ['$http', 'imagoSettings', ShippingCountries]);

var VariantsStorage;

VariantsStorage = (function() {
  VariantsStorage.prototype.data = [];

  function VariantsStorage($http, $q, imagoModel, imagoSettings) {
    this.$http = $http;
    this.$q = $q;
    this.imagoModel = imagoModel;
    this.imagoSettings = imagoSettings;
  }

  VariantsStorage.prototype.search = function(id) {
    return this.$http.get(this.imagoSettings.host + "/api/variants/" + id);
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

angular.module('imago').service('variantsStorage', ['$http', '$q', 'imagoModel', 'imagoSettings', VariantsStorage]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-cart-messages.html","<div class=\"messages\"><div ng-repeat=\"key in item.updates\" ng-swich=\"key\" class=\"message\"><p ng-swich-wen=\"price\">price has changed.</p><p ng-swich-wen=\"quantity\">quantity has been updated.</p></div></div>");
$templateCache.put("/imago/imago-cart.html","<div class=\"cart\"><div ng-class=\"{\'message\': cart.imagoCart.newmessages}\" ng-mouseenter=\"cart.imagoCart.show = true\" ng-click=\"cart.imagoCart.show = !cart.imagoCart.show\" analytics-on=\"click\" analytics-event=\"Show Cart {{cart.imagoCart.show}}\" class=\"icon\"><div ng-bind=\"cart.imagoCart.itemsLength\" class=\"counter\"></div></div><div ng-show=\"cart.imagoCart.show\" stop-scroll=\"stop-scroll\" class=\"box\"><div ng-transclude=\"ng-transclude\"></div><div ng-show=\"cart.imagoCart.itemsLength\" class=\"itemnumber\">{{cart.imagoCart.itemsLength}}<span ng-show=\"cart.imagoCart.itemsLength === 1\"> item</span><span ng-show=\"cart.imagoCart.itemsLength &gt; 1\"> items</span></div><div ng-show=\"cart.imagoCart.itemsLength === 0\" class=\"noitems\">cart empty</div><div ng-show=\"cart.imagoCart.itemsLength\" class=\"subtotal\">subtotal:<span ng-bind-html=\"cart.imagoCart.currency | currencySymbol\" class=\"currency\"></span><span class=\"amount\">{{cart.imagoCart.subtotal | price:0}}</span></div><button ng-show=\"cart.imagoCart.cart.items.length\" type=\"submit\" ng-click=\"cart.imagoCart.checkout()\" analytics-on=\"click\" analytics-event=\"Go to Checkout\" class=\"checkout\">checkout</button></div></div>");}]);