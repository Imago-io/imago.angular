var App;

App = (function() {
  function App() {
    return ['lodash'];
  }

  return App;

})();

angular.module('imago', new App());

angular.module('lodash', []).factory('_', function() {
  return window._();
});

var ImagoClick;

ImagoClick = (function() {
  function ImagoClick($parse) {
    return {
      link: function(scope, element, attrs) {
        var clickHandler;
        clickHandler = angular.isFunction(attrs.imagoClick) ? clickExpr : $parse(attrs.imagoClick);
        element.on('click', function(evt) {
          var callback;
          callback = function() {
            return clickHandler(scope, {
              $event: evt
            });
          };
          return scope.$apply(callback);
        });
        return element.onclick = angular.noop;
      }
    };
  }

  return ImagoClick;

})();

angular.module('imago').directive('imagoClick', ['$parse', ImagoClick]);

var imagoModel,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

imagoModel = (function() {
  function imagoModel($rootScope, $http, $location, $document, $q, imagoUtils, imagoWorker, imagoSettings) {
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$location = $location;
    this.$document = $document;
    this.$q = $q;
    this.imagoUtils = imagoUtils;
    this.imagoWorker = imagoWorker;
    this.imagoSettings = imagoSettings;
    this.prepareCreation = bind(this.prepareCreation, this);
    this.isDuplicated = bind(this.isDuplicated, this);
    this.batchChange = bind(this.batchChange, this);
    this.batchAddTag = bind(this.batchAddTag, this);
    this.reorder = bind(this.reorder, this);
    this.reindexAll = bind(this.reindexAll, this);
    this.reSort = bind(this.reSort, this);
    this.paste = bind(this.paste, this);
    this.move = bind(this.move, this);
    this.copy = bind(this.copy, this);
    this.trash = bind(this.trash, this);
    this["delete"] = bind(this["delete"], this);
    this.update = bind(this.update, this);
    this.add = bind(this.add, this);
    this.updateCount = bind(this.updateCount, this);
    this.filterAssets = bind(this.filterAssets, this);
    this.findIdx = bind(this.findIdx, this);
    this.find = bind(this.find, this);
    this.findByAttr = bind(this.findByAttr, this);
    this.findParent = bind(this.findParent, this);
    this.findChildren = bind(this.findChildren, this);
    this.create = bind(this.create, this);
    this.populateData = bind(this.populateData, this);
    this.addAsset = bind(this.addAsset, this);
    this.getData = bind(this.getData, this);
    this.getLocalData = bind(this.getLocalData, this);
    this.assets = {
      get: (function(_this) {
        return function(id) {
          return _this.$http.get(_this.imagoSettings.host + "/api/assets/" + id);
        };
      })(this),
      create: (function(_this) {
        return function(assets) {
          return _this.$http.post(_this.imagoSettings.host + "/api/assets", assets);
        };
      })(this),
      update: (function(_this) {
        return function(item) {
          return _this.$http.put(_this.imagoSettings.host + "/api/assets/" + item._id, item);
        };
      })(this),
      "delete": (function(_this) {
        return function(id) {
          return _this.$http["delete"](_this.imagoSettings.host + "/api/assets/" + id);
        };
      })(this),
      trash: (function(_this) {
        return function(assets) {
          return _this.$http.post(_this.imagoSettings.host + "/api/assets/trash", assets);
        };
      })(this),
      move: (function(_this) {
        return function(items, src, dest) {
          var data;
          data = {
            src: src,
            dest: dest,
            items: items
          };
          return _this.$http.post(_this.imagoSettings.host + "/api/assets/move", data);
        };
      })(this),
      copy: (function(_this) {
        return function(items, src, dest) {
          var data;
          data = {
            src: src,
            dest: dest,
            items: items
          };
          return _this.$http.post(_this.imagoSettings.host + "/api/assets/copy", data);
        };
      })(this),
      batch: (function(_this) {
        return function(list) {
          var defer, j, len, promises, request;
          defer = _this.$q.defer();
          promises = [];
          list = _.chunk(list, 100);
          for (j = 0, len = list.length; j < len; j++) {
            request = list[j];
            promises.push(_this.$http.put(_this.imagoSettings.host + "/api/assets/update", {
              assets: request
            }));
          }
          _this.$q.all(promises).then(function() {
            return defer.resolve();
          });
          return defer.promise;
        };
      })(this),
      download: (function(_this) {
        return function(ids, res) {
          return _this.$http.post(_this.imagoSettings.host + "/api/assets/download", {
            assets: ids,
            resolution: res
          });
        };
      })(this),
      pdfRequest: (function(_this) {
        return function(ids, orientation) {
          console.log('imagomodel pdfRequest');
          return _this.$http.post(_this.imagoSettings.host + "/api/assets/pdf", {
            assets: ids,
            orientation: orientation
          });
        };
      })(this),
      repair: (function(_this) {
        return function(id) {
          return _this.$http.put(_this.imagoSettings.host + "/api/assets/repairorder", {
            _id: id
          });
        };
      })(this)
    };
  }

  imagoModel.prototype.data = [];

  imagoModel.prototype.currentCollection = void 0;

  imagoModel.prototype.search = function(query) {
    var defer, params;
    params = _.map(query, this.formatQuery);
    if (!params.length) {
      defer = this.$q.defer();
      defer.resolve();
      return defer.promise;
    }
    return this.$http.post(this.imagoSettings.host + "/api/search", angular.toJson(params));
  };

  imagoModel.prototype.getLocalData = function(query, options) {
    var asset, defer, key, localQuery, path, value;
    if (options == null) {
      options = {};
    }
    defer = this.$q.defer();
    for (key in options) {
      value = options[key];
      if (key === 'localData' && value === false) {
        defer.reject(query);
      }
    }
    for (key in query) {
      value = query[key];
      if (key === 'fts') {
        defer.reject(query);
      } else if (key === 'collection') {
        query = this.imagoUtils.renameKey('collection', 'path', query);
        path = value;
      } else if (key === 'kind') {
        query = this.imagoUtils.renameKey('kind', 'type', query);
      } else if (key === 'metakind') {
        query = this.imagoUtils.renameKey('metakind', 'type', query);
      } else if (key === 'path') {
        path = value;
      }
    }
    if ((path != null ? path.slice(-1) : void 0) === '/') {
      path = path.substring(0, path.length - 1);
      query.path = path;
    }
    if (path) {
      localQuery = {
        'path': _.isString(path) ? path : _.first(path)
      };
      asset = this.find(localQuery);
      if (asset) {
        asset.assets = this.findChildren(asset);
        if ((asset.count || asset.assets.length) || asset.count === 0) {
          if (asset.assets.length !== asset.count || asset.count === 0) {
            defer.reject(query);
          } else {
            asset.assets = this.filterAssets(asset.assets, query);
            defer.resolve(asset);
          }
        } else {
          defer.resolve(asset);
        }
      } else {
        defer.reject(query);
      }
    } else {
      defer.reject(query);
    }
    return defer.promise;
  };

  imagoModel.prototype.getData = function(query, options) {
    var data, defer, fetches, promises, rejected, resolve;
    if (options == null) {
      options = {};
    }
    defer = this.$q.defer();
    query = angular.copy(query);
    if (!query) {
      query = this.$location.path();
    }
    if (_.isString(query)) {
      query = [
        {
          path: query
        }
      ];
    }
    query = this.imagoUtils.toArray(query);
    promises = [];
    fetches = [];
    data = [];
    rejected = [];
    resolve = (function(_this) {
      return function() {
        fetches.push(_this.search(rejected).then(function(response) {
          var j, len, ref, res, results;
          if (rejected != null ? rejected.length : void 0) {
            console.log('not in the model. fetching...', rejected);
          }
          if (!(response != null ? response.data : void 0)) {
            return;
          }
          ref = response.data;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            res = ref[j];
            results.push(data.push(_this.create(res)));
          }
          return results;
        }));
        return _this.$q.all(fetches).then(function(resolve) {
          var ref, ref1;
          if (options.title) {
            _this.$document.prop('title', options.title);
          } else if (data.length === 1 && ((ref = data[0].fields) != null ? (ref1 = ref.title) != null ? ref1.value : void 0 : void 0)) {
            _this.$document.prop('title', data[0].fields.title.value);
          } else if (data.length === 1 && data[0].name) {
            _this.$document.prop('title', data[0].name);
          }
          return defer.resolve(data);
        });
      };
    })(this);
    _.forEach(query, (function(_this) {
      return function(value) {
        return promises.push(_this.getLocalData(value, options).then(function(result) {
          var worker;
          if (result.assets) {
            worker = {
              assets: result.assets,
              order: result.sortorder,
              path: _this.imagoSettings.sort_worker
            };
            return fetches.push(_this.imagoWorker.work(worker).then(function(response) {
              result.assets = response.assets;
              data.push(result);
              return data = _.flatten(data);
            }));
          } else {
            data.push(result);
            return data = _.flatten(data);
          }
        }, function(reject) {
          return rejected.push(reject);
        }));
      };
    })(this));
    this.$q.all(promises).then(function(response) {
      return resolve();
    });
    return defer.promise;
  };

  imagoModel.prototype.formatQuery = function(query) {
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
  };

  imagoModel.prototype.addAsset = function(asset) {
    if (!this.find({
      '_id': asset._id
    })) {
      this.data.push(asset);
    }
    return this.populateData(asset.assets);
  };

  imagoModel.prototype.populateData = function(assets) {
    var asset, j, len, results;
    if (!_.isArray(assets)) {
      return;
    }
    results = [];
    for (j = 0, len = assets.length; j < len; j++) {
      asset = assets[j];
      results.push(this.addAsset(asset));
    }
    return results;
  };

  imagoModel.prototype.getById = function(id) {
    var asset, defer;
    defer = this.$q.defer();
    asset = this.find({
      '_id': id
    });
    if (asset) {
      asset.assets = this.findChildren(asset);
      defer.resolve(asset);
    } else {
      this.assets.get(id).then(function(response) {
        return defer.resolve(response.data);
      });
    }
    return defer.promise;
  };

  imagoModel.prototype.create = function(data) {
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
    return data;
  };

  imagoModel.prototype.findChildren = function(asset) {
    return _.filter(this.data, {
      parent: asset._id
    });
  };

  imagoModel.prototype.findParent = function(asset) {
    return _.find(this.data, {
      '_id': asset.parent
    });
  };

  imagoModel.prototype.findByAttr = function(options) {
    if (options == null) {
      options = {};
    }
    return _.filter(this.data, options);
  };

  imagoModel.prototype.find = function(options) {
    if (options == null) {
      options = {};
    }
    return _.find(this.data, options);
  };

  imagoModel.prototype.findIdx = function(options) {
    if (options == null) {
      options = {};
    }
    return _.findIndex(this.data, options);
  };

  imagoModel.prototype.filterAssets = function(assets, query) {
    var j, key, len, params, value;
    query = _.omit(query, 'path');
    if (_.keys(query).length) {
      for (key in query) {
        value = query[key];
        for (j = 0, len = value.length; j < len; j++) {
          params = value[j];
          if (key !== 'path') {
            assets = _.filter(assets, function(asset) {
              var elem, k, len1, ref;
              if ((ref = asset.fields) != null ? ref.hasOwnProperty(key) : void 0) {
                value = asset.fields[key]['value'];
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
                  for (k = 0, len1 = value.length; k < len1; k++) {
                    elem = value[k];
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
                if (_.isNumber(value)) {
                  if (ParseFloat(value === ParseFloat(params))) {
                    return true;
                  }
                }
                return false;
              }
            });
          }
        }
      }
    }
    return assets;
  };

  imagoModel.prototype.updateCount = function(parent, number) {
    parent.count = parent.count + number;
    return this.update(parent, {
      stream: false
    });
  };

  imagoModel.prototype.add = function(assets, options) {
    var asset, defer, j, len;
    if (options == null) {
      options = {};
    }
    defer = this.$q.defer();
    if (_.isUndefined(options.stream)) {
      options.stream = true;
    }
    if (_.isUndefined(options.push)) {
      options.push = true;
    }
    if (options.save) {
      this.assets.create(assets).then((function(_this) {
        return function(result) {
          var asset, j, len, ref;
          if (options.push) {
            ref = result.data.data;
            for (j = 0, len = ref.length; j < len; j++) {
              asset = ref[j];
              _this.data.push(asset);
            }
          }
          defer.resolve(result.data.data);
          if (options.stream) {
            return _this.$rootScope.$emit('assets:add', result.data.data);
          }
        };
      })(this));
    } else {
      if (options.push) {
        for (j = 0, len = assets.length; j < len; j++) {
          asset = assets[j];
          this.data.push(asset);
        }
        defer.resolve();
      }
      if (options.stream) {
        this.$rootScope.$emit('assets:add', assets);
      }
    }
    return defer.promise;
  };

  imagoModel.prototype.update = function(data, options) {
    var asset, attribute, copy, defer, idx, j, len, query;
    if (options == null) {
      options = {};
    }
    defer = this.$q.defer();
    if (_.isUndefined(options.stream)) {
      options.stream = true;
    }
    attribute = (options.attribute ? options.attribute : '_id');
    copy = angular.copy(data);
    if (_.isPlainObject(copy)) {
      query = {};
      query[attribute] = copy[attribute];
      if (!copy[attribute]) {
        return;
      }
      if (copy.assets) {
        delete copy.assets;
      }
      idx = this.findIdx(query);
      if (idx !== -1) {
        this.data[idx] = _.assign(this.data[idx], copy);
      } else {
        this.data.push(copy);
      }
      if (options.save) {
        if (copy.base64_url) {
          delete copy.base64_url;
        }
        this.assets.update(copy).then(function() {
          return defer.resolve();
        });
      }
    } else if (_.isArray(copy)) {
      for (j = 0, len = copy.length; j < len; j++) {
        asset = copy[j];
        query = {};
        query[attribute] = asset[attribute];
        if (asset.assets) {
          delete asset.assets;
        }
        idx = this.findIdx(query);
        if (idx !== -1) {
          _.assign(this.data[idx], asset);
        } else {
          this.data.push(asset);
        }
        if (asset.base64_url) {
          delete asset.base64_url;
        }
      }
      if (options.save) {
        this.assets.batch(copy).then(function() {
          return defer.resolve();
        });
      } else {
        defer.resolve();
      }
    }
    if (options.stream) {
      this.$rootScope.$emit('assets:update', copy);
    }
    return defer.promise;
  };

  imagoModel.prototype["delete"] = function(assets, options) {
    var asset, defer, j, len;
    if (options == null) {
      options = {};
    }
    if (!assets) {
      return;
    }
    defer = this.$q.defer();
    if (_.isUndefined(options.stream)) {
      options.stream = true;
    }
    for (j = 0, len = assets.length; j < len; j++) {
      asset = assets[j];
      _.remove(this.data, {
        '_id': asset._id
      });
      if (options.save) {
        this.assets["delete"](asset._id);
      }
    }
    defer.resolve(assets);
    if (options.stream) {
      this.$rootScope.$emit('assets:delete', assets);
    }
    return defer.promise;
  };

  imagoModel.prototype.trash = function(assets) {
    var asset, j, len, newAsset, request;
    request = [];
    for (j = 0, len = assets.length; j < len; j++) {
      asset = assets[j];
      newAsset = {
        '_id': asset._id,
        'name': asset.name
      };
      request.push(newAsset);
    }
    this.assets.trash(request);
    return this["delete"](assets);
  };

  imagoModel.prototype.copy = function(assets, sourceId, parentId) {
    var defer;
    defer = this.$q.defer();
    this.paste(assets).then((function(_this) {
      return function(pasted) {
        var asset, j, len, newAsset, request;
        request = [];
        for (j = 0, len = pasted.length; j < len; j++) {
          asset = pasted[j];
          newAsset = {
            '_id': asset._id,
            'order': asset.order,
            'name': asset.name
          };
          request.push(newAsset);
        }
        return _this.assets.copy(request, sourceId, parentId).then(function(result) {
          if (_this.currentCollection.sortorder === '-order') {
            return _this.update(result.data).then(function() {
              return defer.resolve();
            });
          } else {
            _this.update(result.data, {
              stream: false
            });
            return _this.reSort(_this.currentCollection).then(function() {
              return defer.resolve();
            });
          }
        });
      };
    })(this));
    return defer.promise;
  };

  imagoModel.prototype.move = function(assets, sourceId, parentId) {
    var defer;
    defer = this.$q.defer();
    this.paste(assets).then((function(_this) {
      return function(pasted) {
        var asset, formatted, j, len, request;
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
          formatted = {
            '_id': asset._id,
            'order': asset.order,
            'name': asset.name
          };
          request.push(formatted);
        }
        return _this.assets.move(request, sourceId, parentId);
      };
    })(this));
    return defer.promise;
  };

  imagoModel.prototype.paste = function(assets, options) {
    var asset, assetsChildren, checkAsset, defer, j, len, queue;
    if (options == null) {
      options = {};
    }
    defer = this.$q.defer();
    if (_.isUndefined(options.checkdups)) {
      options.checkdups = true;
    }
    assetsChildren = this.findChildren(this.currentCollection);
    checkAsset = (function(_this) {
      return function(asset) {
        var deferAsset, exists, i, original_name;
        deferAsset = _this.$q.defer();
        if (!options.checkdups || _.filter(assetsChildren, {
          name: asset.name
        }).length === 0) {
          deferAsset.resolve(asset);
        } else {
          i = 1;
          exists = true;
          original_name = asset.name;
          while (exists) {
            asset.name = original_name + "_" + i;
            i++;
            exists = (_.filter(assetsChildren, {
              name: asset.name
            }).length ? true : false);
          }
          deferAsset.resolve(asset);
        }
        return deferAsset.promise;
      };
    })(this);
    queue = [];
    for (j = 0, len = assets.length; j < len; j++) {
      asset = assets[j];
      queue.push(checkAsset(asset));
    }
    this.$q.all(queue).then((function(_this) {
      return function(result) {
        return defer.resolve(result);
      };
    })(this));
    return defer.promise;
  };

  imagoModel.prototype.reSort = function(collection) {
    var defer, orderedList;
    defer = this.$q.defer();
    if (!collection.assets || collection.sortorder === '-order') {
      return;
    }
    orderedList = this.reindexAll(collection.assets);
    this.update(orderedList, {
      stream: false,
      save: true
    });
    collection.sortorder = '-order';
    this.update(collection, {
      save: true
    }).then(function() {
      return defer.resolve();
    });
    return defer.promise;
  };

  imagoModel.prototype.reindexAll = function(list) {
    var asset, count, j, key, len, newList, ordered;
    newList = [];
    count = list.length;
    for (key = j = 0, len = list.length; j < len; key = ++j) {
      asset = list[key];
      asset.order = (count - key) * this.imagoSettings.index;
      ordered = {
        '_id': asset._id,
        'order': asset.order
      };
      newList.push(ordered);
    }
    return newList;
  };

  imagoModel.prototype.reorder = function(dropped, list, selection, options) {
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
      minusOrder = this.imagoSettings.index;
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

  imagoModel.prototype.batchAddTag = function(assets) {
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
  };

  imagoModel.prototype.batchChange = function(assets, keyOnly) {
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
  };

  imagoModel.prototype.isDuplicated = function(asset, assets, options) {
    var assetsChildren, defer, exists, findName, i, name, original_name, result;
    if (options == null) {
      options = {};
    }
    if (_.isUndefined(options.rename)) {
      options.rename = false;
    }
    defer = this.$q.defer();
    if (!asset.name) {
      defer.reject(asset.name);
    }
    name = _.kebabCase(asset.name);
    result = void 0;
    assetsChildren = _.filter(assets, (function(_this) {
      return function(chr) {
        if (!chr.name) {
          return false;
        }
        return name === _.kebabCase(chr.name);
      };
    })(this));
    if (assetsChildren.length) {
      if (assetsChildren.length === 1 && assetsChildren[0]._id === asset._id) {
        defer.resolve(false);
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
        defer.resolve(name);
      } else {
        defer.resolve(true);
      }
    } else {
      defer.resolve(false);
    }
    return defer.promise;
  };

  imagoModel.prototype.prepareCreation = function(asset, parent, order, rename) {
    var defer;
    if (rename == null) {
      rename = false;
    }
    defer = this.$q.defer();
    if (!asset.name) {
      defer.reject(asset.name);
    }
    this.isDuplicated(asset, parent.assets, {
      rename: rename
    }).then((function(_this) {
      return function(isDuplicated) {
        var assets, orderedList;
        if (isDuplicated && _.isBoolean(isDuplicated)) {
          return defer.resolve('duplicated');
        } else {
          if (_.isString(isDuplicated)) {
            asset.name = isDuplicated;
          }
          if (order) {
            asset.order = order;
          } else {
            if (parent.sortorder === '-order') {
              assets = parent.assets;
              asset.order = (assets.length ? assets[0].order + _this.imagoSettings.index : _this.imagoSettings.index);
            } else {
              if (parent.assets.length) {
                orderedList = _this.reindexAll(parent.assets);
                _this.update(orderedList, {
                  save: true
                });
                asset.order = orderedList[0].order + _this.imagoSettings.index;
              } else {
                asset.order = _this.imagoSettings.index;
              }
              parent.sortorder = '-order';
              _this.update(parent, {
                save: true
              });
            }
          }
          asset.parent = parent._id;
          return defer.resolve(asset);
        }
      };
    })(this));
    return defer.promise;
  };

  return imagoModel;

})();

angular.module('imago').service('imagoModel', ['$rootScope', '$http', '$location', '$document', '$q', 'imagoUtils', 'imagoWorker', 'imagoSettings', imagoModel]);

var imagoPage;

imagoPage = (function() {
  function imagoPage($rootScope, $location, $state, imagoModel) {
    var ref, ref1;
    $rootScope.fetchingData = true;
    if ((ref = $state.current.data) != null ? ref.path : void 0) {
      this.path = {
        path: $state.current.data.path
      };
    } else if ($location.path() === '/') {
      this.path = {
        path: '/home'
      };
    }
    if ((ref1 = $state.current.data) != null ? ref1.recursive : void 0) {
      this.path || (this.path = {});
      if (!this.path.path) {
        this.path.path = $location.path();
      }
      this.path.recursive = true;
    }
    imagoModel.getData(this.path).then((function(_this) {
      return function(response) {
        var data, i, len, results;
        $rootScope.fetchingData = false;
        results = [];
        for (i = 0, len = response.length; i < len; i++) {
          data = response[i];
          _this.data = data;
          break;
        }
        return results;
      };
    })(this));
  }

  return imagoPage;

})();

angular.module('imago').controller('imagoPage', ['$rootScope', '$location', '$state', 'imagoModel', imagoPage]);

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
      COUNTRIES: ["United States", "Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bonaire", "Bosnia and Herzegovina", "Botswana", "Bouvet", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos Islands", "Colombia", "Comoros", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Damascus", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Great Britain", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territory", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic of the Congo", "Reunion", "Romania", "Russia", "Rwanda", "Saint Barthelemy", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard", "Swaziland", "Sweden", "Switzerland", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "U.S. Virgin Islands", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican", "Venezuela", "Vietnam", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"],
      STATES: {
        AUSTRALIA: ['ACT', 'NSW', 'NT', 'SA', 'TAS', 'QLD', 'VIC', 'WA'],
        CANADA: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK'],
        USA: ['AL', 'AK', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'AR', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY']
      },
      CURRENCIES: ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYR', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LTL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STD', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'USS', 'UYI', 'UYU', 'UZS', 'VEF', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR', 'XOF', 'XPD', 'XPF', 'XPT', 'XSU', 'XTS', 'XUA', 'XXX', 'YER', 'ZAR', 'ZMW', 'ZWL'],
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
        if (typeof str !== 'string') {
          return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
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
          "ß": "ss",
          "@": "at"
        };
        for (key in specialCharMapping) {
          value = specialCharMapping[key];
          s = s.replace(new RegExp(key, 'g'), value);
        }
        return _.deburr(s.replace(/[\.,#¡!?¿@$%\^&\*;:{}='`‘’“”„~()\?><\[\]†‡‹›•™¦©®ª«»¬°¹²³µ¶·º℅ⁿ§¨‣‼№♠♣♦♥←→↑↓♀♂♩♪♬♭]/g, '').replace(/\/|\_|\‾|\ |\\/g, '-').replace(/\-+/g, '-').replace(/^-|-$/g, ''));
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
              return (aa[x] > bb[x] ? 1 : -1);
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
        if (window.CustomEvent) {
          evt = new CustomEvent(name);
        } else {
          evt = document.createEvent(name);
          evt.initCustomEvent(name, true, true);
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
      }
    };
  }

  return imagoUtils;

})();

angular.module('imago').factory('imagoUtils', [imagoUtils]);

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
    var blob, e, error, error1, scriptText;
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
    } catch (error1) {
      e = error1;
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
    defer = this.$q.defer();
    if (!(data && data.path)) {
      defer.reject('nodata or path');
    }
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

var Meta;

Meta = (function() {
  function Meta() {
    return function(input, value) {
      var ref;
      if (!(input && value && ((ref = input.fields) != null ? ref[value] : void 0))) {
        return;
      }
      if (input.fields[value].kind === 'file') {
        return input.fields[value].download_url;
      } else if (input.fields[value].kind === 'markup') {
        return input.fields[value].value.value;
      } else {
        return input.fields[value].value;
      }
    };
  }

  return Meta;

})();

angular.module('imago').filter('meta', [Meta]);

var NotSupported, NotSupportedController;

NotSupported = (function() {
  function NotSupported() {
    return {
      templateUrl: '/imago/not-supported.html',
      bindToController: true,
      controller: 'notSupportedController as supported'
    };
  }

  return NotSupported;

})();

NotSupportedController = (function() {
  function NotSupportedController($scope, $element, $attrs) {
    var browser, browserVersion, i, key, len, option, options, settings, version;
    $scope.mobile = bowser.mobile;
    options = {
      ie: 9,
      firefox: 32,
      chrome: 30,
      safari: 6,
      opera: 23,
      android: 4.3
    };
    settings = $scope.$eval($attrs.notSupported);
    if (_.isArray(settings)) {
      for (i = 0, len = settings.length; i < len; i++) {
        option = settings[i];
        version = option.match(/\d+/g);
        version = Number(version);
        if (!_.isNaN(version)) {
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

angular.module('imago').directive('notSupported', [NotSupported]).controller('notSupportedController', ['$scope', '$element', '$attrs', NotSupportedController]);

var Page;

Page = (function() {
  function Page(promiseData) {
    var asset, i, len;
    for (i = 0, len = promiseData.length; i < len; i++) {
      asset = promiseData[i];
      this.data = asset;
      break;
    }
  }

  return Page;

})();

angular.module('imago').controller('page', ['promiseData', Page]);

var TenantSettings;

TenantSettings = (function() {
  TenantSettings.prototype.data = {};

  TenantSettings.prototype.loaded = false;

  function TenantSettings($http, $rootScope, imagoSettings) {
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.imagoSettings = imagoSettings;
    this.get();
  }

  TenantSettings.prototype.get = function() {
    return this.$http.get(this.imagoSettings.host + "/api/settings").then((function(_this) {
      return function(response) {
        return _this.reorder(response.data);
      };
    })(this));
  };

  TenantSettings.prototype.reorder = function(data) {
    var i, item, j, len, len1, ref, tmp;
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
    this.$rootScope.tenantSettings = this.data;
    this.loaded = true;
    return this.$rootScope.$emit('settings:loaded', this.data);
  };

  return TenantSettings;

})();

angular.module('imago').service('tenantSettings', ['$http', '$rootScope', 'imagoSettings', TenantSettings]);

var WebStorage;

WebStorage = (function() {
  WebStorage.prototype.store = {};

  function WebStorage($window) {
    var e, error, test;
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
    var e, error, value;
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
    var err, error;
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

angular.module("imago").run(["$templateCache", function($templateCache) {$templateCache.put("/imago/not-supported.html","<div ng-if=\"supported.invalid\" ng-class=\"::{\'mobile\': mobile}\" class=\"imago-not-supported\"><div ng-if=\"mobile\" class=\"inner\"><h1>Browser not supported!</h1></div><div ng-if=\"!mobile\" class=\"inner\"><h1>Time for change!</h1><p>Please download a new version of your favorite browser.</p><ul><li><a href=\"http://support.apple.com/downloads/#safari\" target=\"_blank\"><div class=\"icon icon-safari\"></div><h2>Safari</h2><span>Download</span></a></li><li><a href=\"http://www.google.com/chrome\" target=\"_blank\"><div class=\"icon icon-chrome\"></div><h2>Chrome</h2><span>Download</span></a></li><li><a href=\"http://www.opera.com/download\" target=\"_blank\"><div class=\"icon icon-opera\"></div><h2>Opera</h2><span>Download</span></a></li><li><a href=\"http://www.mozilla.org/firefox\" target=\"_blank\"><div class=\"icon icon-firefox\"></div><h2>Firefox</h2><span>Download</span></a></li><li><a href=\"http://windows.microsoft.com/en-us/internet-explorer/download-ie\" target=\"_blank\"><div class=\"icon icon-ie\"></div><h2>IE</h2><span>Download</span></a></li></ul></div></div>");}]);