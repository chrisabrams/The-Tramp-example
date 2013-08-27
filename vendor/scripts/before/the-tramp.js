window.require.define({"the-tramp": function(exports, require, module) {
(function() {
  var TheTramp;

  TheTramp = {
    Application: loader('the-tramp/application'),
    DualView: loader('the-tramp/views/dual_view')
  };

  module.exports = TheTramp;

  if (typeof window === 'object') {
    window.TheTramp = TheTramp;
  }

}).call(this);
}});


window.require.define({"the-tramp/application": function(exports, require, module) {

(function() {

  var Chaplin, DualApplication, Layout, Router, routes, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = loader('underscore');

  Chaplin = loader('chaplin');

  Layout = loader('views/layout/layout');
  //Layout = Chaplin.Layout;

  Router = Chaplin.Router;

  routes = loader('routes');

  module.exports = DualApplication = (function(_super) {
    __extends(DualApplication, _super);

    function DualApplication() {
      _ref = DualApplication.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DualApplication.prototype.initialize = function() {
      this.initMediator();
      if (typeof window === 'undefined') {
        return;
      }
      if (this.initialized) {
        throw new Error('Application#initialize: App was already initialized');
      }
      this.initTemplateHelpers();
      this.initTemplatePartials();
      this.initRouter(routes);
      this.initDispatcher();
      this.initLayout();
      this.initComposer();
      this.initControllers();
      this.startRouting();
      return this.initialized = true;
    };

    DualApplication.prototype.initComposer = function(options) {};

    DualApplication.prototype.initLayout = function() {
      return this.layout = new Layout({
        title: this.title
      });
    };

    DualApplication.prototype.initControllers = function() {};

    DualApplication.prototype.initMediator = function() {};

    DualApplication.prototype.initTemplateHelpers = function() {
      if (this.templateHelpers) {
        return _.each(this.templateHelpers, function(helper) {
          return loader(helper)(Handlebars);
        });
      }
    };

    DualApplication.prototype.initTemplatePartials = function() {};

    return DualApplication;

  })(Chaplin.Application);

}).call(this);
}});


window.require.define({"the-tramp/lib/attrs_to_string": function(exports, require, module) {
(function() {
  var _;

  _ = require('underscore');

  module.exports = function(view) {
    var attributes;
    attributes = view.getAttributes();
    return _.inject(attributes, function(memo, value, key) {
      return memo += " " + key + "=\"" + value + "\"";
    }, "");
  };

}).call(this);
}});


window.require.define({"the-tramp/lib/generate": function(exports, require, module) {
(function() {
  var $, _;

  _ = require('underscore');

  $ = require('jquery');

  module.exports = function(req, __app, handler) {
    var Controller, DualView, Layout, action, controller, getHtmlFromViews, html, index, layout, layoutViews, prop;
    Controller = require(__app + ("/controllers/" + handler.route.controller + "_controller"));
    DualView = require(__app + '/views/base/dual_view');
    Layout = require(__app + "/views/layout/layout");
    html = '';
    layout = new Layout;
    layoutViews = {};
    for (index in layout) {
      prop = layout[index];
      if (prop instanceof DualView) {
        layoutViews[index] = prop.getHtml();
      }
    }
    controller = new Controller;
    if (controller.beforeAction != null) {
      controller.beforeAction();
    }
    action = new controller[handler.route.action](req.params);
    getHtmlFromViews = function(view) {
      var $html, attrString, viewHtml;
      viewHtml = view.getHtml();
      attrString = require(__dirname + '/attrs_to_string')(view);
      html = "<" + view.tagName + attrString + ">" + viewHtml + "</" + view.tagName + ">";
      $html = $(html);
      if (view.subviews.length > 0) {
        _.each(view.subviews, function(subview, index) {
          var subviewHtml;
          if (subview instanceof DualView) {
            subviewHtml = subview.getHtml();
            return $html.find(subview.container)[subview.containerMethod](subviewHtml);
          }
        });
      }
      return $html.html();
    };
    for (index in action) {
      prop = action[index];
      if (prop instanceof DualView) {
        html += getHtmlFromViews(prop);
      }
    }
    return {
      html: html,
      layoutViews: layoutViews
    };
  };

}).call(this);
}});


window.require.define({"the-tramp/lib/match": function(exports, require, module) {
(function() {
  var Chaplin;

  Chaplin = require('chaplin');

  module.exports = function(handlers) {
    var match;
    return match = function(pattern, target, options) {
      var action, controller, route, _ref;
      if (arguments.length === 2 && typeof target === 'object') {
        options = target;
        controller = options.controller, action = options.action;
        if (!(controller && action)) {
          throw new Error('Router#match must receive either target or ' + 'options.controller & options.action');
        }
      } else {
        if (typeof options === 'object') {
          controller = options.controller, action = options.action;
          if (controller || action) {
            throw new Error('Router#match cannot use both target and ' + 'options.controller / options.action');
          }
        }
        _ref = target.split('#'), controller = _ref[0], action = _ref[1];
      }
      route = new Chaplin.Route(pattern, controller, action, options);
      return handlers.push({
        route: route
      });
    };
  };

}).call(this);
}});


window.require.define({"the-tramp/router/route": function(exports, require, module) {
(function() {
  var Backbone, Chaplin, Controller, RouteGenerator, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty;

  _ = require('underscore');

  Backbone = require('backbone');

  Chaplin = require('chaplin');

  Controller = Chaplin.Controller;

  module.exports = RouteGenerator = (function() {
    var escapeRegExp;

    escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;

    function RouteGenerator(pattern, controller, action, options) {
      this.pattern = pattern;
      this.controller = controller;
      this.action = action;
      this.handler = __bind(this.handler, this);
      this.addParamName = __bind(this.addParamName, this);
      if (_.isRegExp(this.pattern)) {
        throw new Error('Route: RegExps are not supported.\
        Use strings with :names and `constraints` option of route');
      }
      this.options = options ? _.clone(options) : {};
      if (this.options.name != null) {
        this.name = this.options.name;
      }
      if (this.name && this.name.indexOf('#') !== -1) {
        throw new Error('Route: "#" cannot be used in name');
      }
      if (this.name == null) {
        this.name = this.controller + '#' + this.action;
      }
      this.paramNames = [];
      if (_.has(Controller.prototype, this.action)) {
        throw new Error('Route: You should not use existing controller ' + 'properties as action names');
      }
      this.createRegExp();
    }

    RouteGenerator.prototype.matches = function(criteria) {
      var name, property, _i, _len, _ref;
      if (typeof criteria === 'string') {
        return criteria === this.name;
      } else {
        _ref = ['name', 'action', 'controller'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          property = criteria[name];
          if (property && property !== this[name]) {
            return false;
          }
        }
        return true;
      }
    };

    RouteGenerator.prototype.reverse = function(params) {
      var index, name, url, value, _i, _len, _ref;
      url = this.pattern;
      if (_.isArray(params)) {
        if (params.length < this.paramNames.length) {
          return false;
        }
        index = 0;
        url = url.replace(/[:*][^\/\?]+/g, function(match) {
          var result;
          result = params[index];
          index += 1;
          return result;
        });
      } else {
        _ref = this.paramNames;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          value = params[name];
          if (value === void 0) {
            return false;
          }
          url = url.replace(RegExp("[:*]" + name, "g"), value);
        }
      }
      if (this.test(url)) {
        return url;
      } else {
        return false;
      }
    };

    RouteGenerator.prototype.createRegExp = function() {
      var pattern;
      pattern = this.pattern.replace(escapeRegExp, '\\$&').replace(/(?::|\*)(\w+)/g, this.addParamName);
      return this.regExp = RegExp("^" + pattern + "(?=\\?|$)");
    };

    RouteGenerator.prototype.addParamName = function(match, paramName) {
      this.paramNames.push(paramName);
      if (match.charAt(0) === ':') {
        return '([^\/\?]+)';
      } else {
        return '(.*?)';
      }
    };

    RouteGenerator.prototype.test = function(path) {
      var constraint, constraints, matched, name, params;
      matched = this.regExp.test(path);
      if (!matched) {
        return false;
      }
      constraints = this.options.constraints;
      if (constraints) {
        params = this.extractParams(path);
        for (name in constraints) {
          if (!__hasProp.call(constraints, name)) continue;
          constraint = constraints[name];
          if (!constraint.test(params[name])) {
            return false;
          }
        }
      }
      return true;
    };

    RouteGenerator.prototype.handler = function(path, options) {
      var params, query, route, _ref;
      options = options ? _.clone(options) : {};
      query = (_ref = options.query) != null ? _ref : this.getCurrentQuery();
      params = this.buildParams(path, query);
      return route = {
        path: path,
        action: this.action,
        controller: this.controller,
        name: this.name,
        query: query
      };
    };

    RouteGenerator.prototype.getCurrentQuery = '';

    RouteGenerator.prototype.buildParams = function(path, query) {
      return _.extend({}, this.extractQueryParams(query), this.extractParams(path), this.options.params);
    };

    RouteGenerator.prototype.extractParams = function(path) {
      var index, match, matches, paramName, params, _i, _len, _ref;
      params = {};
      matches = this.regExp.exec(path);
      _ref = matches.slice(1);
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        match = _ref[index];
        paramName = this.paramNames.length ? this.paramNames[index] : index;
        params[paramName] = match;
      }
      return params;
    };

    RouteGenerator.prototype.extractQueryParams = function(query) {
      var current, field, pair, pairs, params, value, _i, _len, _ref;
      params = {};
      if (!query) {
        return params;
      }
      pairs = query.split('&');
      for (_i = 0, _len = pairs.length; _i < _len; _i++) {
        pair = pairs[_i];
        if (!pair.length) {
          continue;
        }
        _ref = pair.split('='), field = _ref[0], value = _ref[1];
        if (!field.length) {
          continue;
        }
        field = decodeURIComponent(field);
        value = decodeURIComponent(value);
        current = params[field];
        if (current) {
          if (current.push) {
            current.push(value);
          } else {
            params[field] = [current, value];
          }
        } else {
          params[field] = value;
        }
      }
      return params;
    };

    return RouteGenerator;

  })();

}).call(this);
}});


window.require.define({"the-tramp/templates/helpers/common": function(exports, require, module) {
(function() {
  module.exports = function(Handlebars) {
    return Handlebars.registerHelper('json', function(context) {
      return JSON.stringify(context);
    });
  };

}).call(this);
}});


window.require.define({"the-tramp/views/dual_view": function(exports, require, module) {
(function() {
  var Chaplin, DualView, Handlebars, View, fs, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = loader('underscore');

  Chaplin = loader('chaplin');

  View = loader('views/base/view');

  if (typeof window === 'undefined') {
    fs = require('fs');
    Handlebars = require('hbs').handlebars;
  } else {
    Handlebars = window.Handlebars;
  }

  module.exports = DualView = (function(_super) {
    __extends(DualView, _super);

    function DualView() {
      _ref = DualView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DualView.prototype.preRendered = false;

    DualView.prototype.initialize = function() {
      var el;
      if (typeof window === 'object') {
        if (this.id) {
          el = "#" + this.id;
          if ($(el).length > 0) {
            this.el = el;
            this.$el = $(this.el);
            this.preRendered = true;
          }
        } else if (this.className) {
          el = "#" + this.className;
          if ($(el).length > 0) {
            this.el = el;
            this.$el = $(this.el);
            this.preRendered = true;
          }
        }
      } else {
        this.attach = function() {};
        this.delegate = function() {};
        this.delegateEvents = function() {};
        this.delegateListeners = function() {};
      }
      return DualView.__super__.initialize.apply(this, arguments);
    };

    DualView.prototype.attach = function() {
      if (this.preRendered) {
        this.trigger('addedToDOM');
        return false;
      }
      return DualView.__super__.attach.apply(this, arguments);
    };

    DualView.prototype.getAttributes = function() {
      var attributes;
      attributes = {};
      if (this.id) {
        attributes.id = this.id;
      }
      if (this.className) {
        attributes["class"] = this.className;
      }
      _.each(this.options, function(value, key) {
        var id;
        if (value != null) {
          if (key === "model") {
            key = "model_id";
            id = value[value.idAttribute];
            if (id == null) {
              return;
            }
            value = id.toString();
          } else if (key === "collection") {
            key = "collection_params";
            value = _.escape(JSON.stringify(value.params));
          }
          if (!_.isObject(value) && !_.include(this.nonAttributeOptions, key)) {
            return attributes["data-" + key] = _.escape(value);
          }
        }
      });
      return attributes;
    };

    DualView.prototype.getHtml = function() {
      var attrString, attributes, html, innerHtml;
      innerHtml = this.getInnerHtml();
      attributes = this.getAttributes();
      attrString = _.inject(attributes, function(memo, value, key) {
        return memo += " " + key + "=\"" + value + "\"";
      }, "");
      html = "<" + this.tagName + attrString + ">" + innerHtml + "</" + this.tagName + ">";
      return html;
    };

    DualView.prototype.getInnerHtml = function() {
      var html;
      html = this.getTemplateFunction(this.getTemplateData());
      return html;
    };

    DualView.prototype.getTemplateFunction = function(context) {
      var result, source, template;
      if (typeof window === 'object') {
        if (this.template) {
          return this._cachedTemplateFunction || (this._cachedTemplateFunction = require("templates/" + this.template));
        } else {
          return '';
        }
      } else {
        if (this.template) {
          if (typeof context !== 'object') {
            if (this.model) {
              context = this.model.toJSON();
            } else {
              context = {};
            }
          }
          source = fs.readFileSync(process.cwd() + ("/app/templates/" + this.template + ".hbs"), "utf8");
          template = Handlebars.compile(source);
          result = template(context);
          return result;
        } else {
          return '';
        }
      }
    };

    DualView.prototype.render = function() {
      return DualView.__super__.render.apply(this, arguments);
    };

    return DualView;

  })(View);

}).call(this);
}});

