(function() {
  var App, imagoLoad;

  App = (function() {
    function App() {
      return ['lodash'];
    }

    return App;

  })();

  imagoLoad = (function() {
    function imagoLoad($window, $http) {
      if ($window.imagoSettings) {
        $http.defaults.headers.common.Authorization = "Basic " + $window.imagoSettings.apikey + ":";
      }
    }

    return imagoLoad;

  })();

  angular.module('imago', new App()).run(['$window', '$http', imagoLoad]);

}).call(this);

(function() {
  angular.module('lodash', []).factory('_', function() {
    return window._();
  });

}).call(this);

(function() {
  var HttpInterceptor;

  HttpInterceptor = (function() {
    function HttpInterceptor($q, $log, $injector) {
      return {
        requestError: function(rejection) {
          $log.error(angular.toJson(rejection));
          return $q.reject(rejection);
        },
        responseError: function(rejection) {
          var $state;
          $state = $injector.get('$state');
          console.log('rejection.status', rejection.status);
          switch (rejection.status) {
            case 401:
              return $state.go('home');
            case 404:
              return $state.go('page-not-found');
          }
        }
      };
    }

    return HttpInterceptor;

  })();

  angular.module('imago').factory('httpInterceptor', ['$q', '$log', '$injector', HttpInterceptor]);

}).call(this);

(function() {
  var ImagoChecktarget;

  ImagoChecktarget = (function() {
    function ImagoChecktarget() {
      return {
        link: function(scope, element, attrs) {
          var ref;
          if (!((ref = attrs.ngHref) != null ? ref.match('^/') : void 0)) {
            return element.attr('target', '_blank');
          }
        }
      };
    }

    return ImagoChecktarget;

  })();

  angular.module('imago').directive('imagoChecktarget', [ImagoChecktarget]);

}).call(this);

(function() {
  var imagoModel;

  imagoModel = (function() {
    function imagoModel() {
      var config, host, indexRange, nextClient, sortWorker;
      sortWorker = 'sort.worker.js';
      host = (typeof window !== "undefined" && window !== null ? window.debug : void 0) ? 'http://api.imago.dev' : 'https://api.imago.io';
      nextClient = 'public';
      indexRange = 10000;
      config = {
        updatePageTitle: true
      };
      this.setSortWorker = function(value) {
        return sortWorker = value;
      };
      this.setIndexRange = function(value) {
        return indexRange = value;
      };
      this.getHost = function() {
        return host;
      };
      this.setHost = function(value) {
        return host = value;
      };
      this.setClient = function(value) {
        return nextClient = value;
      };
      this.getDefaults = function() {
        return results;
      };
      this.setDefaults = function(value) {
        if (!_.isPlainObject(value)) {
          throw 'defaults needs to be an object';
        }
        return _.assign(config, value);
      };
      this.$get = function($rootScope, $http, $location, $document, $window, $q, imagoUtils, imagoWorker) {
        $http.defaults.headers.common['NexClient'] = nextClient;
        return {
          host: host,
          sortWorker: sortWorker,
          indexRange: indexRange,
          nextClient: nextClient,
          assets: {
            get: function(id) {
              return $http.get(host + "/api/assets/" + id);
            },
            create: function(assets) {
              var j, len, list, promises, request;
              promises = [];
              list = _.chunk(assets, 25);
              for (j = 0, len = list.length; j < len; j++) {
                request = list[j];
                promises.push($http.post(host + "/api/assets", request).then(function(response) {
                  return response.data.data;
                }));
              }
              return $q.all(promises).then(function(response) {
                return _.flatten(response);
              });
            },
            update: function(item) {
              return $http.put(host + "/api/assets/" + item._id, item);
            },
            "delete": function(id) {
              return $http["delete"](host + "/api/assets/" + id);
            },
            trash: function(assets) {
              return $http.post(host + "/api/assets/trash", assets);
            },
            move: function(items, src, dest) {
              var data;
              data = {
                src: src,
                dest: dest,
                items: items
              };
              return $http.post(host + "/api/assets/move", data);
            },
            copy: function(items, src, dest) {
              var data;
              data = {
                src: src,
                dest: dest,
                items: items
              };
              return $http.post(host + "/api/assets/copy", data);
            },
            batch: function(list) {
              var item, j, k, len, len1, promises, ref, ref1, request;
              for (j = 0, len = list.length; j < len; j++) {
                item = list[j];
                if (!((ref = item.types) != null ? ref.length : void 0)) {
                  if ((ref1 = $window.trackJs) != null) {
                    ref1.track("Tried to save without types - data: " + (JSON.stringify(item)));
                  }
                  $rootScope.generalError = true;
                  return;
                }
              }
              promises = [];
              list = _.chunk(list, 100);
              for (k = 0, len1 = list.length; k < len1; k++) {
                request = list[k];
                promises.push($http.put(host + "/api/assets/update", {
                  assets: request
                }));
              }
              return $q.all(promises);
            },
            download: function(ids, res) {
              return $http.post(host + "/api/assets/download", {
                assets: ids,
                resolution: res
              });
            },
            pdfRequest: function(data) {
              return $http.post(host + "/api/assets/pdf", data);
            },
            spreadRequest: function(data) {
              return $http.post(host + "/api/assets/spread", data);
            },
            transformRequest: function(data) {
              return $http.post(host + "/api/assets/transform", data);
            },
            repair: function(id) {
              var ref;
              if ((ref = $window.trackJs) != null) {
                ref.track("Repair assets order - id: " + id);
              }
              return $http.put(host + "/api/assets/repairorder", {
                _id: id
              });
            }
          },
          data: [],
          currentCollection: void 0,
          search: function(query) {
            var params;
            params = _.map(query, this.formatQuery);
            if (!params.length) {
              return $q.resolve();
            }
            return $http.post(host + "/api/search", angular.toJson(params));
          },
          getLocalData: function(query, options) {
            if (options == null) {
              options = {};
            }
            return $q((function(_this) {
              return function(resolve, reject) {
                var asset, item, j, key, len, localQuery, path, ref, value;
                for (key in options) {
                  value = options[key];
                  if (key === 'localData' && value === false) {
                    return reject(query);
                  }
                }
                for (key in query) {
                  value = query[key];
                  if (key === 'fts' || key === 'page' || key === 'pagesize') {
                    return reject(query);
                  } else if (key === 'collection') {
                    query = imagoUtils.renameKey('collection', 'path', query);
                    path = value;
                  } else if (key === 'kind') {
                    query = imagoUtils.renameKey('kind', 'type', query);
                  } else if (key === 'metakind') {
                    query = imagoUtils.renameKey('metakind', 'type', query);
                  } else if (key === 'path') {
                    path = value;
                  }
                }
                if ((path != null ? path.slice(-1) : void 0) === '/' && path.length > 1) {
                  path = path.substring(0, path.length - 1);
                }
                if (!path) {
                  return reject(query);
                }
                localQuery = {
                  'path': _.isString(path) ? path : _.head(path)
                };
                asset = _this.find(localQuery);
                if (!asset) {
                  return reject(query);
                }
                asset.assets = _this.findChildren(asset);
                if ((asset.count || asset.assets.length) || !asset.count) {
                  if (asset.assets.length !== asset.count || !asset.count) {
                    return reject(query);
                  } else {
                    if (query.recursive) {
                      ref = asset.assets;
                      for (j = 0, len = ref.length; j < len; j++) {
                        item = ref[j];
                        if (item.assets.length !== item.count) {
                          return reject(query);
                        }
                      }
                    }
                    asset.assets = _this.filterAssets(asset.assets, query);
                    if (asset.assets.length !== asset.count) {
                      return reject(query);
                    }
                    return resolve(asset);
                  }
                } else {
                  console.log('asset found asset has no children', asset);
                  return resolve(asset);
                }
              };
            })(this));
          },
          getData: function(query, options) {
            var j, len, makeQueryPromise, promises, request;
            if (options == null) {
              options = {};
            }
            query = angular.copy(query);
            if (!query) {
              query = $location.path();
            }
            if (_.isString(query)) {
              query = [
                {
                  path: query
                }
              ];
            }
            query = imagoUtils.toArray(query);
            promises = [];
            makeQueryPromise = (function(_this) {
              return function(request) {
                return $q(function(resolve, reject) {
                  return _this.getLocalData(request, options).then(function(result) {
                    var worker;
                    if (result.assets) {
                      worker = {
                        assets: result.assets,
                        order: result.sortorder,
                        path: sortWorker
                      };
                      return imagoWorker.work(worker).then(function(response) {
                        result.assets = response.assets;
                        return resolve(result);
                      });
                    } else {
                      return resolve(result);
                    }
                  }, function(rejection) {
                    return _this.search([rejection]).then(function(response) {
                      var j, len, ref, res, results1;
                      if (!(response != null ? response.data : void 0)) {
                        return;
                      }
                      ref = response.data;
                      results1 = [];
                      for (j = 0, len = ref.length; j < len; j++) {
                        res = ref[j];
                        results1.push(resolve(_this.create(res)));
                      }
                      return results1;
                    }, function(err) {
                      reject();
                      if (err.status === 401) {
                        return console.warn('Imago API warning:', err.data);
                      }
                    });
                  });
                });
              };
            })(this);
            for (j = 0, len = query.length; j < len; j++) {
              request = query[j];
              promises.push(makeQueryPromise(request));
            }
            return $q.all(promises).then(function(response) {
              var ref, ref1;
              response = _.flatten(response);
              if (options.updatePageTitle || (config.updatePageTitle && _.isUndefined(options.updatePageTitle))) {
                if (options.title) {
                  $document.prop('title', options.title);
                } else if (response.length === 1 && ((ref = response[0].fields) != null ? (ref1 = ref.title) != null ? ref1.value : void 0 : void 0)) {
                  $document.prop('title', response[0].fields.title.value.replace(/<[A-Za-z\/][^<>]*>/g, ' ').replace(/\r?\n|\r/g, ''));
                } else if (response.length === 1 && response[0].name) {
                  $document.prop('title', response[0].name);
                }
              }
              return response;
            });
          },
          formatQuery: function(query) {
            var elem, j, k, key, len, len1, querydict, ref, value;
            querydict = {};
            if (_.isArray(query)) {
              for (j = 0, len = query.length; j < len; j++) {
                elem = query[j];
                for (key in elem) {
                  value = elem[key];
                  querydict[key] || (querydict[key] = []);
                  querydict[key].push(value);
                }
              }
            } else if (_.isPlainObject(query)) {
              for (key in query) {
                value = query[key];
                querydict[key] = angular.isArray(value) ? value : [value];
              }
            } else if (_.isString(query)) {
              querydict['path'] = [query];
            }
            ref = ['page', 'pagesize'];
            for (k = 0, len1 = ref.length; k < len1; k++) {
              key = ref[k];
              if (querydict.hasOwnProperty(key)) {
                querydict[key] = querydict[key][0];
              }
            }
            return querydict;
          },
          addAsset: function(asset) {
            if (!this.find({
              '_id': asset._id
            })) {
              this.data.push(asset);
            }
            return this.populateData(asset.assets);
          },
          populateData: function(assets) {
            var asset, j, len, results1;
            if (!_.isArray(assets)) {
              return;
            }
            results1 = [];
            for (j = 0, len = assets.length; j < len; j++) {
              asset = assets[j];
              results1.push(this.addAsset(asset));
            }
            return results1;
          },
          getById: function(id) {
            var asset;
            asset = this.find({
              '_id': id
            });
            if (asset) {
              asset.assets = this.findChildren(asset);
              return $q.resolve(asset);
            }
            return this.assets.get(id).then(function(response) {
              return response.data;
            });
          },
          create: function(data) {
            var collection;
            collection = data;
            this.populateData(data.assets);
            if (!this.find({
              '_id': collection._id
            })) {
              if (collection.type === 'collection') {
                collection = _.omit(collection, 'assets');
              }
              this.data.push(collection);
            }
            return _.cloneDeep(data);
          },
          findChildren: function(asset) {
            return _.filter(this.data, {
              parent: asset._id
            });
          },
          findParent: function(asset) {
            return _.find(this.data, {
              '_id': asset.parent
            });
          },
          findByAttr: function(options) {
            if (options == null) {
              options = {};
            }
            return _.filter(this.data, options);
          },
          find: function(options) {
            if (options == null) {
              options = {};
            }
            return _.find(this.data, options);
          },
          findIdx: function(options) {
            if (options == null) {
              options = {};
            }
            return _.findIndex(this.data, options);
          },
          filterAssets: function(assets, query) {
            var filter, j, key, len, params, value;
            query = _.omit(query, ['path', 'recursive']);
            if (_.keys(query).length) {
              filter = function(params, key) {
                return _.filter(assets, function(asset) {
                  var elem, j, len, ref, value;
                  if ((ref = asset.fields) != null ? ref.hasOwnProperty(key) : void 0) {
                    value = asset.fields[key].value;
                    if (_.isString(value)) {
                      if (value.match(new RegExp(params, 'i'))) {
                        return true;
                      }
                    }
                    if (_.isNumber(value)) {
                      if (ParseFloat(value === ParseFloat(params))) {
                        return true;
                      }
                    }
                    if (_.isArray(value)) {
                      for (j = 0, len = value.length; j < len; j++) {
                        elem = value[j];
                        if (elem.match(new RegExp(params, 'i'))) {
                          return true;
                        }
                      }
                    }
                    return false;
                  } else if (asset[key]) {
                    value = asset[key];
                    if (_.isString(value)) {
                      if (value.match(new RegExp(params, 'i'))) {
                        return true;
                      }
                    }
                    if (_.isString(value)) {
                      if (imagoUtils.normalize(value).match(new RegExp(params, 'i'))) {
                        return true;
                      }
                    }
                    if (_.isNumber(value)) {
                      if (ParseFloat(value === ParseFloat(params))) {
                        return true;
                      }
                    }
                    return false;
                  }
                });
              };
              for (key in query) {
                value = query[key];
                if (key === 'path') {
                  continue;
                }
                if (_.isArray(value)) {
                  for (j = 0, len = value.length; j < len; j++) {
                    params = value[j];
                    assets = filter(params, key);
                  }
                } else if (_.isString(value)) {
                  assets = filter(value, key);
                }
              }
            }
            return assets;
          },
          updateCount: function(parent, number) {
            parent.count = parent.count + number;
            return this.update(parent, {
              stream: false
            });
          },
          add: function(assets, options) {
            if (options == null) {
              options = {};
            }
            return $q((function(_this) {
              return function(resolve, reject) {
                var asset, copy, j, k, len, len1;
                if (options.save) {
                  copy = angular.copy(assets);
                  for (j = 0, len = copy.length; j < len; j++) {
                    asset = copy[j];
                    delete asset.base64_url;
                  }
                  return _this.assets.create(copy).then(function(result) {
                    var k, len1, ref;
                    for (k = 0, len1 = result.length; k < len1; k++) {
                      asset = result[k];
                      asset.base64_url = (ref = _.find(assets, {
                        uuid: asset.uuid
                      })) != null ? ref.base64_url : void 0;
                      _this.data.push(asset);
                    }
                    $rootScope.$emit('assets:add', result);
                    return resolve(result);
                  });
                } else {
                  for (k = 0, len1 = assets.length; k < len1; k++) {
                    asset = assets[k];
                    _this.data.push(asset);
                  }
                  $rootScope.$emit('assets:add', assets);
                  return resolve(assets);
                }
              };
            })(this));
          },
          update: function(data, options) {
            if (options == null) {
              options = {};
            }
            if (_.isUndefined(options.stream)) {
              options.stream = true;
            }
            if (_.isUndefined(options.attribute)) {
              options.attribute = '_id';
            }
            return $q((function(_this) {
              return function(resolve, reject) {
                var asset, find, idx, j, len, query;
                if (!_.isArray(data)) {
                  data = [data];
                }
                for (idx = j = 0, len = data.length; j < len; idx = ++j) {
                  asset = data[idx];
                  query = {};
                  query[options.attribute] = asset[options.attribute];
                  asset = _.omit(asset, 'assets');
                  find = _this.find(query);
                  if (find) {
                    if (find.base64_url && asset.serving_url) {
                      asset.base64_url = null;
                    }
                    _.assign(find, asset);
                    data[idx] = find;
                  } else {
                    _this.data.push(asset);
                  }
                  if (asset.base64_url) {
                    asset.base64_url = null;
                  }
                }
                if (options.save) {
                  resolve(_this.assets.batch(data));
                } else {
                  resolve(data);
                }
                if (options.stream) {
                  return $rootScope.$emit('assets:update', data);
                }
              };
            })(this));
          },
          "delete": function(assets, options) {
            if (options == null) {
              options = {};
            }
            return $q((function(_this) {
              return function(resolve, reject) {
                var asset, j, len, promises;
                if (!(assets != null ? assets.length : void 0)) {
                  return reject(assets);
                }
                if (_.isUndefined(options.stream)) {
                  options.stream = true;
                }
                promises = [];
                for (j = 0, len = assets.length; j < len; j++) {
                  asset = assets[j];
                  _.remove(_this.data, {
                    '_id': asset._id
                  });
                  if (options.save) {
                    promises.push(_this.assets["delete"](asset._id));
                  }
                }
                if (promises.length) {
                  resolve($q.all(promises));
                } else {
                  resolve(assets);
                }
                if (options.stream) {
                  return $rootScope.$emit('assets:delete', assets);
                }
              };
            })(this));
          },
          trash: function(assets) {
            var asset, j, len, request;
            request = [];
            for (j = 0, len = assets.length; j < len; j++) {
              asset = assets[j];
              request.push({
                '_id': asset._id,
                'name': asset.name
              });
            }
            this.assets.trash(request);
            return this["delete"](assets);
          },
          copy: function(assets, sourceId, parentId) {
            return $q((function(_this) {
              return function(resolve, reject) {
                return _this.paste(assets).then(function(pasted) {
                  var asset, j, len, request;
                  request = [];
                  for (j = 0, len = pasted.length; j < len; j++) {
                    asset = pasted[j];
                    request.push({
                      '_id': asset._id,
                      'order': asset.order,
                      'name': asset.name
                    });
                  }
                  return _this.assets.copy(request, sourceId, parentId).then(function(result) {
                    if (_this.currentCollection.sortorder === '-order') {
                      return resolve(_this.update(result.data));
                    } else {
                      _this.update(result.data, {
                        stream: false
                      });
                      return resolve(_this.reSort(_this.currentCollection));
                    }
                  });
                });
              };
            })(this));
          },
          move: function(assets, sourceId, parentId) {
            var defer;
            defer = $q.defer();
            this.paste(assets).then((function(_this) {
              return function(pasted) {
                var asset, j, len, request;
                if (_this.currentCollection.sortorder === '-order') {
                  _this.update(pasted).then(function() {
                    return defer.resolve();
                  });
                } else {
                  _this.update(pasted, {
                    stream: false
                  });
                  _this.reSort(_this.currentCollection).then(function() {
                    return defer.resolve();
                  });
                }
                request = [];
                for (j = 0, len = pasted.length; j < len; j++) {
                  asset = pasted[j];
                  request.push({
                    '_id': asset._id,
                    'order': asset.order,
                    'name': asset.name
                  });
                }
                return _this.assets.move(request, sourceId, parentId);
              };
            })(this));
            return defer.promise;
          },
          paste: function(assets, options) {
            var asset, assetsChildren, checkAsset, j, len, queue;
            if (options == null) {
              options = {};
            }
            if (_.isUndefined(options.checkdups)) {
              options.checkdups = true;
            }
            assetsChildren = this.findChildren(this.currentCollection);
            checkAsset = (function(_this) {
              return function(asset) {
                var exists, i, original_name;
                if (!options.checkdups || _.filter(assetsChildren, function(item) {
                  return imagoUtils.normalize(asset.name) === imagoUtils.normalize(item.name);
                }).length === 0) {
                  return $q.resolve(asset);
                } else {
                  i = 1;
                  exists = true;
                  original_name = asset.name;
                  while (exists) {
                    asset.name = original_name + "_" + i;
                    i++;
                    exists = (_.filter(assetsChildren, function(item) {
                      return imagoUtils.normalize(asset.name) === imagoUtils.normalize(item.name);
                    }).length ? true : false);
                  }
                  return $q.resolve(asset);
                }
              };
            })(this);
            queue = [];
            for (j = 0, len = assets.length; j < len; j++) {
              asset = assets[j];
              queue.push(checkAsset(asset));
            }
            return $q.all(queue);
          },
          reSort: function(collection) {
            var orderedList;
            if (!collection.assets || collection.sortorder === '-order') {
              return $q.reject(collection);
            }
            orderedList = this.reindexAll(collection.assets);
            this.update(orderedList, {
              stream: false,
              save: true
            });
            collection.sortorder = '-order';
            return this.update(collection, {
              save: true
            });
          },
          reindexAll: (function(_this) {
            return function(list) {
              var asset, count, j, key, len, newList;
              newList = [];
              count = list.length;
              for (key = j = 0, len = list.length; j < len; key = ++j) {
                asset = list[key];
                newList.push({
                  '_id': asset._id,
                  'order': (count - key) * indexRange
                });
              }
              return newList;
            };
          })(this),
          reorder: (function(_this) {
            return function(dropped, list, selection, options) {
              var count, data, idxOne, idxTwo, minusOrder, repair;
              if (options == null) {
                options = {};
              }
              if (_.isUndefined(options.process)) {
                options.process = true;
              }
              if (options.reverse) {
                count = dropped - selection.length;
                idxOne = list[count];
                idxTwo = list[dropped + 1] ? list[dropped + 1] : {
                  order: 0
                };
                selection = selection.reverse();
              } else if (options.process === false) {
                idxOne = list[dropped - 1];
                idxTwo = list[dropped] ? list[dropped] : {
                  order: 0
                };
              } else {
                count = dropped + selection.length;
                idxOne = list[dropped - 1] ? list[dropped - 1] : void 0;
                idxTwo = list[count];
              }
              if (!idxOne) {
                minusOrder = indexRange;
              } else {
                minusOrder = (idxOne.order - idxTwo.order) / (selection.length + 1);
                if (minusOrder <= 0.05) {
                  repair = true;
                }
              }
              data = {
                minus: minusOrder,
                order: idxTwo.order + minusOrder,
                repair: repair
              };
              return data;
            };
          })(this),
          batchAddTag: function(assets) {
            var asset, base, base1, copy, idx, j, key, len, original, toedit, value;
            for (idx = j = 0, len = assets.length; j < len; idx = ++j) {
              asset = assets[idx];
              original = this.find({
                '_id': asset._id
              });
              if (!original) {
                return;
              }
              copy = {
                fields: original.fields,
                parent: original.parent
              };
              toedit = angular.copy(asset);
              for (key in toedit) {
                value = toedit[key];
                if (key === 'fields') {
                  for (key in toedit.fields) {
                    copy['fields'] || (copy['fields'] = {});
                    (base = copy['fields'])[key] || (base[key] = {});
                    (base1 = copy['fields'][key]).value || (base1.value = []);
                    if (copy['fields'][key].value.indexOf(toedit.fields[key]) === -1) {
                      copy['fields'][key].value.push(toedit.fields[key]);
                    }
                  }
                } else {
                  copy[key] = toedit[key];
                }
              }
              assets[idx] = copy;
            }
            return this.update(assets, {
              save: true
            });
          },
          batchChange: function(assets, keyOnly) {
            var asset, base, base1, copy, idx, j, key, len, original, toedit;
            for (idx = j = 0, len = assets.length; j < len; idx = ++j) {
              asset = assets[idx];
              original = this.find({
                '_id': asset._id
              });
              if (!original) {
                continue;
              }
              copy = {
                fields: original.fields,
                parent: original.parent
              };
              toedit = angular.copy(asset);
              for (key in toedit) {
                if (key === 'fields') {
                  for (key in toedit.fields) {
                    copy['fields'] || (copy['fields'] = {});
                    if (keyOnly) {
                      (base = copy['fields'])[key] || (base[key] = {});
                      (base1 = copy['fields'][key]).value || (base1.value = {});
                      copy['fields'][key].value[keyOnly] = toedit.fields[key].value[keyOnly];
                    } else {
                      copy['fields'][key] = toedit.fields[key];
                    }
                  }
                } else {
                  copy[key] = toedit[key];
                }
              }
              if (_.isEmpty(copy.fields)) {
                delete copy.fields;
              }
              assets[idx] = copy;
            }
            return this.update(assets, {
              save: true
            });
          },
          isDuplicated: function(asset, assets, options) {
            if (options == null) {
              options = {};
            }
            return $q(function(resolve, reject) {
              var assetsChildren, exists, findName, i, name, original_name, result;
              if (_.isUndefined(options.rename)) {
                options.rename = false;
              }
              if (!asset.name) {
                return reject(asset.name);
              }
              name = imagoUtils.normalize(asset.name);
              result = void 0;
              assetsChildren = _.filter(assets, (function(_this) {
                return function(chr) {
                  if (!chr.name) {
                    return false;
                  }
                  return name === imagoUtils.normalize(chr.name);
                };
              })(this));
              if (assetsChildren.length) {
                if (assetsChildren.length === 1 && assetsChildren[0]._id === asset._id) {
                  return resolve(false);
                }
                if (options.rename) {
                  i = 1;
                  exists = true;
                  original_name = name;
                  while (exists) {
                    name = original_name + "_" + i;
                    i++;
                    findName = _.find(assets, (function(_this) {
                      return function(chr) {
                        return _.kebabCase(name) === _.kebabCase(chr.name);
                      };
                    })(this));
                    exists = (findName ? true : false);
                  }
                  return resolve(name);
                } else {
                  return resolve(true);
                }
              } else {
                return resolve(false);
              }
            });
          },
          prepareCreation: function(asset, parent, order, rename) {
            if (rename == null) {
              rename = false;
            }
            return $q((function(_this) {
              return function(resolve, reject) {
                if (!asset.name) {
                  return reject(asset.name);
                }
                return _this.isDuplicated(asset, parent.assets, {
                  rename: rename
                }).then(function(isDuplicated) {
                  var assets, orderedList;
                  if (isDuplicated && _.isBoolean(isDuplicated)) {
                    return resolve('duplicated');
                  } else {
                    if (_.isString(isDuplicated)) {
                      asset.name = isDuplicated;
                    }
                    if (order) {
                      asset.order = order;
                    } else {
                      if (parent.sortorder === '-order') {
                        assets = parent.assets;
                        asset.order = (assets.length ? assets[0].order + indexRange : indexRange);
                      } else {
                        if (parent.assets.length) {
                          orderedList = _this.reindexAll(parent.assets);
                          _this.update(orderedList, {
                            save: true
                          });
                          asset.order = orderedList[0].order + indexRange;
                        } else {
                          asset.order = indexRange;
                        }
                        parent.sortorder = '-order';
                        _this.update(parent, {
                          save: true
                        });
                      }
                    }
                    asset.parent = parent._id;
                    return resolve(asset);
                  }
                });
              };
            })(this));
          }
        };
      };
    }

    return imagoModel;

  })();

  angular.module('imago').provider('imagoModel', [imagoModel]);

}).call(this);

(function() {
  var ImagoSaveScroll;

  ImagoSaveScroll = (function() {
    function ImagoSaveScroll($window, $timeout, $state, $location) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          scope.scrollPos = [];
          scope.$on('$viewContentLoaded', function() {
            var history;
            history = _.find(scope.scrollPos, {
              path: $state.href($state.current, $state.params)
            });
            if (scope.scrollPos.length > 2) {
              scope.scrollPos = scope.scrollPos.slice(0, 2);
            }
            if (!(history != null ? history.scroll : void 0)) {
              $window.scrollTo(0, 0);
              return;
            }
            return $timeout(function() {
              return $window.scrollTo(0, history != null ? history.scroll : void 0);
            }, 500);
          });
          return scope.$on('$stateChangeStart', function(evt, newState, newParams, oldState, oldParams, opts) {
            var path;
            path = $state.href(oldState, oldParams);
            if (!path) {
              return;
            }
            scope.scrollPos.unshift({});
            return scope.scrollPos[0] = {
              path: path,
              scroll: $window.scrollY
            };
          });
        }
      };
    }

    return ImagoSaveScroll;

  })();

  angular.module('imago').directive('imagoSaveScroll', ['$window', '$timeout', '$state', '$location', ImagoSaveScroll]);

}).call(this);

(function() {
  var imagoUtils;

  imagoUtils = (function() {
    function imagoUtils() {
      var alphanum;
      return {
        KEYS: {
          '16': 'onShift',
          '18': 'onAlt',
          '17': 'onCommand',
          '91': 'onCommand',
          '93': 'onCommand',
          '224': 'onCommand',
          '13': 'onEnter',
          '32': 'onSpace',
          '37': 'onLeft',
          '38': 'onUp',
          '39': 'onRight',
          '40': 'onDown',
          '46': 'onDelete',
          '8': 'onBackspace',
          '9': 'onTab',
          '188': 'onComma',
          '190': 'onPeriod',
          '27': 'onEsc',
          '186': 'onColon',
          '65': 'onA',
          '67': 'onC',
          '86': 'onV',
          '88': 'onX',
          '68': 'onD',
          '187': 'onEqual',
          '189': 'onMinus'
        },
        SYMBOLS: {
          EUR: '&euro;',
          USD: '$',
          YEN: '&yen;',
          GBP: '&pound;',
          GENERIC: '&curren;'
        },
        CURRENCY_MAPPING: {
          "United Arab Emirates": "AED",
          "Afghanistan": "AFN",
          "Albania": "ALL",
          "Armenia": "AMD",
          "Angola": "AOA",
          "Argentina": "ARS",
          "Australia": "AUD",
          "Aruba": "AWG",
          "Azerbaijan": "AZN",
          "Bosnia and Herzegovina": "BAM",
          "Barbados": "BBD",
          "Bangladesh": "BDT",
          "Bulgaria": "BGN",
          "Bahrain": "BHD",
          "Burundi": "BIF",
          "Bermuda": "BMD",
          "Brunei": "BND",
          "Bolivia": "BOB",
          "Brazil": "BRL",
          "Bahamas": "BSD",
          "Bhutan": "BTN",
          "Botswana": "BWP",
          "Belarus": "BYR",
          "Belize": "BZD",
          "Canada": "CAD",
          "Switzerland": "CHF",
          "Chile": "CLP",
          "China": "CNY",
          "Colombia": "COP",
          "Costa Rica": "CRC",
          "Cuba Convertible": "CUC",
          "Cuba Peso": "CUP",
          "Cape Verde": "CVE",
          "Czech Republic": "CZK",
          "Djibouti": "DJF",
          "Denmark": "DKK",
          "Dominican Republic": "DOP",
          "Algeria": "DZD",
          "Egypt": "EGP",
          "Eritrea": "ERN",
          "Ethiopia": "ETB",
          "Autria": "EUR",
          "Fiji": "FJD",
          "United Kingdom": "GBP",
          "Georgia": "GEL",
          "Guernsey": "GGP",
          "Ghana": "GHS",
          "Gibraltar": "GIP",
          "Gambia": "GMD",
          "Guinea": "GNF",
          "Guatemala": "GTQ",
          "Guyana": "GYD",
          "Hong Kong": "HKD",
          "Honduras": "HNL",
          "Croatia": "HRK",
          "Haiti": "HTG",
          "Hungary": "HUF",
          "Indonesia": "IDR",
          "Israel": "ILS",
          "Isle of Man": "IMP",
          "India": "INR",
          "Iraq": "IQD",
          "Iran": "IRR",
          "Iceland": "ISK",
          "Jersey": "JEP",
          "Jamaica": "JMD",
          "Jordan": "JOD",
          "Japan": "JPY",
          "Kenya": "KES",
          "Kyrgyzstan": "KGS",
          "Cambodia": "KHR",
          "Comoros": "KMF",
          "North Korea": "KPW",
          "South Korea": "KRW",
          "Kuwait": "KWD",
          "Cayman Islands": "KYD",
          "Kazakhstan": "KZT",
          "Laos": "LAK",
          "Lebanon": "LBP",
          "Sri Lanka": "LKR",
          "Liberia": "LRD",
          "Lesotho": "LSL",
          "Lithuania": "LTL",
          "Latvia": "LVL",
          "Libya": "LYD",
          "Morocco": "MAD",
          "Moldova": "MDL",
          "Madagascar": "MGA",
          "Macedonia": "MKD",
          "Mongolia": "MNT",
          "Macau": "MOP",
          "Mauritania": "MRO",
          "Mauritius": "MUR",
          "Malawi": "MWK",
          "Mexico": "MXN",
          "Malaysia": "MYR",
          "Mozambique": "MZN",
          "Namibia": "NAD",
          "Nigeria": "NGN",
          "Nicaragua": "NIO",
          "Norway": "NOK",
          "Nepal": "NPR",
          "New Zealand": "NZD",
          "Oman": "OMR",
          "Panama": "PAB",
          "Peru": "PEN",
          "Papua New Guinea": "PGK",
          "Philippines": "PHP",
          "Pakistan": "PKR",
          "Poland": "PLN",
          "Paraguay": "PYG",
          "Qatar": "QAR",
          "Romania": "RON",
          "Serbia": "RSD",
          "Russia": "RUB",
          "Rwanda": "RWF",
          "Saudi Arabia": "SAR",
          "Solomon Islands": "SBD",
          "Seychelles": "SCR",
          "Sudan": "SDG",
          "Sweden": "SEK",
          "Singapore": "SGD",
          "Saint Helena": "SHP",
          "Suriname": "SRD",
          "El Salvador": "SVC",
          "Syria": "SYP",
          "Swaziland": "SZL",
          "Thailand": "THB",
          "Tajikistan": "TJS",
          "Turkmenistan": "TMT",
          "Tunisia": "TND",
          "Tonga": "TOP",
          "Turkey": "TRY",
          "Trinidad and Tobago": "TTD",
          "Tuvalu": "TVD",
          "Taiwan": "TWD",
          "Tanzania": "TZS",
          "Ukraine": "UAH",
          "Uganda": "UGX",
          "United States": "USD",
          "Uruguay": "UYU",
          "Uzbekistan": "UZS",
          "Venezuela": "VEF",
          "Vietnam": "VND",
          "Vanuatu": "VUV",
          "Samoa": "WST",
          "Yemen": "YER",
          "South Africa": "ZAR",
          "Zambia": "ZMW",
          "Zimbabwe": "ZWD",
          "Austria": "EUR",
          "Belgium": "EUR",
          "Bulgaria": "EUR",
          "Croatia": "EUR",
          "Cyprus": "EUR",
          "Czech Republic": "EUR",
          "Denmark": "EUR",
          "Estonia": "EUR",
          "Finland": "EUR",
          "France": "EUR",
          "Germany": "EUR",
          "Greece": "EUR",
          "Hungary": "EUR",
          "Ireland": "EUR",
          "Italy": "EUR",
          "Latvia": "EUR",
          "Lithuania": "EUR",
          "Luxembourg": "EUR",
          "Malta": "EUR",
          "Netherlands": "EUR",
          "Poland": "EUR",
          "Portugal": "EUR",
          "Romania": "EUR",
          "Slovakia": "EUR",
          "Slovenia": "EUR",
          "Spain": "EUR",
          "United Kingdom": "EUR"
        },
        CODES: {
          'Andorra': 'AD',
          'United Arab Emirates': 'AE',
          'Afghanistan': 'AF',
          'Antigua and Barbuda': 'AG',
          'Anguilla': 'AI',
          'Albania': 'AL',
          'Armenia': 'AM',
          'Angola': 'AO',
          'Antarctica': 'AQ',
          'Argentina': 'AR',
          'American Samoa': 'AS',
          'Austria': 'AT',
          'Australia': 'AU',
          'Aruba': 'AW',
          'Aland Islands': 'AX',
          'Azerbaijan': 'AZ',
          'Bosnia and Herzegovina': 'BA',
          'Barbados': 'BB',
          'Bangladesh': 'BD',
          'Belgium': 'BE',
          'Burkina Faso': 'BF',
          'Bulgaria': 'BG',
          'Bahrain': 'BH',
          'Burundi': 'BI',
          'Benin': 'BJ',
          'Saint Barthelemy': 'BL',
          'Bermuda': 'BM',
          'Brunei': 'BN',
          'Bolivia': 'BO',
          'Bonaire': 'BQ',
          'Brazil': 'BR',
          'Bahamas': 'BS',
          'Bhutan': 'BT',
          'Bouvet': 'BV',
          'Botswana': 'BW',
          'Belarus': 'BY',
          'Belize': 'BZ',
          'Canada': 'CA',
          'Cocos Islands': 'CC',
          'Democratic Republic of the Congo': 'CD',
          'Central African Republic': 'CF',
          'Republic of the Congo': 'CG',
          'Switzerland': 'CH',
          'Ivory Coast': 'CI',
          'Cook Islands': 'CK',
          'Chile': 'CL',
          'Cameroon': 'CM',
          'China': 'CN',
          'Colombia': 'CO',
          'Costa Rica': 'CR',
          'Cuba': 'CU',
          'Cape Verde': 'CV',
          'Curacao': 'CW',
          'Christmas Island': 'CX',
          'Cyprus': 'CY',
          'Czech Republic': 'CZ',
          'Germany': 'DE',
          'Djibouti': 'DJ',
          'Denmark': 'DK',
          'Dominica': 'DM',
          'Dominican Republic': 'DO',
          'Algeria': 'DZ',
          'Ecuador': 'EC',
          'Estonia': 'EE',
          'Egypt': 'EG',
          'Western Sahara': 'EH',
          'Eritrea': 'ER',
          'Spain': 'ES',
          'Ethiopia': 'ET',
          'Finland': 'FI',
          'Fiji': 'FJ',
          'Falkland Islands': 'FK',
          'Micronesia': 'FM',
          'Faroe Islands': 'FO',
          'France': 'FR',
          'Gabon': 'GA',
          'United Kingdom': 'GB',
          'Great Britain': 'GB',
          'Grenada': 'GD',
          'Georgia': 'GE',
          'French Guiana': 'GF',
          'Guernsey': 'GG',
          'Ghana': 'GH',
          'Gibraltar': 'GI',
          'Greenland': 'GL',
          'Gambia': 'GM',
          'Guinea': 'GN',
          'Guadeloupe': 'GP',
          'Equatorial Guinea': 'GQ',
          'Greece': 'GR',
          'South Georgia and the South Sandwich Islands': 'GS',
          'Guatemala': 'GT',
          'Guam': 'GU',
          'Guinea-Bissau': 'GW',
          'Guyana': 'GY',
          'Hong Kong': 'HK',
          'Heard Island and McDonald Islands': 'HM',
          'Honduras': 'HN',
          'Croatia': 'HR',
          'Haiti': 'HT',
          'Hungary': 'HU',
          'Indonesia': 'ID',
          'Ireland': 'IE',
          'Israel': 'IL',
          'Isle of Man': 'IM',
          'India': 'IN',
          'British Indian Ocean Territory': 'IO',
          'Iraq': 'IQ',
          'Iran': 'IR',
          'Iceland': 'IS',
          'Italy': 'IT',
          'Jersey': 'JE',
          'Jamaica': 'JM',
          'Jordan': 'JO',
          'Japan': 'JP',
          'Kenya': 'KE',
          'Kyrgyzstan': 'KG',
          'Cambodia': 'KH',
          'Kiribati': 'KI',
          'Comoros': 'KM',
          'Saint Kitts and Nevis': 'KN',
          'North Korea': 'KP',
          'South Korea': 'KR',
          'Kosovo': 'XK',
          'Kuwait': 'KW',
          'Cayman Islands': 'KY',
          'Kazakhstan': 'KZ',
          'Laos': 'LA',
          'Lebanon': 'LB',
          'Saint Lucia': 'LC',
          'Liechtenstein': 'LI',
          'Sri Lanka': 'LK',
          'Liberia': 'LR',
          'Lesotho': 'LS',
          'Lithuania': 'LT',
          'Luxembourg': 'LU',
          'Latvia': 'LV',
          'Libya': 'LY',
          'Morocco': 'MA',
          'Monaco': 'MC',
          'Moldova': 'MD',
          'Montenegro': 'ME',
          'Saint Martin': 'MF',
          'Madagascar': 'MG',
          'Marshall Islands': 'MH',
          'Macedonia': 'MK',
          'Mali': 'ML',
          'Myanmar': 'MM',
          'Mongolia': 'MN',
          'Macao': 'MO',
          'Northern Mariana Islands': 'MP',
          'Martinique': 'MQ',
          'Mauritania': 'MR',
          'Montserrat': 'MS',
          'Malta': 'MT',
          'Mauritius': 'MU',
          'Maldives': 'MV',
          'Malawi': 'MW',
          'Mexico': 'MX',
          'Malaysia': 'MY',
          'Mozambique': 'MZ',
          'Namibia': 'NA',
          'New Caledonia': 'NC',
          'Niger': 'NE',
          'Norfolk Island': 'NF',
          'Nigeria': 'NG',
          'Nicaragua': 'NI',
          'Netherlands': 'NL',
          'Norway': 'NO',
          'Nepal': 'NP',
          'Nauru': 'NR',
          'Niue': 'NU',
          'New Zealand': 'NZ',
          'Oman': 'OM',
          'Panama': 'PA',
          'Peru': 'PE',
          'French Polynesia': 'PF',
          'Papua New Guinea': 'PG',
          'Philippines': 'PH',
          'Pakistan': 'PK',
          'Poland': 'PL',
          'Saint Pierre and Miquelon': 'PM',
          'Pitcairn': 'PN',
          'Puerto Rico': 'PR',
          'Palestinian Territory': 'PS',
          'Portugal': 'PT',
          'Palau': 'PW',
          'Paraguay': 'PY',
          'Qatar': 'QA',
          'Reunion': 'RE',
          'Romania': 'RO',
          'Serbia': 'RS',
          'Russia': 'RU',
          'Rwanda': 'RW',
          'Saudi Arabia': 'SA',
          'Solomon Islands': 'SB',
          'Seychelles': 'SC',
          'Sudan': 'SD',
          'South Sudan': 'SS',
          'Sweden': 'SE',
          'Singapore': 'SG',
          'Saint Helena': 'SH',
          'Slovenia': 'SI',
          'Svalbard': 'SJ',
          'Slovakia': 'SK',
          'Sierra Leone': 'SL',
          'San Marino': 'SM',
          'Senegal': 'SN',
          'Somalia': 'SO',
          'Suriname': 'SR',
          'Sao Tome and Principe': 'ST',
          'El Salvador': 'SV',
          'Sint Maarten': 'SX',
          'Damascus': 'SY',
          'Swaziland': 'SZ',
          'Turks and Caicos Islands': 'TC',
          'Chad': 'TD',
          'French Southern Territories': 'TF',
          'Togo': 'TG',
          'Thailand': 'TH',
          'Tajikistan': 'TJ',
          'Tokelau': 'TK',
          'East Timor': 'TL',
          'Turkmenistan': 'TM',
          'Tunisia': 'TN',
          'Tonga': 'TO',
          'Turkey': 'TR',
          'Trinidad and Tobago': 'TT',
          'Tuvalu': 'TV',
          'Taiwan': 'TW',
          'Tanzania': 'TZ',
          'Ukraine': 'UA',
          'Uganda': 'UG',
          'United States Minor Outlying Islands': 'UM',
          'United States': 'US',
          'USA': 'US',
          'United States of America': 'US',
          'Uruguay': 'UY',
          'Uzbekistan': 'UZ',
          'Vatican': 'VA',
          'Saint Vincent and the Grenadines': 'VC',
          'Venezuela': 'VE',
          'British Virgin Islands': 'VG',
          'U.S. Virgin Islands': 'VI',
          'Vietnam': 'VN',
          'Vanuatu': 'VU',
          'Wallis and Futuna': 'WF',
          'Samoa': 'WS',
          'Yemen': 'YE',
          'Mayotte': 'YT',
          'South Africa': 'ZA',
          'Zambia': 'ZM',
          'Zimbabwe': 'ZW',
          'Serbia and Montenegro': 'CS'
        },
        COUNTRIES: ["United States", "Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bonaire", "Bosnia and Herzegovina", "Botswana", "Bouvet", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos Islands", "Colombia", "Comoros", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Damascus", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Great Britain", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territory", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of the Congo", "Reunion", "Romania", "Russia", "Rwanda", "Saint Barthelemy", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Scotland", "Senegal", "Serbia", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard", "Swaziland", "Sweden", "Switzerland", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "U.S. Virgin Islands", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican", "Venezuela", "Vietnam", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"],
        STATES: {
          AUSTRALIA: ['ACT', 'NSW', 'NT', 'SA', 'TAS', 'QLD', 'VIC', 'WA'],
          CANADA: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'],
          USA: ['AL', 'AK', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'AR', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY']
        },
        CURRENCIES: ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYR', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LTL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STD', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'USS', 'UYI', 'UYU', 'UZS', 'VEF', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR', 'XOF', 'XPD', 'XPF', 'XPT', 'XSU', 'XTS', 'XUA', 'XXX', 'YER', 'ZAR', 'ZMW', 'ZWL'],
        ZERODECIMAL_CURRENCIES: ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'VND', 'VUV', 'XAF', 'XOF', 'XPF', 'BRL', 'HUF', 'MYR', 'TWD'],
        PAYPAL_SUPPORTED_CURRENCIES: ['AUD', 'BRL', 'CAD', 'CZK', 'DKK', 'EUR', 'HKD', 'HUF', 'ILS', 'JPY', 'MYR', 'MXN', 'TWD', 'NZD', 'NOK', 'PHP', 'PLN', 'GBP', 'RUB', 'SGD', 'SEK', 'CHF', 'THB', 'USD'],
        toType: function(obj) {
          return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        },
        requestAnimationFrame: (function() {
          var request;
          request = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            return window.setTimeout(callback, 1000 / 60);
          };
          return function(callback) {
            return request.call(window, callback);
          };
        })(),
        cookie: function(name, value) {
          var cookie, k, len, ref;
          if (!value) {
            ref = document.cookie.split(';');
            for (k = 0, len = ref.length; k < len; k++) {
              cookie = ref[k];
              if (cookie.indexOf(name) >= 0) {
                return cookie.split('=')[1];
              }
            }
            return false;
          }
          return document.cookie = name + "=" + value + "; path=/";
        },
        sha: function() {
          var i, k, possible, text;
          text = '';
          possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
          for (i = k = 0; k <= 56; i = ++k) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
          }
          return text;
        },
        uuid: function() {
          var S4;
          S4 = function() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
          };
          return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
        },
        urlify: function(query) {
          return console.log('urlify');
        },
        queryfy: function(url) {
          var facet, filter, k, key, len, query, ref, value;
          query = [];
          ref = url.split('+');
          for (k = 0, len = ref.length; k < len; k++) {
            filter = ref[k];
            filter || (filter = 'collection:/');
            facet = filter.split(':');
            key = facet[0].toLowerCase();
            value = decodeURIComponent(facet[1] || '');
            facet = {};
            facet[key] = value;
            query.push(facet);
          }
          return query;
        },
        pluralize: function(str) {
          return str + 's';
        },
        singularize: function(str) {
          return str.replace(/s$/, '');
        },
        titleCase: function(str) {
          if (typeof str !== 'string' && !str.length) {
            return str;
          }
          return str.replace(/\w\S*/g, ((function(_this) {
            return function(txt) {
              return txt[0].toUpperCase() + txt.substr(1).toLowerCase();
            };
          })(this)));
        },
        normalize: function(s) {
          var key, specialCharMapping, value;
          if (typeof s !== 'string') {
            return;
          }
          s = s.trim().toLowerCase();
          specialCharMapping = {
            "ä": "ae",
            "ö": "oe",
            "ü": "ue",
            "&": "and",
            "\\+": "plus",
            "ß": "ss",
            "@": "at"
          };
          for (key in specialCharMapping) {
            value = specialCharMapping[key];
            s = s.replace(new RegExp(key, 'g'), value);
          }
          return _.deburr(s.replace(/[\.,#¡!?¿@$%\^&\*;:{}='`‘’“”„"~()\?><\[\]†‡‹›•™¦©®ª«»¬°¹²³µ¶·º℅ⁿ§¨‣‼№♠♣♦♥←→↑↓♀♂♩♪♬♭]/g, '').replace(/\/|\_|\‾|\ |\\/g, '-').replace(/\-+/g, '-').replace(/^-|-$/g, ''));
        },
        deNormalize: function(s) {
          var k, len, text, w, words;
          if (typeof s !== 'string') {
            return;
          }
          words = s.split('-');
          text = '';
          for (k = 0, len = words.length; k < len; k++) {
            w = words[k];
            text += ' ' + w[0].toUpperCase() + w.slice(1);
          }
          return text.slice(1);
        },
        alphaNumSort: alphanum = function(a, b) {
          var aa, bb, c, chunkify, d, x;
          chunkify = function(t) {
            var i, j, m, n, tz, x, y;
            tz = [];
            x = 0;
            y = -1;
            n = 0;
            i = void 0;
            j = void 0;
            while (i = (j = t.charAt(x++)).charCodeAt(0)) {
              m = i === 46 || (i >= 48 && i <= 57);
              if (m !== n) {
                tz[++y] = "";
                n = m;
              }
              tz[y] += j;
            }
            return tz;
          };
          aa = chunkify(a);
          bb = chunkify(b);
          x = 0;
          while (aa[x] && bb[x]) {
            if (aa[x] !== bb[x]) {
              c = Number(aa[x]);
              d = Number(bb[x]);
              if (c === aa[x] && d === bb[x]) {
                return c - d;
              } else {
                return ((aa[x] > bb[x]) ? 1 : -1);
              }
            }
            x++;
          }
          return aa.length - bb.length;
        },
        isiOS: function() {
          return !!navigator.userAgent.match(/iPad|iPhone|iPod/i);
        },
        isiPad: function() {
          return !!navigator.userAgent.match(/iPad/i);
        },
        isiPhone: function() {
          return !!navigator.userAgent.match(/iPhone/i);
        },
        isiPod: function() {
          return !!navigator.userAgent.match(/iPod/i);
        },
        isChrome: function() {
          return !!navigator.userAgent.match(/Chrome/i);
        },
        isIE: function() {
          return !!navigator.userAgent.match(/MSIE/i);
        },
        isFirefox: function() {
          return !!navigator.userAgent.match(/Firefox/i);
        },
        isSafari: function() {
          return !!navigator.userAgent.match(/Safari/i) && !this.isChrome();
        },
        isMobile: function() {
          return !!navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i);
        },
        isAndroid: function() {
          return !!navigator.userAgent.match(/Android/i);
        },
        isEven: function(n) {
          return this.isNumber(n) && (n % 2 === 0);
        },
        isOdd: function(n) {
          return this.isNumber(n) && (n % 2 === 1);
        },
        isNumber: function(n) {
          return n === parseFloat(n);
        },
        toFloat: function(value, decimal) {
          var floats, ints;
          if (decimal == null) {
            decimal = 2;
          }
          if (!decimal) {
            return value;
          }
          value = String(value).replace(/\D/g, '');
          floats = value.slice(value.length - decimal);
          while (floats.length < decimal) {
            floats = '0' + floats;
          }
          ints = value.slice(0, value.length - decimal) || '0';
          return ints + "." + floats;
        },
        formatCurrency: function(number, c, d, t) {
          var t;
          var d;
          var c;
          var i, j, n, s;
          n = number;
          c = isNaN(c = Math.abs(c)) ? 2 : c;
          d = d === void 0 ? '.' : d;
          t = t === void 0 ? ',' : t;
          s = n < 0 ? '-' : '';
          i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '';
          j = (j = i.length) > 3 ? j % 3 : 0;
          return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
        },
        toPrice: function(value, currency) {
          var price, symbol;
          price = this.toFloat(value).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
          symbol = this.getCurrencySymbol(currency);
          return symbol + " " + price;
        },
        isEmail: function(value) {
          var pattern;
          pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return !!value.match(pattern);
        },
        fireEvent: function(name) {
          var evt;
          if (bowser.msie && Number(bowser.version) <= 11) {
            evt = document.createEvent(name);
            evt.initCustomEvent(name, false, false);
          } else {
            evt = new CustomEvent(name);
          }
          return window.dispatchEvent(evt);
        },
        getKeyName: function(e) {
          return KEYS[e.which];
        },
        getURLParameter: function(name) {
          var regex, results;
          name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
          regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
          results = regex.exec(location.search);
          if (results == null) {
            return "";
          } else {
            return decodeURIComponent(results[1].replace(/\+/g, " "));
          }
        },
        inUsa: function(value) {
          var ref;
          return (ref = value != null ? value.toLowerCase() : void 0) === 'usa' || ref === 'united states' || ref === 'united states of america';
        },
        replaceNewLines: function(msg) {
          return msg.replace(/(\r\n\r\n|\r\n|\n|\r)/gm, "<br>");
        },
        getCurrencySymbol: function(currency) {
          return this.SYMBOLS[currency] || currency;
        },
        getCurrency: function(country) {
          return CURRENCY_MAPPING[country];
        },
        getCountryByCode: function(code) {
          var key, ref, value;
          if (!code) {
            return;
          }
          code = code.toUpperCase();
          ref = this.CODES;
          for (key in ref) {
            value = ref[key];
            if (value === code) {
              return key;
              break;
            }
          }
        },
        getCountryCodeByCountry: function(country) {
          var key, ref, value;
          if (!country) {
            return;
          }
          ref = this.CODES;
          for (key in ref) {
            value = ref[key];
            if (key === country) {
              return value;
              break;
            }
          }
        },
        includesTax: function(currency) {
          var TAXINCLUDED;
          TAXINCLUDED = {
            'USD': false
          };
          if (TAXINCLUDED[currency] !== void 0) {
            return false;
          }
          return true;
        },
        toArray: function(elem) {
          if (angular.isArray(elem)) {
            return elem;
          } else {
            return [elem];
          }
        },
        getMeta: function(asset, attribute) {
          if (!asset.fields[attribute]) {
            return console.log("This asset does not contain a " + attribute + " attribute");
          }
          return asset.fields[attribute].value;
        },
        isBaseString: function(string) {
          if (string == null) {
            string = '';
          }
          return !!string.match(this.isBaseRegex);
        },
        isBaseRegex: /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i,
        renameKey: function(oldName, newName, object) {
          object[newName] = object[oldName];
          delete object[oldName];
          return object;
        },
        parentPath: function(path) {
          return path.split('/').slice(0, path.substr(-1) === '/' ? -2 : -1).join('/');
        }
      };
    }

    return imagoUtils;

  })();

  angular.module('imago').factory('imagoUtils', [imagoUtils]);

}).call(this);

(function() {
  var imagoWorker,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  imagoWorker = (function() {
    imagoWorker.prototype.store = [];

    imagoWorker.prototype.supported = true;

    function imagoWorker($q, $http) {
      this.$q = $q;
      this.$http = $http;
      this.work = bind(this.work, this);
      this.create = bind(this.create, this);
      this.windowURL = window.URL || window.webkitURL;
      this.test();
    }

    imagoWorker.prototype.test = function() {
      var blob, e, scriptText;
      scriptText = 'this.onmessage=function(e){postMessage(e.data)}';
      try {
        blob = new Blob([scriptText], {
          type: 'text/javascript'
        });
      } catch (error) {
        e = error;
        this.supported = false;
      }
      if (this.supported === false) {
        return;
      }
      try {
        return this.create(this.windowURL.createObjectURL(blob), 'imago');
      } catch (error) {
        e = error;
        return this.supported = false;
      }
    };

    imagoWorker.prototype.create = function(path, data, defer) {
      var worker;
      worker = new Worker(path);
      worker.addEventListener('message', (function(_this) {
        return function(e) {
          if (defer) {
            defer.resolve(e.data);
          }
          return worker.terminate();
        };
      })(this));
      return worker.postMessage(data);
    };

    imagoWorker.prototype.work = function(data) {
      var defer, find;
      if (!(data != null ? data.path : void 0)) {
        return this.$q.reject('invalid path');
      }
      defer = this.$q.defer();
      find = _.find(this.store, {
        'path': data.path
      });
      if (this.supported === false) {
        this.create(data.path, data, defer);
      } else if (find) {
        this.create(find.blob, data, defer);
      } else {
        this.$http.get(data.path, {
          cache: true
        }).then((function(_this) {
          return function(response) {
            var blob, blobURL, stringified;
            stringified = response.data.toString();
            blob = new Blob([stringified], {
              type: 'application/javascript'
            });
            blobURL = _this.windowURL.createObjectURL(blob);
            _this.store.push({
              'path': data.path,
              'blob': blobURL
            });
            return _this.create(blobURL, data, defer);
          };
        })(this));
      }
      return defer.promise;
    };

    return imagoWorker;

  })();

  angular.module('imago').service('imagoWorker', ['$q', '$http', imagoWorker]);

}).call(this);

(function() {
  var NotSupported, NotSupportedController;

  NotSupported = (function() {
    function NotSupported() {
      return {
        bindings: {
          data: '@'
        },
        templateUrl: '/imago/not-supported.html',
        controller: 'notSupportedController'
      };
    }

    return NotSupported;

  })();

  NotSupportedController = (function() {
    function NotSupportedController($scope) {
      var browser, browserVersion, i, key, len, option, options, ref, version;
      this.mobile = bowser.mobile;
      options = {
        ie: 9,
        firefox: 32,
        chrome: 30,
        safari: 6,
        opera: 23,
        android: 4.3
      };
      this.data = $scope.$eval(this.data);
      if (_.isArray(this.data)) {
        ref = this.data;
        for (i = 0, len = ref.length; i < len; i++) {
          option = ref[i];
          version = option.match(/\d+/g);
          version = Number(version);
          if (_.isNaN(version)) {
            continue;
          }
          for (key in options) {
            if (_.includes(option.toLowerCase(), key)) {
              options[key] = version;
            }
          }
        }
      }
      browserVersion = Number(bowser.version);
      for (browser in options) {
        version = options[browser];
        if (bowser.msie && browser === 'ie') {
          if (browserVersion <= version) {
            this.invalid = true;
          } else if (_.isNaN(version)) {
            this.invalid = true;
          }
        } else if (bowser.chrome && browser === 'chrome' && !bowser.android) {
          if (browserVersion <= version) {
            this.invalid = true;
          } else if (_.isNaN(version)) {
            this.invalid = true;
          }
        } else if (bowser.android && browser === 'android') {
          if (browserVersion <= version) {
            this.invalid = true;
          } else if (_.isNaN(version)) {
            this.invalid = true;
          }
        } else if (bowser.firefox && browser === 'firefox') {
          if (browserVersion <= version) {
            this.invalid = true;
          } else if (_.isNaN(version)) {
            this.invalid = true;
          }
        } else if (bowser.opera && browser === 'opera') {
          if (browserVersion <= version) {
            this.invalid = true;
          } else if (_.isNaN(version)) {
            this.invalid = true;
          }
        } else if (bowser.safari && browser === 'safari') {
          if (browserVersion <= version) {
            this.invalid = true;
          } else if (_.isNaN(version)) {
            this.invalid = true;
          }
        }
        if (this.invalid) {
          break;
        }
      }
    }

    return NotSupportedController;

  })();

  angular.module('imago').component('notSupported', new NotSupported()).controller('notSupportedController', ['$scope', NotSupportedController]);

}).call(this);

(function() {
  var Page;

  Page = (function() {
    function Page(promiseData) {
      var asset, i, len;
      if (!promiseData) {
        return;
      }
      if (promiseData.length === 1) {
        for (i = 0, len = promiseData.length; i < len; i++) {
          asset = promiseData[i];
          this.data = asset;
        }
      } else {
        this.data = promiseData;
      }
    }

    return Page;

  })();

  angular.module('imago').controller('page', ['promiseData', Page]);

}).call(this);

(function() {
  var TenantSettings;

  TenantSettings = (function() {
    TenantSettings.prototype.data = {};

    TenantSettings.prototype.loaded = false;

    function TenantSettings($http, $rootScope, imagoModel) {
      this.$http = $http;
      this.$rootScope = $rootScope;
      this.imagoModel = imagoModel;
      this.get();
    }

    TenantSettings.prototype.get = function() {
      return this.$http.get(this.imagoModel.host + "/api/settings").then((function(_this) {
        return function(response) {
          var ref;
          _this.tenant = (ref = _.find(response.data, {
            name: 'tenant'
          })) != null ? ref.value : void 0;
          return _this.reorder(response.data);
        };
      })(this));
    };

    TenantSettings.prototype.reorder = function(data) {
      var i, item, j, k, len, len1, len2, ref, ref1, setting, tmp;
      this.data = {};
      for (i = 0, len = data.length; i < len; i++) {
        item = data[i];
        this.data[item.name] = item.value;
      }
      tmp = {};
      ref = this.data.settings;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        item = ref[j];
        tmp[item.name] = item.value;
      }
      this.data.settings = tmp;
      ref1 = ['createsend', 'mailchimp'];
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        setting = ref1[k];
        if (this.data[setting]) {
          if (this.data[setting].connected && this.data[setting].active) {
            this.data[setting].status = 'green';
          } else {
            this.data[setting].status = 'amber';
          }
        }
      }
      this.$rootScope.tenantSettings = this.data;
      this.loaded = true;
      return this.$rootScope.$emit('settings:loaded', this.data);
    };

    return TenantSettings;

  })();

  angular.module('imago').service('tenantSettings', ['$http', '$rootScope', 'imagoModel', TenantSettings]);

}).call(this);

(function() {
  var WebStorage;

  WebStorage = (function() {
    WebStorage.prototype.store = {};

    function WebStorage($window) {
      var e, test;
      this.$window = $window;
      this.valid = true;
      test = 'imagoTestLocal';
      try {
        this.$window.localStorage.setItem(test, test);
        this.$window.localStorage.removeItem(test);
      } catch (error) {
        e = error;
        this.valid = false;
      }
    }

    WebStorage.prototype.get = function(key) {
      var e, value;
      if (this.valid) {
        value = this.$window.localStorage.getItem(key);
        try {
          angular.fromJson(value);
        } catch (error) {
          e = error;
          return value;
        }
        return angular.fromJson(value);
      }
      return this.store[key];
    };

    WebStorage.prototype.set = function(key, value) {
      var err;
      if (this.valid) {
        try {
          return this.$window.localStorage.setItem(key, angular.toJson(value));
        } catch (error) {
          err = error;
          console.log('error on set LocalStorage:', key, angular.toJson(value));
        }
      }
      return this.store[key] = value;
    };

    WebStorage.prototype.remove = function(key) {
      if (this.valid) {
        return this.$window.localStorage.removeItem(key);
      }
      return delete this.store[key];
    };

    WebStorage.prototype.clear = function() {
      if (this.valid) {
        return this.$window.localStorage.clear();
      }
      return this.store = {};
    };

    return WebStorage;

  })();

  angular.module('imago').service('webStorage', ['$window', WebStorage]);

}).call(this);

angular.module('imago').run(['$templateCache', function($templateCache) {$templateCache.put('/imago/not-supported.html','<div ng-if="$ctrl.invalid" ng-class="::{\'mobile\': $ctrl.mobile}" class="imago-not-supported-content"><div ng-if="$ctrl.mobile" class="inner"><h1>Browser not supported!</h1></div><div ng-if="!$ctrl.mobile" class="inner"><h1>Time for change!</h1><p>Please download a new version of your favorite browser.</p><ul><li><a href="http://support.apple.com/downloads/#safari" target="_blank"><div class="icon icon-safari"></div><h2>Safari</h2><span>Download</span></a></li><li><a href="http://www.google.com/chrome" target="_blank"><div class="icon icon-chrome"></div><h2>Chrome</h2><span>Download</span></a></li><li><a href="http://www.opera.com/download" target="_blank"><div class="icon icon-opera"></div><h2>Opera</h2><span>Download</span></a></li><li><a href="http://www.mozilla.org/firefox" target="_blank"><div class="icon icon-firefox"></div><h2>Firefox</h2><span>Download</span></a></li><li><a href="https://www.microsoft.com/en-us/windows/microsoft-edge" target="_blank"><div class="icon icon-ie"></div><h2>IE</h2><span>Download</span></a></li></ul></div></div>');}]);