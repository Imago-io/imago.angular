(function() {
  var ImagoContact, ImagoContactController;

  ImagoContact = (function() {
    function ImagoContact() {
      return {
        restrict: 'E',
        scope: {
          status: '=status',
          error: '=error'
        },
        controller: 'imagoContactController as contact',
        templateUrl: function(element, attrs) {
          return attrs.templateUrl || '/imago/imago-contact.html';
        }
      };
    }

    return ImagoContact;

  })();

  ImagoContactController = (function() {
    function ImagoContactController($scope, imagoSubmit) {
      this.data = {
        subscribe: false
      };
      this.submitForm = (function(_this) {
        return function(isValid) {
          if (!isValid) {
            return;
          }
          return imagoSubmit.send(_this.data).then(function(result) {
            $scope.status = _this.status = result.status;
            return $scope.message = _this.error = result.message || '';
          });
        };
      })(this);
      $scope.$on('$stateChangeSuccess', (function(_this) {
        return function(evt) {
          return _this.status = void 0;
        };
      })(this));
    }

    return ImagoContactController;

  })();

  angular.module('imago').directive('imagoContact', [ImagoContact]).controller('imagoContactController', ['$scope', 'imagoSubmit', ImagoContactController]);

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/imago-contact.html','<div class="imago-form-content"><form name="imagoContact" ng-submit="contact.submitForm(imagoContact.$valid)" novalidate="novalidate" ng-if="!contact.status"><div class="imago-field"><input type="text" name="name" id="name" ng-model="contact.data.name" placeholder="Name" required="required"/><label for="name">Name</label></div><div class="imago-field"><input type="email" name="email" id="email" ng-model="contact.data.email" placeholder="Email" required="required"/><label for="email">Email</label></div><div class="imago-field"><textarea name="message" id="message" ng-model="contact.data.message" placeholder="Your message." required="required" msd-elastic="\n"></textarea><label for="message">Message</label></div><div class="legal"><p>This form collects your name and email so that we can add you to our newsletter list for awesome project updates. Check out our privacy policy for the Tull story on how we protect and manage your submitted data!</p><div class="imago-field"><input type="checkbox" name="subscribe" id="subscribe" ng-model="contact.data.subscribe" required="required"/><label for="subscribe">I consent to having {{tenantSettings.settings.name}} collect my name and email</label></div></div><div class="imago-actions"><button type="submit" class="btn send">Send</button></div></form><div ng-switch="contact.status" class="messages"><div ng-switch-when="true" class="success"><span>Thank You!</span></div><div ng-switch-when="false" class="error"><span>Error: {{contact.error}}</span></div></div></div>');}]);