/* */

var FAINT = {
    _plugin: {},
    _state: 'init',
};

FAINT.init = function(config) {
    "use strict";
    delete FAINT.init;
    var skip, name, dep_name, i, use_plugin = {};

    if (!config) {
        config = {};

        for (name in FAINT._plugin) {
            config[name] = true;
        }
    }

    if (!config.hasOwnProperty('ev'))
        config.ev = true;

    for (name in config) {
        if (!config[name])
            continue;
        if (typeof(config[name]) == 'boolean')
            config[name] = {};
        if (!FAINT._plugin.hasOwnProperty(name)) {
            throw new Error('Unknown plugin: ' + name);
        }

        use_plugin[name] = {
            name: name,
            depends: this._plugin[name].depends,
            constructor: this._plugin[name].constructor,
            config: config[name],
            state: 'init',
        };

        use_plugin[name].depends.push('ev');

        for (i in this._plugin[name].defaults) {
            if (use_plugin[name].config.hasOwnProperty(i))
                continue;
            use_plugin[name].config[i] = this._plugin[name].defaults[i];
        }
    }

    while(true) {
        var count = 0;
        for (name in use_plugin) {
            if (use_plugin[name].state != 'init')
                continue;
            count++;
            skip = false;
            for (i = 0; i < use_plugin[name].depends.length; i++) {
                dep_name = use_plugin[name].depends[i];

                if (dep_name != name) {
                    if (use_plugin[dep_name].state == 'init') {
                        skip = true;
                        break;
                    }
                }
            }
            if (skip)
                continue;

            this[name] =
                use_plugin[name].constructor('init', use_plugin[name].config);
            use_plugin[name].state = 'created'; 
        }
        if (!count)
            break;
    }

    this._state = 'created';
};


FAINT.plugin = function(name, constructor, defaults, depends) {
    "use strict";

    name = String(name);

    if (FAINT._state != 'init') {
        throw new Error('All plugins have to be registered before FAINT.init');
    }

    if (FAINT._plugin.hasOwnProperty(name))
        throw new Error('Plugin "' + name + '" has already registered');
    if (FAINT.hasOwnProperty(name))
        throw new Error('Plugin name "' + name + '" is reserved');

    if (!defaults)
        defaults = {};
    if (!depends)
        depends = [];

    if (typeof(constructor) != 'function') {
        throw new Error('Plugin "' + name + '" has no constructor');
    }

    if ((typeof(depends) != 'object') || (depends.constructor !== Array)) {
        throw new Error('Plugin "' + name + '" has broken depends: ' +
            JSON.stringify(depends));
    }

    this._plugin[name] = {
        name: name,
        constructor: constructor,
        depends: depends,
        defaults: defaults,
    };
};


FAINT.plugin('ev', function() {
    "use strict";
    
    var ev = function(key) {
        key = ev._normalize_key(key);
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        ev._queue.push({key: key, args: args});
        if (ev._queue.length == 1) {
            setTimeout(ev._dispatch, 1);
        }
    };

    ev.on = function(key, dispatcher) {
        if (typeof(dispatcher) != 'function') {
            throw new Error('Usage: ev.on(key, callback)');
        }
        key = ev._normalize_key(key);
        if (!ev._on[key])
            ev._on[key] = [];
        ev._on[key].push(dispatcher);
    };

    ev._dispatch = function() {
        if (!ev._queue.length)
            return;
        var list = ev._queue;
        ev._queue = [];

        for (var i = 0; i < list.length; i++) {
            var key = list[i].key;
            if (!ev._on.hasOwnProperty(key))
                continue;
            for (var j = 0; j < ev._on[key].length; j++) {
                try {
                    ev._on[key][j].apply(key.split('::'), list[i].args);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    };

    ev._normalize_key = function(key) {
        if (key == null)
            return 'null';
        if (typeof(key.join) == 'function' && typeof(key.map) == 'function')
            return key.map(function(a){ return String(a); }).join('::');
        return String(key);
    };

    ev._queue = [];
    ev._on = {};

    return ev;
});
