var imagoPager, imagoPagerController;

imagoPager = (function() {
  function imagoPager() {
    return {
      scope: {
        state: '@',
        posts: '=',
        prevPage: '&prev',
        nextPage: '&next',
        path: '@',
        pageSize: '@',
        tags: '=',
        currentPage: '=',
        shuffle: '='
      },
      controller: 'imagoPagerController as imagopager',
      bindToController: true,
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || '/imago/imago-pager.html';
      }
    };
  }

  return imagoPager;

})();

imagoPagerController = (function() {
  function imagoPagerController($scope, $attrs, imagoModel, $state) {
    this.fetchPosts = (function(_this) {
      return function() {
        var idx, query;
        _this.count += 1;
        _this.posts = [];
        _this.pageSize = parseInt(_this.pageSize) || 10;
        _this.currentPage = parseInt(_this.currentPage) || $state.params.page || 1;
        if (!_this.state) {
          _this.state = 'blog';
        }
        query = {
          path: _this.path,
          page: _this.currentPage,
          pagesize: _this.pageSize
        };
        if (_this.tags || $state.params.tag) {
          query['tags'] = _this.tags || $state.params.tag;
        }
        if ((query != null ? query.path : void 0) && _.includes(query.path, '/page/')) {
          idx = query.path.indexOf('/page/');
          query.path = query.path.slice(0, idx);
        }
        return imagoModel.getData([query], {
          localData: false
        }).then(function(response) {
          var collection, i, len, results;
          results = [];
          for (i = 0, len = response.length; i < len; i++) {
            collection = response[i];
            _this.next = collection.next;
            if (_this.shuffle === 'true') {
              _this.posts = _.shuffle(collection.assets);
            } else {
              _this.posts = collection.assets;
            }
            _this.totalPages = collection.count / _this.pageSize;
            break;
          }
          return results;
        });
      };
    })(this);
    this.prevState = function() {
      if ($state.params.tag) {
        return $state.go(this.state + ".filtered.paged", {
          'tag': $state.params.tag,
          'page': this.currentPage
        });
      } else if (this.state) {
        return $state.go(this.state + ".paged", {
          'page': this.currentPage
        });
      }
    };
    this.nextState = function() {
      if ($state.params.tag) {
        return $state.go(this.state + ".filtered.paged", {
          'tag': $state.params.tag,
          'page': this.currentPage
        });
      } else if (this.state) {
        return $state.go(this.state + ".paged", {
          'page': this.currentPage
        });
      }
    };
    this.onPrev = (function(_this) {
      return function() {
        _this.currentPage--;
        if ($attrs.prev) {
          return _this.prevPage();
        } else if (_this.state) {
          return _this.prevState();
        }
      };
    })(this);
    this.onNext = (function(_this) {
      return function() {
        _this.currentPage++;
        if ($attrs.next) {
          return _this.nextPage();
        } else if (_this.state) {
          return _this.nextState();
        }
      };
    })(this);
    $scope.$watchGroup(['imagopager.currentPage', 'imagopager.tags'], this.fetchPosts);
    if (this.state) {
      $scope.$on('$stateChangeSuccess', (function(_this) {
        return function(evt, current, params) {
          if (_this.state === current.name) {
            return _this.currentPage = 1;
          }
        };
      })(this));
    }
  }

  return imagoPagerController;

})();

angular.module('imago').directive('imagoPager', [imagoPager]).controller('imagoPagerController', ['$scope', '$attrs', 'imagoModel', '$state', imagoPagerController]);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-pager.html","<div class=\"pager\"><button ng-disabled=\"imagopager.currentPage &lt;= 1\" ng-click=\"imagopager.onPrev()\" class=\"prev\">Previous</button><button ng-disabled=\"(imagopager.currentPage &gt;= imagopager.totalPages &amp;&amp; !imagopager.next) || (imagopager.posts.length &lt; imagopager.pageSize &amp;&amp; !imagopager.next) || !imagopager.next\" ng-click=\"imagopager.onNext()\" class=\"next\">Next</button></div>");}]);