class ImagoModal extends Directive

  constructor: ($document) ->

    return {

      restrict: 'E'
      scope: true
      transclude: true
      templateUrl: '/imago/imago-modal.html'
      controller: 'imagoModalController as modal'
      bindToController:
        active: '=?'
        position: '<?'
      link: (scope, element, attrs, ctrl, transclude) ->

        scope.fullwindow = if attrs.fullwindow is 'false' then false else true

        if scope.fullwindow
          scope.$watch 'modal.active', (value) ->
            if value
              return document.body.style.overflow = 'hidden'
            return document.body.style.overflow = ''

          disableOnEsc = (evt) ->
            return unless scope.modal.active
            scope.modal.disable() if evt.keyCode is 27
            scope.$digest()

          $document.on 'keydown', disableOnEsc

          scope.$on '$destroy', ->
            document.body.style.overflow = ''
            $document.off 'keydown', disableOnEsc
        else
          element.css({position: 'relative'})

    }

class imagoModalController extends Controller

  constructor: (@$rootScope, @$scope) ->

  activate: ->
    @active = true

  disable: ->
    @active = false
