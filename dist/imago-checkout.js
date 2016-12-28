(function() {
  var AutocompleteGoogle;

  AutocompleteGoogle = (function() {
    function AutocompleteGoogle($parse, imagoUtils) {
      return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
          var autocomplete, place, viewValue;
          if (!(typeof google !== "undefined" && google !== null ? google.maps : void 0)) {
            return console.log('the google library is not loaded');
          }
          if (!attrs.autocompleteGoogle) {
            return console.log('you need a form to fill. Use the options attribute');
          }
          autocomplete = new google.maps.places.Autocomplete(element[0], {
            types: ['geocode']
          });
          google.maps.event.addDomListener(element[0], 'keydown', function(e) {
            if (e.keyCode === 13) {
              return e.preventDefault();
            }
          });
          viewValue = void 0;
          place = void 0;
          return google.maps.event.addListener(autocomplete, 'place_changed', function() {
            var componentConf, data, elem, form, i, label, len, ref, type, value;
            place = autocomplete.getPlace();
            if (!place.address_components) {
              return;
            }
            form = $parse(attrs.autocompleteGoogle)(scope);
            viewValue = place.name || modelCtrl.$viewValue;
            componentConf = {
              locality: {
                label: 'city',
                value: 'long_name'
              },
              administrative_area_level_1: {
                label: 'state',
                value: 'short_name'
              },
              country: {
                label: 'country',
                value: 'long_name'
              },
              postal_code: {
                label: 'zip',
                value: 'short_name'
              }
            };
            data = {};
            ref = place.address_components;
            for (i = 0, len = ref.length; i < len; i++) {
              elem = ref[i];
              type = elem.types[0];
              if (!componentConf[type]) {
                continue;
              }
              data[componentConf[type].label] = elem[componentConf[type].value] || '';
            }
            for (label in data) {
              value = data[label];
              form[label] = value;
            }
            if (attrs.autocompleteOnsuccess) {
              $parse(attrs.autocompleteOnsuccess)(scope);
            }
            return scope.$apply(function() {
              modelCtrl.$setViewValue(viewValue);
              return modelCtrl.$render();
            });
          });
        }
      };
    }

    return AutocompleteGoogle;

  })();

  angular.module('imago').directive('autocompleteGoogle', ['$parse', 'imagoUtils', AutocompleteGoogle]);

}).call(this);

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
      _.remove(this.cart.items, {
        _id: item._id
      });
      return this.updateCart();
    };

    Calculation.prototype.changeAddress = function(section, type) {
      var base, i, len, ref, ref1, ref2, ref3, ref4, sec;
      if (((ref = this.form['shipping_address']) != null ? ref.country : void 0) && this.differentshipping && type === 'country') {
        this.setCurrency(null, this.form['shipping_address'].country);
      } else if (type === 'country') {
        this.setCurrency(null, this.form[section].country);
      }
      ref1 = ['billing_address', 'shipping_address'];
      for (i = 0, len = ref1.length; i < len; i++) {
        sec = ref1[i];
        this[sec] || (this[sec] = {});
        (base = this.form)[sec] || (base[sec] = {});
        if ((ref2 = this.form[sec].country) === 'United States of America' || ref2 === 'United States' || ref2 === 'USA' || ref2 === 'Canada' || ref2 === 'Australia') {
          this[sec].disablestates = false;
          if ((ref3 = this.form[sec].country) === 'United States of America' || ref3 === 'United States' || ref3 === 'USA') {
            this[sec].states = this.imagoUtils.STATES['USA'];
          } else {
            this[sec].states = this.imagoUtils.STATES[this.form[sec].country.toUpperCase()];
          }
        } else {
          this[sec].disablestates = true;
          this[sec].states = [];
        }
        this.form[sec].country_code = this.imagoUtils.CODES[this.form[sec].country];
      }
      if (((ref4 = this.form['shipping_address']) != null ? ref4.country : void 0) && this.differentshipping) {
        this.country = this.form['shipping_address'].country;
        this.state = this.form['shipping_address'].state;
        this.zip = this.form['shipping_address'].zip;
      } else {
        this.country = this.form[section].country;
        this.state = this.form[section].state;
        this.zip = this.form[section].zip;
      }
      return this.calculate();
    };

    Calculation.prototype.checkCoupon = function(code) {
      var ref, ref1, url;
      if (!code) {
        this.coupon = null;
        this.couponState = null;
        this.calculate();
        return;
      }
      url = this.imagoModel.host + "/api/coupons?code=" + code;
      if ((ref = this.form) != null ? (ref1 = ref.user) != null ? ref1.email : void 0 : void 0) {
        url += "&email=" + this.form.user.email;
      }
      return this.$http.get(url).then((function(_this) {
        return function(response) {
          if (response.data.length === 1) {
            _this.coupon = _.head(response.data);
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
      var ids, meta, percentvalue, ref, value;
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
        ids = meta.shippingMethods || [];
        if (meta.limitByShippings && (ref = this.shipping_options._id.toString(), indexOf.call(ids, ref) >= 0)) {
          return costs.shipping = 0;
        } else if (!meta.limitByShippings) {
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
            var ref, ref1;
            return ((ref = a.ranges[0].price) != null ? ref[_this.currency] : void 0) - ((ref1 = b.ranges[0].price) != null ? ref1[_this.currency] : void 0);
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
      return this.$q((function(_this) {
        return function(resolve, reject) {
          if (_this.calculateShippingRunning) {
            return reject();
          }
          _this.calculateShippingRunning = true;
          _this.costs.shipping = 0;
          return _this.getShippingRate().then(function(rates) {
            var i, len, rate, results;
            _this.calculateShippingRunning = false;
            if (!(rates != null ? rates.length : void 0)) {
              _this.shipping_options = void 0;
              _this.shippingRates = [];
              if (_this.country) {
                _this.error.noshippingrule = true;
              }
              return resolve();
            }
            _this.error.noshippingrule = false;
            results = [];
            for (i = 0, len = rates.length; i < len; i++) {
              rate = rates[i];
              results.push(_this.calcShipping(rate).then(function(response) {
                var rateFix, ref, shipping;
                if (_this.shipping_options && _this.shipping_options._id === response.rate._id) {
                  _this.costs.shipping = response.shipping;
                  resolve();
                } else if (!_this.shipping_options || _.difference(_this.shippingRates, rates).length) {
                  _this.setShippingRates(rates);
                  _this.costs.shipping = response.shipping;
                  resolve();
                }
                if (!((ref = _this.shippingRates) != null ? ref.length : void 0)) {
                  return;
                }
                rateFix = (response.shipping / 100).toFixed(2);
                shipping = _.find(_this.shippingRates, {
                  '_id': response.rate._id
                });
                return shipping.nameprice = shipping.name + " (" + _this.currency + " " + rateFix + ")";
              }));
            }
            return results;
          });
        };
      })(this));
    };

    Calculation.prototype.calcShipping = function(rate) {
      return this.$q((function(_this) {
        return function(resolve, reject) {
          var count, i, item, j, len, len1, range, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, shipping, with_shippingcost;
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
            shipping = (ref5 = range.price) != null ? ref5[_this.currency] : void 0;
          }
          for (j = 0, len1 = with_shippingcost.length; j < len1; j++) {
            item = with_shippingcost[j];
            shipping += (((ref6 = item.fields.overwriteShippingCosts) != null ? (ref7 = ref6.value) != null ? ref7[_this.currency] : void 0 : void 0) || 0) * item.qty;
          }
          return resolve({
            'shipping': shipping,
            'rate': rate
          });
        };
      })(this));
    };

    Calculation.prototype.calculateTax = function() {
      return this.getTaxRate().then((function(_this) {
        return function() {
          var i, item, j, len, len1, onepercent, ref, ref1, ref2, ref3, ref4, taxableSubtotal;
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
              return;
            } else {
              return;
            }
          } else {
            taxableSubtotal = 0;
            ref2 = _this.cart.items;
            for (j = 0, len1 = ref2.length; j < len1; j++) {
              item = ref2[j];
              if (!((ref3 = item.fields.calculateTaxes) != null ? ref3.value : void 0)) {
                continue;
              }
              if (item.price[_this.currency]) {
                taxableSubtotal += Math.round(item.price[_this.currency] * item.qty);
              }
            }
            if (((ref4 = _this.coupon) != null ? ref4.meta.type : void 0) === 'percent' && _this.coupon.meta.value) {
              taxableSubtotal = taxableSubtotal - (taxableSubtotal * _this.coupon.meta.value / 100);
            }
            _this.costs.tax = Math.round(taxableSubtotal * _this.costs.taxRate);
          }
          return _this.costs.tax;
        };
      })(this));
    };

    Calculation.prototype.getTaxRate = function() {
      return this.$q((function(_this) {
        return function(resolve) {
          var tRate;
          _this.costs.taxRate = 0;
          if (!_this.country) {
            return resolve();
          }
          tRate = _this.findTaxRate();
          if (tRate.autotax && _this.imagoUtils.inUsa(_this.country)) {
            _this.getZipTax().then(function() {
              return resolve();
            });
            return;
          }
          _this.costs.taxRate = tRate.rate / 100;
          return resolve();
        };
      })(this));
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
        return function(rate) {
          var c, ref1, ref2;
          return rate.active && (ref1 = (ref2 = _this.country) != null ? ref2.toUpperCase() : void 0, indexOf.call((function() {
            var i, len, ref3, results;
            ref3 = rate.countries;
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
          return function(rate) {
            return rate.active && !rate.countries.length;
          };
        })(this));
      }
      if (this.state) {
        rate = _.find(rates_by_country, (function(_this) {
          return function(rate) {
            var ref1, s;
            return ref1 = _this.state.toUpperCase(), indexOf.call((function() {
              var i, len, ref2, results;
              ref2 = rate.states;
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
        rates = _.filter(rates_by_country, function(rate) {
          return rate.states.length === 0;
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
      return this.$q((function(_this) {
        return function(resolve) {
          var ref;
          if (!(_this.zip || (((ref = _this.zip) != null ? ref.length : void 0) > 4))) {
            return resolve();
          } else {
            return _this.$http.get(_this.imagoModel.host + "/api/ziptax?zipcode=" + _this.zip).then(function(response) {
              _this.costs.taxRate = response.data.taxUse;
              return resolve();
            });
          }
        };
      })(this));
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
      var changed, i, item, len, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, stock;
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
      if ((ref = this.cart.items) != null ? ref.length : void 0) {
        ref1 = this.cart.items;
        for (i = 0, len = ref1.length; i < len; i++) {
          item = ref1[i];
          stock = !_.isUndefined((ref2 = item.fields.stock) != null ? (ref3 = ref2.value) != null ? ref3[this.fcenter._id] : void 0 : void 0) ? (ref4 = item.fields.stock) != null ? (ref5 = ref4.value) != null ? ref5[this.fcenter._id] : void 0 : void 0 : 100000;
          if (parseInt(stock) < item.qty && !((ref6 = item.fields) != null ? (ref7 = ref6.presale) != null ? ref7.value : void 0 : void 0)) {
            item.qty = _.max([stock, 0]);
            changed = true;
            if (stock !== 0) {
              this.cartError[item._id] = {
                'maxStock': true
              };
            }
            if (stock <= 0) {
              this.cartError[item._id] = {
                'noStock': true
              };
            }
          }
        }
        if (changed) {
          this.$http.put(this.imagoModel.host + '/api/carts/' + this.cart._id, this.cart);
        }
      }
      return cb();
    };

    Calculation.prototype.calculate = function() {
      return this.checkStock((function(_this) {
        return function() {
          var i, item, len, ref, ref1;
          _this.costs = {
            subtotal: 0,
            shipping: 0,
            tax: 0,
            includedTax: 0,
            total: 0
          };
          if ((ref = _this.cart.items) != null ? ref.length : void 0) {
            ref1 = _this.cart.items;
            for (i = 0, len = ref1.length; i < len; i++) {
              item = ref1[i];
              if (item.price[_this.currency] && item.qty) {
                _this.costs.subtotal += item.qty * item.price[_this.currency];
              }
            }
            _this.costs.total = _this.costs.subtotal;
          }
          return _this.$q.all([_this.calculateTax(), _this.calculateShipping()]).then(function() {
            if (_this.coupon) {
              _this.applyCoupon(_this.coupon, _this.costs);
            }
            _this.calculateTotal();
            return _this.finalCosts = angular.copy(_this.costs);
          });
        };
      })(this));
    };

    Calculation.prototype.formatForm = function(form) {
      var ref, ref1;
      form.costs = angular.copy(this.costs);
      form.costs.shipping_options = angular.copy(this.shipping_options);
      form.costs.coupon = angular.copy(this.coupon) || null;
      form.shipping_address || (form.shipping_address = {});
      form.billing_address['phone'] = angular.copy(this.form.phone);
      form.shipping_address['phone'] = angular.copy(this.form.phone);
      form.fulfillmentcenter = angular.copy((ref = this.fcenter) != null ? ref._id : void 0);
      form.userData = {
        'browser': (ref1 = window.navigator) != null ? ref1.userAgent : void 0
      };
      if (!this.differentshipping) {
        form.shipping_address = angular.copy(this.form['billing_address']);
      }
      return form;
    };

    Calculation.prototype.submit = function() {
      var ref;
      this.form.items = angular.copy(this.cart.items);
      this.form.currency = angular.copy(this.currency);
      this.form.cartId = angular.copy(this.cart._id);
      this.form.billing_address.name = angular.copy((ref = this.form.user) != null ? ref.name : void 0);
      this.form = this.formatForm(this.form);
      return this.$http.post(this.imagoModel.host + "/api/checkout", this.form);
    };

    Calculation.prototype.saveCart = function(async) {
      var form, xhttp;
      form = angular.copy(this.cart);
      form.currency = this.currency;
      form.data = angular.copy(this.form);
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