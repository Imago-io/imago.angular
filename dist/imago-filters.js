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
  var ImagoLinkify;

  ImagoLinkify = (function() {
    function ImagoLinkify() {
      return function(_str, type) {
        var _text;
        if (!_str || !type) {
          return;
        }
        _text = _str.replace(/(?:https?\:\/\/|www\.)+(?![^\s]*?")([\w.,@?!^=%&amp;:\/~+#-]*[\w@?!^=%&amp;\/~+#-])?/ig, function(url) {
          var anch, wrap;
          wrap = document.createElement('div');
          anch = document.createElement('a');
          anch.href = url;
          anch.target = '_blank';
          anch.innerHTML = url;
          wrap.appendChild(anch);
          return wrap.innerHTML;
        });
        if (!_text) {
          return '';
        }
        if (type === 'twitter') {
          _text = _text.replace(/(|\s)*@([\u00C0-\u1FFF\w]+)/g, '$1<a href="https://twitter.com/$2" target="_blank">@$2</a>');
          _text = _text.replace(/(^|\s)*#([\u00C0-\u1FFF\w]+)/g, '$1<a href="https://twitter.com/search?q=%23$2" target="_blank">#$2</a>');
        }
        if (type === 'instagram') {
          _text = _text.replace(/(|\s)*@([\u00C0-\u1FFF\w]+)/g, '$1<a href="https://instagram.com/$2" target="_blank">@$2</a>');
          _text = _text.replace(/(^|\s)*#([\u00C0-\u1FFF\w]+)/g, '$1<span class=\'hashtag\'>#$2</span>');
        }
        if (type === 'github') {
          _text = _text.replace(/(|\s)*@(\w+)/g, '$1<a href="https://github.com/$2" target="_blank">@$2</a>');
        }
        return _text;
      };
    }

    return ImagoLinkify;

  })();

  angular.module('imago').filter('imagoLinkify', [ImagoLinkify]);

}).call(this);

(function() {
  var Normalize;

  Normalize = (function() {
    function Normalize(imagoUtils) {
      return function(string) {
        if (!string) {
          return false;
        }
        return imagoUtils.normalize(string);
      };
    }

    return Normalize;

  })();

  angular.module('imago').filter('normalize', ['imagoUtils', Normalize]);

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
