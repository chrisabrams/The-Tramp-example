var loader = (function() {
  var modules = {};
  var cache = {};

  var dummy = function() {return function() {};};
  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, dummy(), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var loader = function(path) {
    if (cache.hasOwnProperty(path)) return cache[path];
    if (modules.hasOwnProperty(path)) return initModule(path, modules[path]);

    if(typeof window == 'object') {
      if (path == 'backbone') return Backbone;
      if (path == 'chaplin') return Chaplin;
      if (path == 'underscore') return _;
      return require(path);
    }

    if(typeof window == 'undefined') {
      if (path == 'backbone') return require(process.cwd() + '/node_modules/backbone');
      if (path == 'chaplin') return require(process.cwd() + '/node_modules/chaplin');
      if (path.indexOf('straxel') > -1) return require(process.cwd() + '/node_modules/straxel.js/src/' + path);
      if (path == 'underscore') return require(process.cwd() + '/node_modules/underscore');
      if (path == 'backbone-validation') return require(process.cwd() + '/node_modules/backbone-validation');
      return require(__app + '/' + path);
    }
    
    //throw new Error('Cannot find module "' + path + '"');
  };

  loader.register = function(bundle, fn) {
    modules[bundle] = fn;
  };
  return loader;
})();

if(typeof window == 'object') {
  window.loader = loader;
}

else {
  module.exports = loader;
}
