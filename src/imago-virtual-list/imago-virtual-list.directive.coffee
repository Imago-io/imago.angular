class ImagoVirtualList extends Directive

  constructor: ($window, $document, $rootScope, $timeout) ->

    return {

      scope: true
      templateUrl: '/imago/imago-virtual-list.html'
      transclude: true
      controller: -> return
      controllerAs: 'imagovirtuallist'
      bindToController:
        data: '='
        onBottom: '&'
        scroll: '='
        offsetBottom: '@'

      link: (scope, element, attrs, ctrl, transclude) ->

        transclude scope, (clone) ->
          element.children().append clone

        self = {}
        self.scrollTop = 0

        scope.imagovirtuallist.offsetBottom = $window.innerHeight unless scope.imagovirtuallist.offsetBottom

        masterDiv = document.createElement 'div'
        masterDiv.id = 'master-item'
        masterDiv.className = attrs.classItem
        masterDiv.style.opacity = 0
        masterDiv.style.zIndex = -1
        element.append masterDiv

        scope.init = ->
          return if @initRunning
          @initRunning = true
          scope.visibleProvider = []
          $timeout =>
            self.itemsPerRow = Math.floor(element[0].clientWidth / masterDiv.clientWidth)
            cellsPerHeight = Math.round($window.innerHeight / masterDiv.clientHeight)
            self.cellsPerPage = cellsPerHeight * self.itemsPerRow
            self.numberOfCells = 3 * self.cellsPerPage
            if self.itemsPerRow > 1
              self.canvasWidth = self.itemsPerRow * masterDiv.clientWidth
            self.updateData()
            @initRunning = false
          , 100

        self.updateData = ->
          return unless scope.imagovirtuallist.data
          self.canvasHeight = Math.ceil(scope.imagovirtuallist.data.length / self.itemsPerRow) * masterDiv.clientHeight
          scope.canvasStyle = height: "#{self.canvasHeight}px", width: "#{self.canvasWidth}px"
          self.updateDisplayList()

        self.updateDisplayList = ->
          firstCell = Math.max(Math.round(self.scrollTop / masterDiv.clientHeight) - (Math.round($window.innerHeight / masterDiv.clientHeight)), 0)
          cellsToCreate = Math.min(firstCell + self.numberOfCells, self.numberOfCells)
          data = firstCell * self.itemsPerRow
          scope.visibleProvider = scope.imagovirtuallist.data.slice(data, data + cellsToCreate)
          chunks = _.chunk(scope.visibleProvider, self.itemsPerRow)
          i = 0
          l = scope.visibleProvider.length
          while i < l
            findIndex = ->
              for chunk, indexChunk in chunks
                for item, indexItem in chunk
                  continue unless item.id is scope.visibleProvider[i].id
                  idx =
                    chunk  : indexChunk
                    inside : indexItem
                  return idx

            idx = findIndex()
            # scope.visibleProvider[i].styles = 'transform': "translate3d(#{(masterDiv.clientWidth * idx.inside) + 'px'}, #{(firstCell + idx.chunk) * masterDiv.clientHeight + 'px'}, 0)"
            scope.visibleProvider[i].styles = 'transform': "translate(#{(masterDiv.clientWidth * idx.inside) + 'px'}, #{(firstCell + idx.chunk) * masterDiv.clientHeight + 'px'})"
            i++
          scope.scroll() if scope.imagovirtuallist.scroll

        scope.scroll = ->
          return unless scope.imagovirtuallist.scroll
          $timeout ->
            self.scrollTop = angular.copy scope.imagovirtuallist.scroll
            scope.imagovirtuallist.scroll = 0
            $document.scrollTop(self.scrollTop, 0)

        scope.onScroll = ->
          self.scrollTop = $window.scrollY
          if (self.canvasHeight - self.scrollTop) <= Number(scope.imagovirtuallist.offsetBottom)
            scope.imagovirtuallist.onBottom()
          self.updateDisplayList()
          scope.$digest()

        scope.init()

        scope.$watch 'imagovirtuallist.data', (value) ->
          self.updateData()

        angular.element($window).on 'resize', =>
          if Math.floor(element[0].clientWidth / masterDiv.clientWidth) isnt self.itemsPerRow
            scope.init()

        angular.element($window).on 'scroll', scope.onScroll

        watchers = []

        watchers.push $rootScope.$on 'imagovirtuallist:init', ->
          scope.init()

        scope.$on '$destroy', ->
          angular.element($window).off 'scroll', scope.onScroll
          for watcher in watchers
            watcher()

    }
