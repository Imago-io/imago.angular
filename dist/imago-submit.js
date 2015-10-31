var imagoSubmit,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

imagoSubmit = (function() {
  function imagoSubmit($http, imagoUtils, imagoSettings) {
    return {
      getxsrf: function() {
        var url;
        url = imagoSettings.host + "/getxsrf";
        return $http.get(url);
      },
      formToJson: function(form) {
        var _message, defaultFields, key, obj, value;
        defaultFields = ['message', 'subscribe'];
        obj = {};
        _message = '';
        for (key in form) {
          value = form[key];
          if (indexOf.call(defaultFields, key) < 0) {
            _message += (imagoUtils.titleCase(key)) + ": " + value + "<br><br>";
          }
          obj[key] = value || '';
        }
        obj.message = _message + imagoUtils.replaceNewLines(obj.message || '');
        return angular.toJson(obj);
      },
      send: function(data) {
        var postUrl;
        postUrl = imagoSettings.host + "/api/contact";
        return $http.post(postUrl, this.formToJson(data)).then((function(_this) {
          return function(response) {
            console.log('success: ', response);
            return {
              status: true,
              message: ""
            };
          };
        })(this), function(error) {
          console.log('error: ', error);
          return {
            status: false,
            message: "could not connect to Server."
          };
        });
      }
    };
  }

  return imagoSubmit;

})();

angular.module('imago').service('imagoSubmit', ['$http', 'imagoUtils', 'imagoSettings', imagoSubmit]);
