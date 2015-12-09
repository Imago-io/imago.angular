class ImagoModal extends Directive

  constructor: ->

    return {

      scope:
        item: '='
        active: '='
      transclude: true
      templateUrl: '/imago/imago-modal.html'
      controller: 'imagoModalController as modal'
      bindToController: true
      link: (scope, element, attrs, ctrl, transclude) ->

        transclude scope, (clone) ->
          el = angular.element document.querySelector('.imago-modal .transclude')
          el.append(clone)

    }

class imagoModalController extends Controller

  constructor: (@$rootScope, @$scope) ->
    @active = false

    @$scope.$watch 'modal.active', (value) ->
      if value
        return document.body.style.overflow = 'hidden'
      return document.body.style.overflow = 'auto'

    @$rootScope.$on 'modal:item', (evt, item) =>
      @item = item
      @activate()

  activate: (item) ->
    @active = true

  disable: ->
    @item = null
    @active = false
