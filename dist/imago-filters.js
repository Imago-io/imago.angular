(function() {
  var CurrencySymbol;

  CurrencySymbol = (function() {
    function CurrencySymbol(imagoUtils) {
      return function(currency) {
        if (!currency) {
          return;
        }
        return imagoUtils.getCurrencySymbol(currency);
      };
    }

    return CurrencySymbol;

  })();

  angular.module('imago').filter('currencySymbol', ['imagoUtils', CurrencySymbol]);

}).call(this);

(function() {
  var Normalize;

  Normalize = (function() {
    function Normalize() {
      return function(string) {
        if (!string) {
          return false;
        }
        return _.kebabCase(string);
      };
    }

    return Normalize;

  })();

  angular.module('imago').filter('normalize', [Normalize]);

}).call(this);

(function() {
  var Price;

  Price = (function() {
    function Price(imagoUtils) {
      return function(price, decimal) {
        var dec, format, thousand;
        if (decimal == null) {
          decimal = 2;
        }
        if (_.isUndefined(price)) {
          return;
        }
        format = 1000.5.toLocaleString();
        price = Number(price) / 100;
        dec = format.charAt(5);
        thousand = format.charAt(1);
        if (dec !== '.' && dec !== ',') {
          return price;
        }
        return imagoUtils.formatCurrency(price, decimal, dec, thousand);
      };
    }

    return Price;

  })();

  angular.module('imago').filter('price', ['imagoUtils', Price]);

}).call(this);

(function() {
  var TagFilter,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  TagFilter = (function() {
    function TagFilter(imagoUtils) {
      return function(input, tag) {
        var asset, filtered, i, j, len, len1, normtags, ref, t, tags;
        if (!input) {
          return;
        }
        if (tag) {
          filtered = [];
          for (i = 0, len = input.length; i < len; i++) {
            asset = input[i];
            tags = imagoUtils.getMeta(asset, 'tags');
            normtags = [];
            for (j = 0, len1 = tags.length; j < len1; j++) {
              t = tags[j];
              normtags.push(_.kebabCase(t));
            }
            if (normtags && (ref = _.kebabCase(tag), indexOf.call(normtags, ref) >= 0)) {
              filtered.push(asset);
            }
          }
          return filtered;
        } else {
          return input;
        }
      };
    }

    return TagFilter;

  })();

  angular.module('imago').filter('tagFilter', ['imagoUtils', TagFilter]);

}).call(this);
