(function() {
  var imagoPagerController, imagoPagerTest;

  imagoPagerController = (function() {
    function imagoPagerController($location) {
      console.log('query', this.query);
    }

    return imagoPagerController;

  })();

  imagoPagerTest = (function() {
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

  })();

  angular.module('imago').controller('imagoPagerController', ['$location', imagoPagerController]).component('imagoPagerTest', new imagoPagerTest());

}).call(this);

(function() {
  var imagoPager;

  imagoPager = (function() {
    function imagoPager(imagoUtils, imagoModel, $timeout, $state) {
      return {
        scope: {
          query: '@',
          posts: '=?',
          data: '=?',
          state: '@',
          prevPage: '&prev',
          nextPage: '&next',
          pageSize: '@',
          tags: '=?',
          currentPage: '=?',
          opts: '@',
          loaded: '=?'
        },
        restrict: 'E',
        templateUrl: function(element, attrs) {
          return attrs.templateUrl || '/imago/imago-pager.html';
        },
        link: function(scope, element, attrs) {
          var ref;
          if (!scope.state) {
            scope.state = ((ref = $state.current.data) != null ? ref.state : void 0) || _.head($state.current.name.split('.'));
          }
          scope.fetchPosts = function() {
            return $timeout(function() {
              var idx, query, ref1, ref2, ref3;
              scope.loaded = false;
              scope.count += 1;
              scope.posts = [];
              scope.pageSize = ((ref1 = $state.current.data) != null ? ref1.pageSize : void 0) || parseInt(scope.pageSize) || 10;
              scope.currentPage = $state.params.page || parseInt(scope.currentPage) || 1;
              if (!scope.state) {
                scope.state = ((ref2 = $state.current.data) != null ? ref2.state : void 0) || _.head($state.current.name.split('.'));
              }
              query = scope.query || attrs.path || ((ref3 = $state.current.data) != null ? ref3.query : void 0);
              if (_.includes(query, '{')) {
                query = scope.$eval(query);
              } else {
                query = {
                  path: $state.current.data.query
                };
              }
              if (scope.path) {
                query.path = scope.path;
              }
              query.page = scope.currentPage || 1;
              query.pagesize = scope.pageSize || $state.current.data.pageSize;
              if (scope.opts && _.includes(scope.opts, '{')) {
                scope.opts = scope.$eval(scope.opts);
              }
              scope.opts || (scope.opts = {});
              if ($state.params.tag || scope.tags) {
                query['tags'] = $state.params.tag || scope.tags;
                delete query.recursive;
              }
              if ((query != null ? query.path : void 0) && _.includes(query.path, '/page/')) {
                idx = query.path.indexOf('/page/');
                query.path = query.path.slice(0, idx);
              }
              if (angular.equals(scope.lastQuery, query)) {
                return;
              }
              scope.lastQuery = angular.copy(query);
              return imagoModel.getData(query).then((function(_this) {
                return function(response) {
                  var collection, data, i, j, k, len, ref4;
                  for (j = 0, len = response.length; j < len; j++) {
                    collection = response[j];
                    scope.next = collection.next;
                    if (scope.opts.shuffle) {
                      scope.posts = _.shuffle(collection.assets);
                    } else {
                      scope.posts = collection.assets;
                    }
                    data = angular.copy(collection);
                    delete data.assets;
                    scope.data = data;
                    scope.totalPages = Math.ceil(collection.count / scope.pageSize);
                    scope.pages = [];
                    for (i = k = 1, ref4 = scope.totalPages; 1 <= ref4 ? k < ref4 : k > ref4; i = 1 <= ref4 ? ++k : --k) {
                      scope.pages.push(i);
                    }
                    break;
                  }
                  return scope.loaded = true;
                };
              })(this));
            });
          };
          scope.changeState = function() {
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
            } else {
              return scope.changeState();
            }
          };
          scope.onNext = function() {
            scope.currentPage++;
            if (attrs.next) {
              return scope.nextPage();
            } else if (scope.state) {
              return scope.changeState();
            }
          };
          scope.$watchGroup(['currentPage', 'tags'], scope.fetchPosts);
          if (scope.state) {
            return scope.$on('$stateChangeSuccess', function(evt, current, params) {
              return scope.fetchPosts();
            });
          }
        }
      };
    }

    return imagoPager;

  })();

  angular.module('imago').directive('imagoPager', ['imagoUtils', 'imagoModel', '$timeout', '$state', imagoPager]);

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/imago-pager-test.html','<b>imago-pager-template 2</b><ng-outlet></ng-outlet><div class="imago-pager-content"><button ng-disabled="currentPage &lt;= 1" ng-click="onPrev()" class="prev">Previous</button><button ng-disabled="(currentPage &gt;= totalPages &amp;&amp; !next) || (posts.length &lt; pageSize &amp;&amp; !next) || !next" ng-click="onNext()" class="next">Next</button></div>');
$templateCache.put('/imago/imago-pager.html','<div ng-show="loaded" class="imago-pager-content"><button ng-disabled="currentPage &lt;= 1" ng-click="onPrev()" class="btn prev">Previous</button><button ng-disabled="(currentPage &gt;= totalPages &amp;&amp; !next) || (posts.length &lt; pageSize &amp;&amp; !next) || !next" ng-click="onNext()" class="btn next">Next</button></div>');}]);