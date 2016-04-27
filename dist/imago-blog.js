(function() {
  var imagoPagerController, imagoPagerTest,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  imagoPagerController = (function() {
    function imagoPagerController($location) {
      console.log('query', this.query);
    }

    return imagoPagerController;

  })();

  imagoPagerTest = (function(superClass) {
    extend(imagoPagerTest, superClass);

    function imagoPagerTest() {
      return {
        bindings: {
          query: '@',
          posts: '=',
          state: '@',
          prevPage: '&prev',
          nextPage: '&next',
          pageSize: '@',
          tags: '=?',
          currentPage: '=?',
          opts: '@'
        },
        controller: 'imagoPagerController as imagopager',
        templateUrl: function($attrs) {
          return $attrs.templateUrl || '/imago/imago-pager-test.html';
        },
        $routeConfig: [
          {
            path: '/',
            name: 'imagoPagerBase',
            useAsDefault: true
          }, {
            path: '/page/:page',
            name: 'imagoPagerPage'
          }, {
            path: '/tags/:tag',
            name: 'imagoPagerFiltered'
          }, {
            path: '/tags/:tag/page/:page',
            name: 'imagoPagerFilteredPage'
          }
        ]
      };
    }

    return imagoPagerTest;

  })(Component);

  angular.module('imago').controller('imagoPagerController', ['$location', imagoPagerController]);

}).call(this);

(function() {
  var imagoPager;

  imagoPager = (function() {
    function imagoPager(imagoModel, $state) {
      return {
        scope: {
          query: '@',
          posts: '=',
          state: '@',
          prevPage: '&prev',
          nextPage: '&next',
          pageSize: '@',
          tags: '=?',
          currentPage: '=?',
          opts: '@'
        },
        restrict: 'E',
        templateUrl: function(element, attrs) {
          return attrs.templateUrl || '/imago/imago-pager.html';
        },
        link: function(scope, element, attrs) {
          scope.fetchPosts = function() {
            var idx, query, ref, ref1, ref2;
            scope.loaded = false;
            scope.count += 1;
            scope.posts = [];
            scope.pageSize = ((ref = $state.current.data) != null ? ref.pageSize : void 0) || parseInt(scope.pageSize) || 10;
            scope.currentPage = $state.params.page || parseInt(scope.currentPage) || 1;
            if (!scope.state) {
              scope.state = ((ref1 = $state.current.data) != null ? ref1.state : void 0) || _.head($state.current.name.split('.'));
            }
            query = scope.query || attrs.path || ((ref2 = $state.current.data) != null ? ref2.query : void 0);
            if (_.includes(query, '{')) {
              query = scope.$eval(query);
            } else {
              query = {
                path: query
              };
            }
            query.page = scope.currentPage;
            query.pagesize = scope.pageSize;
            if (scope.opts && _.includes(scope.opts, '{')) {
              scope.opts = scope.$eval(scope.opts);
            }
            scope.opts || (scope.opts = {});
            if ($state.params.tag || scope.tags) {
              query['tags'] = $state.params.tag || scope.tags;
            }
            if ((query != null ? query.path : void 0) && _.includes(query.path, '/page/')) {
              idx = query.path.indexOf('/page/');
              query.path = query.path.slice(0, idx);
            }
            return imagoModel.getData(query).then((function(_this) {
              return function(response) {
                var collection, i, len;
                for (i = 0, len = response.length; i < len; i++) {
                  collection = response[i];
                  scope.next = collection.next;
                  if (scope.opts.shuffle) {
                    scope.posts = _.shuffle(collection.assets);
                  } else {
                    scope.posts = collection.assets;
                  }
                  scope.totalPages = collection.count / scope.pageSize;
                  break;
                }
                return scope.loaded = true;
              };
            })(this));
          };
          scope.prevState = function() {
            if ($state.params.tag) {
              return $state.go(scope.state + ".filtered.paged", {
                'tag': $state.params.tag,
                'page': scope.currentPage
              });
            } else if (scope.state) {
              return $state.go(scope.state + ".paged", {
                'page': scope.currentPage
              });
            }
          };
          scope.nextState = function() {
            if ($state.params.tag) {
              return $state.go(scope.state + ".filtered.paged", {
                'tag': $state.params.tag,
                'page': scope.currentPage
              });
            } else if (scope.state) {
              return $state.go(scope.state + ".paged", {
                'page': scope.currentPage
              });
            }
          };
          scope.onPrev = function() {
            scope.currentPage--;
            if (attrs.prev) {
              return scope.prevPage();
            } else if (scope.state) {
              return scope.prevState();
            }
          };
          scope.onNext = function() {
            scope.currentPage++;
            if (attrs.next) {
              return scope.nextPage();
            } else if (scope.state) {
              return scope.nextState();
            }
          };
          scope.$watchGroup(['currentPage', 'tags'], scope.fetchPosts);
          if (scope.state) {
            return scope.$on('$stateChangeSuccess', function(evt, current, params) {
              if (scope.state === current.name) {
                return scope.currentPage = 1;
              }
            });
          }
        }
      };
    }

    return imagoPager;

  })();

  angular.module('imago').directive('imagoPager', ['imagoModel', '$state', imagoPager]);

}).call(this);

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/imago-pager-test.html","<b>imago-pager-template 2</b><ng-outlet></ng-outlet><div class=\"imago-pager-content\"><button ng-disabled=\"currentPage &lt;= 1\" ng-click=\"onPrev()\" class=\"prev\">Previous</button><button ng-disabled=\"(currentPage &gt;= totalPages &amp;&amp; !next) || (posts.length &lt; pageSize &amp;&amp; !next) || !next\" ng-click=\"onNext()\" class=\"next\">Next</button></div>");
$templateCache.put("/imago/imago-pager.html","<div ng-show=\"loaded\" class=\"imago-pager-content\"><button ng-disabled=\"currentPage &lt;= 1\" ng-click=\"onPrev()\" class=\"prev\">Previous</button><button ng-disabled=\"(currentPage &gt;= totalPages &amp;&amp; !next) || (posts.length &lt; pageSize &amp;&amp; !next) || !next\" ng-click=\"onNext()\" class=\"next\">Next</button></div>");}]);