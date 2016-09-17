(function() {
  var Calculation,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Calculation = (function() {
    Calculation.prototype.cart = void 0;

    Calculation.prototype.costs = {};

    Calculation.prototype.coupon = void 0;

    Calculation.prototype.stripe = void 0;

    Calculation.prototype.currency = void 0;

    Calculation.prototype.shippingmethods = void 0;

    Calculation.prototype.taxes = void 0;

    Calculation.prototype.currencies = void 0;

    Calculation.prototype.taxincluded = void 0;

    Calculation.prototype.error = {};

    function Calculation($q, $state, $http, $auth, imagoUtils, imagoModel) {
      this.$q = $q;
      this.$state = $state;
      this.$http = $http;
      this.$auth = $auth;
      this.imagoUtils = imagoUtils;
      this.imagoModel = imagoModel;
      this.submit = bind(this.submit, this);
      this.calculate = bind(this.calculate, this);
      this.calculateTotal = bind(this.calculateTotal, this);
      this.getZipTax = bind(this.getZipTax, this);
      this.getTaxRate = bind(this.getTaxRate, this);
      this.calcShipping = bind(this.calcShipping, this);
      this.calculateShipping = bind(this.calculateShipping, this);
      this.changeShipping = bind(this.changeShipping, this);
      this.findShippingRate = bind(this.findShippingRate, this);
      this.getShippingRate = bind(this.getShippingRate, this);
      this.setShippingRates = bind(this.setShippingRates, this);
      this.setCurrency = bind(this.setCurrency, this);
      this.applyCoupon = bind(this.applyCoupon, this);
      this.checkCoupon = bind(this.checkCoupon, this);
      this.changeAddress = bind(this.changeAddress, this);
      this.deleteItem = bind(this.deleteItem, this);
      this.updateCart = bind(this.updateCart, this);
      this.countries = this.imagoUtils.COUNTRIES;
    }

    Calculation.prototype.updateCart = function() {
      this.$http.put(this.imagoModel.host + '/api/carts/' + this.cart._id, this.cart);
      return this.calculate();
    };

    Calculation.prototype.deleteItem = function(item) {
      var idx;
      idx = _.findIndex(this.cart.items, {
        id: item.id
      });
      this.cart.items.splice(idx, 1);
      return this.updateCart();
    };

    Calculation.prototype.changeAddress = function(section, type) {
      var ref, ref1, ref2, ref3;
      if (((ref = this.process.form['shipping_address']) != null ? ref.country : void 0) && this.differentshipping && type === 'country') {
        this.setCurrency(null, this.process.form['shipping_address'].country);
      } else if (type === 'country') {
        this.setCurrency(null, this.process.form[section].country);
      }
      this[section] || (this[section] = {});
      if ((ref1 = this.process.form[section].country) === 'United States of America' || ref1 === 'United States' || ref1 === 'USA' || ref1 === 'Canada' || ref1 === 'Australia') {
        this[section].disablestates = false;
        if ((ref2 = this.process.form[section].country) === 'United States of America' || ref2 === 'United States' || ref2 === 'USA') {
          this[section].states = this.imagoUtils.STATES['USA'];
        } else {
          this[section].states = this.imagoUtils.STATES[this.process.form[section].country.toUpperCase()];
        }
      } else {
        this[section].disablestates = true;
        this[section].states = [];
      }
      this.process.form[section].country_code = this.imagoUtils.CODES[this.process.form[section].country];
      if (((ref3 = this.process.form['shipping_address']) != null ? ref3.country : void 0) && this.differentshipping) {
        this.country = this.process.form['shipping_address'].country;
        this.state = this.process.form['shipping_address'].state;
        this.zip = this.process.form['shipping_address'].zip;
      } else {
        this.country = this.process.form[section].country;
        this.state = this.process.form[section].state;
        this.zip = this.process.form[section].zip;
      }
      return this.calculate();
    };

    Calculation.prototype.checkCoupon = function(code) {
      if (!code) {
        this.coupon = null;
        this.couponState = null;
        this.calculate();
        return;
      }
      return this.$http.get(this.imagoModel.host + '/api/coupons?code=' + code).then((function(_this) {
        return function(response) {
          if (response.data.length === 1) {
            _this.coupon = response.data[0];
            _this.couponState = 'valid';
          } else {
            _this.coupon = null;
            _this.couponState = 'invalid';
          }
          return _this.calculate();
        };
      })(this));
    };

    Calculation.prototype.applyCoupon = function(coupon, costs) {
      var code, codes, meta, percentvalue, ref, ref1, ref2, ref3, value;
      if (!coupon) {
        costs.discount = null;
        return;
      }
      meta = coupon.meta;
      this.couponState = 'valid';
      if (meta.type === 'flat') {
        value = Math.min(costs.subtotal, meta.value[this.currency]);
        return costs.discount = value;
      } else if (meta.type === 'percent') {
        percentvalue = Number((costs.subtotal * meta.value / 100).toFixed(0));
        return costs.discount = percentvalue;
      } else if (meta.type === 'free shipping') {
        costs.discount = null;
        if ((ref = meta.value) != null ? ref.length : void 0) {
          codes = (function() {
            var i, len, ref1, results;
            ref1 = meta.value;
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              code = ref1[i];
              results.push(code.toUpperCase());
            }
            return results;
          })();
        }
        if (((ref1 = meta.value) != null ? ref1.length : void 0) && (ref2 = this.shipping_options.code.toUpperCase(), indexOf.call(codes, ref2) >= 0)) {
          return costs.shipping = 0;
        } else if (!((ref3 = meta.value) != null ? ref3.length : void 0)) {
          return costs.shipping = 0;
        } else {
          return this.couponState = 'invalid';
        }
      }
    };

    Calculation.prototype.setCurrency = function(currency, country) {
      var oldcurrency;
      oldcurrency = angular.copy(this.currency);
      if (country) {
        currency = this.imagoUtils.inUsa(country) ? 'USD' : this.imagoUtils.CURRENCY_MAPPING[country];
      }
      this.currency = indexOf.call(this.currencies, currency) >= 0 ? currency : this.currencies[0];
      if (oldcurrency !== this.currency) {
        return this.saveCart();
      }
    };

    Calculation.prototype.setShippingRates = function(rates) {
      if (rates != null ? rates.length : void 0) {
        rates = _.isPlainObject(rates) ? [rates] : rates;
        rates = rates.sort((function(_this) {
          return function(a, b) {
            return a.ranges[0].price[_this.currency] - b.ranges[0].price[_this.currency];
          };
        })(this));
        this.shippingRates = rates;
      } else {
        this.shippingRates = [];
      }
      if (this.shippingRates.length) {
        return this.shipping_options = this.shippingRates[0];
      }
    };

    Calculation.prototype.getShippingRate = function() {
      var deferred, rates;
      deferred = this.$q.defer();
      rates = this.findShippingRate();
      deferred.resolve(rates);
      return deferred.promise;
    };

    Calculation.prototype.findShippingRate = function() {
      var rates, rates_by_country;
      if (!this.country) {
        return;
      }
      if (this.imagoUtils.inUsa(this.country)) {
        this.country = 'United States';
      }
      rates_by_country = _.filter(this.shippingmethods, (function(_this) {
        return function(item) {
          var c, ref, ref1;
          return item.active && (ref = (ref1 = _this.country) != null ? ref1.toUpperCase() : void 0, indexOf.call((function() {
            var i, len, ref2, results;
            ref2 = item.countries;
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              results.push(c.toUpperCase());
            }
            return results;
          })(), ref) >= 0);
        };
      })(this));
      if (this.state) {
        rates = _.filter(rates_by_country, (function(_this) {
          return function(item) {
            var ref, s;
            return ref = _this.state.toUpperCase(), indexOf.call((function() {
              var i, len, ref1, results;
              ref1 = item.states;
              results = [];
              for (i = 0, len = ref1.length; i < len; i++) {
                s = ref1[i];
                results.push(s.toUpperCase());
              }
              return results;
            })(), ref) >= 0;
          };
        })(this));
        if (rates != null ? rates.length : void 0) {
          return rates;
        }
        rates = _.filter(rates_by_country, (function(_this) {
          return function(item) {
            return !item.states.length;
          };
        })(this));
        if (rates.length) {
          return rates;
        }
        return _.filter(this.shippingmethods, function(item) {
          return !item.countries.length;
        });
      } else {
        if (rates_by_country.length) {
          return rates_by_country;
        }
        return _.filter(this.shippingmethods, function(item) {
          return !item.countries.length;
        });
      }
    };

    Calculation.prototype.changeShipping = function() {
      return this.calcShipping(this.shipping_options).then((function(_this) {
        return function(response) {
          _this.costs.shipping = response.shipping;
          return _this.calculate();
        };
      })(this));
    };

    Calculation.prototype.calculateShipping = function() {
      var deferred;
      deferred = this.$q.defer();
      if (this.calculateShippingRunning) {
        return;
      }
      this.calculateShippingRunning = true;
      this.costs.shipping = 0;
      this.getShippingRate().then((function(_this) {
        return function(rates) {
          var i, len, rate, results;
          _this.calculateShippingRunning = false;
          if (!(rates != null ? rates.length : void 0)) {
            _this.shipping_options = void 0;
            _this.shippingRates = [];
            if (_this.country) {
              _this.error.noshippingrule = true;
            }
            return deferred.resolve();
          }
          _this.error.noshippingrule = false;
          results = [];
          for (i = 0, len = rates.length; i < len; i++) {
            rate = rates[i];
            results.push(_this.calcShipping(rate).then(function(response) {
              var rateFix, shipping;
              if (_this.shipping_options && _this.shipping_options._id === response.rate._id) {
                _this.costs.shipping = response.shipping;
                deferred.resolve();
              } else if (!_this.shipping_options || _.difference(_this.shippingRates, rates).length) {
                _this.setShippingRates(rates);
                _this.costs.shipping = response.shipping;
                deferred.resolve();
              }
              rateFix = (response.shipping / 100).toFixed(2);
              shipping = _.find(_this.shippingRates, {
                '_id': response.rate._id
              });
              return shipping.nameprice = shipping.name + " (" + _this.currency + " " + rateFix + ")";
            }));
          }
          return results;
        };
      })(this));
      return deferred.promise;
    };

    Calculation.prototype.calcShipping = function(rate) {
      return this.$q((function(_this) {
        return function(resolve, reject) {
          var count, i, item, j, len, len1, range, ref, ref1, ref2, ref3, ref4, ref5, ref6, shipping, with_shippingcost;
          count = 0;
          with_shippingcost = [];
          shipping = 0;
          ref = _this.cart.items;
          for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];
            if ((ref1 = item.fields.overwriteShippingCosts) != null ? (ref2 = ref1.value) != null ? ref2[_this.currency] : void 0 : void 0) {
              with_shippingcost.push(item);
            } else if ((ref3 = item.fields.calculateShippingCosts) != null ? ref3.value : void 0) {
              if (rate.type === 'weight') {
                count += (((ref4 = item.fields.weight) != null ? ref4.value : void 0) || 1) * item.qty;
              } else {
                count += item.qty;
              }
            }
          }
          if (count === 0 && rate.type !== 'weight' && !with_shippingcost.length) {
            return resolve({
              'shipping': 0,
              'rate': rate
            });
          }
          range = _.find(rate.ranges, function(range) {
            return count <= range.to_unit && count >= range.from_unit;
          });
          if (!range) {
            range = _.last(rate.ranges);
          }
          if (count) {
            shipping = range.price[_this.currency];
          }
          for (j = 0, len1 = with_shippingcost.length; j < len1; j++) {
            item = with_shippingcost[j];
            shipping += (((ref5 = item.fields.overwriteShippingCosts) != null ? (ref6 = ref5.value) != null ? ref6[_this.currency] : void 0 : void 0) || 0) * item.qty;
          }
          return resolve({
            'shipping': shipping,
            'rate': rate
          });
        };
      })(this));
    };

    Calculation.prototype.calculateTax = function() {
      var deferred;
      deferred = this.$q.defer();
      this.getTaxRate().then((function(_this) {
        return function() {
          var i, item, j, len, len1, onepercent, ref, ref1, ref2, ref3;
          _this.costs.tax = 0;
          if (_this.imagoUtils.includesTax(_this.currency)) {
            _this.costs.includedTax = 0;
            if (_this.costs.taxRate) {
              ref = _this.cart.items;
              for (i = 0, len = ref.length; i < len; i++) {
                item = ref[i];
                if (!((ref1 = item.fields.calculateTaxes) != null ? ref1.value : void 0)) {
                  continue;
                }
                onepercent = item.price[_this.currency] / (100 + (_this.costs.taxRate * 100)) * item.qty;
                _this.costs.includedTax += onepercent * _this.costs.taxRate * 100;
              }
              return deferred.resolve();
            } else {
              return deferred.resolve();
            }
          } else {
            ref2 = _this.cart.items;
            for (j = 0, len1 = ref2.length; j < len1; j++) {
              item = ref2[j];
              if (!((ref3 = item.fields.calculateTaxes) != null ? ref3.value : void 0)) {
                continue;
              }
              if (item.price[_this.currency]) {
                _this.costs.tax += Math.round(item.price[_this.currency] * item.qty * _this.costs.taxRate);
              }
            }
            return deferred.resolve();
          }
        };
      })(this));
      return deferred.promise;
    };

    Calculation.prototype.getTaxRate = function() {
      var deferred, tRate;
      deferred = this.$q.defer();
      this.costs.taxRate = 0;
      if (!this.country) {
        deferred.resolve();
      }
      tRate = this.findTaxRate();
      if (tRate.autotax && this.imagoUtils.inUsa(this.country)) {
        return this.getZipTax();
      }
      this.costs.taxRate = tRate.rate / 100;
      deferred.resolve();
      return deferred.promise;
    };

    Calculation.prototype.findTaxRate = function() {
      var rate, rates, rates_by_country, ref, ref1;
      if (!this.country) {
        return {
          'rate': 0
        };
      }
      if ((ref = this.country) === 'United States of America' || ref === 'USA') {
        this.country = 'United States';
      }
      rates_by_country = _.filter(this.taxes, (function(_this) {
        return function(item) {
          var c, ref1, ref2;
          return item.active && (ref1 = (ref2 = _this.country) != null ? ref2.toUpperCase() : void 0, indexOf.call((function() {
            var i, len, ref3, results;
            ref3 = item.countries;
            results = [];
            for (i = 0, len = ref3.length; i < len; i++) {
              c = ref3[i];
              results.push(c.toUpperCase());
            }
            return results;
          })(), ref1) >= 0);
        };
      })(this));
      if (!rates_by_country.length) {
        rates_by_country = _.filter(this.taxes, (function(_this) {
          return function(item) {
            return item.active && !item.countries.length;
          };
        })(this));
      }
      if (this.state) {
        rate = _.find(rates_by_country, (function(_this) {
          return function(item) {
            var ref1, s;
            return ref1 = _this.state.toUpperCase(), indexOf.call((function() {
              var i, len, ref2, results;
              ref2 = item.states;
              results = [];
              for (i = 0, len = ref2.length; i < len; i++) {
                s = ref2[i];
                results.push(s.toUpperCase());
              }
              return results;
            })(), ref1) >= 0;
          };
        })(this));
        if (rate) {
          return rate;
        }
        rates = _.filter(rates_by_country, function(item) {
          return item.states.length === 0;
        });
        return (rates != null ? rates[0] : void 0) || {
          'rate': 0
        };
      } else if ((rates_by_country != null ? rates_by_country[0] : void 0) && !((ref1 = rates_by_country[0].states) != null ? ref1.length : void 0)) {
        return rates_by_country != null ? rates_by_country[0] : void 0;
      } else {
        return {
          'rate': 0
        };
      }
    };

    Calculation.prototype.getZipTax = function() {
      var deferred, ref;
      deferred = this.$q.defer();
      if (!(this.zip || (((ref = this.zip) != null ? ref.length : void 0) > 4))) {
        deferred.resolve();
      } else {
        this.$http.get((this.imagoModel.host + "/api/ziptax?zipcode=") + this.zip).then((function(_this) {
          return function(response) {
            _this.costs.taxRate = response.data.taxUse;
            return deferred.resolve();
          };
        })(this));
      }
      return deferred.promise;
    };

    Calculation.prototype.calculateTotal = function() {
      this.costs.total = 0;
      if (this.costs.subtotal) {
        this.costs.total += this.costs.subtotal;
      }
      if (this.costs.discount) {
        this.costs.total -= this.costs.discount;
      }
      if (this.costs.shipping) {
        this.costs.total += this.costs.shipping;
      }
      if (this.costs.tax) {
        this.costs.total += this.costs.tax;
      }
      return this.costs.total;
    };

    Calculation.prototype.checkStock = function(cb) {
      var changed, i, item, len, ref, ref1, ref2, ref3, ref4, ref5, ref6, stock;
      this.cartError = {};
      this.fcenter = _.find(this.fulfillmentcenters, (function(_this) {
        return function(ffc) {
          var ref;
          return ref = _this.country, indexOf.call(ffc.countries, ref) >= 0;
        };
      })(this));
      if (!this.fcenter) {
        this.fcenter = _.find(this.fulfillmentcenters, function(ffc) {
          return !ffc.countries.length;
        });
      }
      if (!this.fcenter) {
        return cb();
      }
      changed = false;
      ref = this.cart.items;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        stock = !_.isUndefined((ref1 = item.fields.stock) != null ? (ref2 = ref1.value) != null ? ref2[this.fcenter._id] : void 0 : void 0) ? (ref3 = item.fields.stock) != null ? (ref4 = ref3.value) != null ? ref4[this.fcenter._id] : void 0 : void 0 : 100000;
        if (parseInt(stock) < item.qty && !((ref5 = item.fields) != null ? (ref6 = ref5.presale) != null ? ref6.value : void 0 : void 0)) {
          item.qty = stock;
          changed = true;
          if (stock !== 0) {
            this.cartError[item._id] = {
              'maxStock': true
            };
          }
          if (stock === 0) {
            this.cartError[item._id] = {
              'noStock': true
            };
          }
        }
      }
      if (changed) {
        this.$http.put(this.imagoModel.host + '/api/carts/' + this.cart._id, this.cart);
      }
      return cb();
    };

    Calculation.prototype.calculate = function() {
      return this.checkStock((function(_this) {
        return function() {
          var i, item, len, ref;
          _this.costs = {
            subtotal: 0,
            shipping: 0,
            tax: 0,
            includedTax: 0,
            total: 0
          };
          ref = _this.cart.items;
          for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];
            if (item.price[_this.currency] && item.qty) {
              _this.costs.subtotal += item.qty * item.price[_this.currency];
            }
          }
          _this.costs.total = _this.costs.subtotal;
          return _this.$q.all([_this.calculateTax(), _this.calculateShipping()]).then(function() {
            if (_this.coupon) {
              _this.applyCoupon(_this.coupon, _this.costs);
            }
            return _this.calculateTotal();
          });
        };
      })(this));
    };

    Calculation.prototype.formatForm = function(form) {
      var ref, ref1;
      form.costs = angular.copy(this.costs);
      form.costs.shipping_options = angular.copy(this.shipping_options);
      form.costs.coupon = (this.coupon ? angular.copy(this.coupon) : null);
      form.shipping_address || (form.shipping_address = {});
      form.billing_address['phone'] = angular.copy(this.process.form.phone);
      form.shipping_address['phone'] = angular.copy(this.process.form.phone);
      form.fulfillmentcenter = angular.copy((ref = this.fcenter) != null ? ref._id : void 0);
      form.userData = {
        'browser': (ref1 = window.navigator) != null ? ref1.userAgent : void 0
      };
      if (!this.differentshipping) {
        form.shipping_address = angular.copy(this.process.form['billing_address']);
      }
      return form;
    };

    Calculation.prototype.submit = function() {
      var ref;
      this.process.form.items = angular.copy(this.cart.items);
      this.process.form.currency = angular.copy(this.currency);
      this.process.form.cartId = angular.copy(this.cart._id);
      this.process.form.billing_address.name = angular.copy((ref = this.process.form.user) != null ? ref.name : void 0);
      this.process.form = this.formatForm(this.process.form);
      return this.$http.post(this.imagoModel.host + '/api/checkout', this.process.form);
    };

    Calculation.prototype.saveCart = function(async) {
      var form, xhttp;
      form = angular.copy(this.cart);
      form.currency = this.currency;
      form.data = angular.copy(this.process.form);
      form.data.paymentType = angular.copy(this.paymentType);
      form.data.differentshipping = this.differentshipping;
      form.data = this.formatForm(form.data);
      if (async) {
        form = angular.toJson(form);
        xhttp = new XMLHttpRequest;
        xhttp.open('PUT', this.imagoModel.host + "/api/carts/" + this.cart._id, false);
        xhttp.setRequestHeader('Content-type', 'application/json');
        return xhttp.send(form);
      } else {
        return this.$http.put(this.imagoModel.host + '/api/carts/' + this.cart._id, form);
      }
    };

    return Calculation;

  })();

  angular.module('imago').service('calculation', ['$q', '$state', '$http', '$auth', 'imagoUtils', 'imagoModel', Calculation]);

}).call(this);

(function() {
  var Costs, CostsController;

  Costs = (function() {
    function Costs() {
      return {
        scope: {
          costs: '=',
          currency: '=',
          hideIfNotCountry: '=?'
        },
        templateUrl: '/imago/costs.html',
        controller: 'costsController as costs'
      };
    }

    return Costs;

  })();

  CostsController = (function() {
    function CostsController($scope, $element, $attrs) {
      if (!$attrs.hideIfNotCountry) {
        $scope.hideIfNotCountry = false;
        $scope.hideCountryDefined = true;
      } else if (!$scope.hideIfNotCountry) {
        $scope.$watch('hideIfNotCountry', function(value) {
          return $scope.hideCountryDefined = angular.isDefined(value);
        });
      }
    }

    return CostsController;

  })();

  angular.module('imago').directive('costs', [Costs]).controller('costsController', ['$scope', '$element', '$attrs', CostsController]);

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/costs.html','<table><tbody><tr><th>Subtotal</th><td><span ng-bind-html="currency | currencySymbol" class="currency"></span>{{ costs.subtotal | price }}</td></tr><tr ng-show="costs.discount"><th>Discount</th><td><span ng-bind-html="currency | currencySymbol" class="currency"></span>- {{ costs.discount | price }}</td></tr><tr ng-show="!hideIfNotCountry &amp;&amp; hideCountryDefined"><th>Shipping</th><td ng-show="costs.shipping"><span ng-bind-html="currency | currencySymbol" class="currency"></span>{{ costs.shipping | price }}</td><td ng-hide="costs.shipping">free</td></tr><tr ng-show="costs.includedTax &amp;&amp; !hideIfNotCountry &amp;&amp; hideCountryDefined"><th>Included Tax</th><td><span ng-bind-html="currency | currencySymbol" class="currency"></span>{{ costs.includedTax | price }}</td></tr><tr ng-show="!costs.includedTax &amp;&amp; !hideIfNotCountry &amp;&amp; hideCountryDefined"><th>Tax</th><td><span ng-bind-html="currency | currencySymbol" class="currency"></span>{{ costs.tax | price }}</td></tr><tr class="total"><th>Total</th><td><span ng-bind-html="currency | currencySymbol" class="currency"></span>{{ costs.total | price }}</td></tr></tbody></table>');}]);