(function() {
  var imagoContact, imagoContactController;

  imagoContact = (function() {
    function imagoContact() {
      return {
        restrict: 'E',
        scope: {},
        controller: 'imagoContactController as contact',
        templateUrl: function(element, attrs) {
          return attrs.templateUrl || '/imago/imago-contact.html';
        }
      };
    }

    return imagoContact;

  })();

  imagoContactController = (function() {
    function imagoContactController(imagoSubmit) {
      this.data = {
        subscribe: true
      };
      this.submitForm = (function(_this) {
        return function(isValid) {
          if (!isValid) {
            return;
          }
          return imagoSubmit.send(_this.data).then(function(result) {
            _this.status = result.status;
            return _this.error = result.message || '';
          });
        };
      })(this);
    }

    return imagoContactController;

  })();

  angular.module('imago').directive('imagoContact', [imagoContact]).controller('imagoContactController', ['imagoSubmit', imagoContactController]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-contact.html","<div class=\"imago-form-container\"><form name=\"imagoContact\" ng-submit=\"contact.submitForm(imagoContact.$valid)\" novalidate=\"novalidate\" ng-if=\"!contact.status\"><div class=\"imago-field\"><label for=\"name\">Name</label><input type=\"text\" name=\"name\" id=\"name\" ng-model=\"contact.data.name\" placeholder=\"Name\" required=\"required\"/></div><div class=\"imago-field\"><label for=\"email\">Email</label><input type=\"email\" name=\"email\" id=\"email\" ng-model=\"contact.data.email\" placeholder=\"Email\" required=\"required\"/></div><div class=\"imago-field\"><label for=\"message\">Message</label><textarea name=\"message\" id=\"message\" ng-model=\"contact.data.message\" placeholder=\"Your message.\" required=\"required\"></textarea></div><div class=\"imago-checkbox\"><input type=\"checkbox\" name=\"subscribe\" id=\"subscribe\" ng-model=\"contact.data.subscribe\" checked=\"checked\"/><label for=\"subscribe\">Subscribe</label></div><div class=\"formcontrols\"><button type=\"submit\" ng-disabled=\"imagoContact.$invalid\" class=\"send\">Send</button></div></form><div ng-switch=\"contact.status\" class=\"messages\"><div ng-switch-when=\"true\" class=\"sucess\"><span>Thank You!</span></div><div ng-switch-when=\"false\" class=\"error\"><span>Error: {{contact.error}}</span></div></div></div>");}]);