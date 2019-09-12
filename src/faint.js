var FAINT;

FAINT = {
    _plugin: {
        all: {
            name: 'all',
            constructor: function() { "use strict"; return null; },
            depends: [],
            defaults: {},
        }
    },
    _state: 'init',

    init: function(config) {
        "use strict";
        delete this.init;
        var skip, name, dep_name, i, use_plugin = {}, count;

        if (!config) {
            config = {};

            for (name in this._plugin) {
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
            if (!this._plugin.hasOwnProperty(name)) {
                throw new Error('Unknown plugin: ' + name);
            }

            use_plugin[name] = {
                name: name,
                depends: this._plugin[name].depends,
                constructor: this._plugin[name].constructor,
                config: config[name],
                state: 'init',
                defaults: this._plugin[name].defaults,
            };

            for (i in use_plugin[name].defaults) {
                if (use_plugin[name].config.hasOwnProperty(i))
                    continue;
                use_plugin[name].config[i] = use_plugin[name].defaults[i];
            }
        }


        for (count = 1; count; ) {
            count = 0;
            for (name in use_plugin) {
                /* add dependencies to use_list */
                for (i in use_plugin[name].depends) {
                    dep_name = use_plugin[name].depends[i];
                    if (use_plugin.hasOwnProperty(dep_name))
                        continue;
                    count++;

                    if (!this._plugin.hasOwnProperty(dep_name))
                        throw new Error('Plugin "' + name +
                                        '" depends on unknown "' +
                                        dep_name + '"');

                    use_plugin[dep_name] = {
                        name: dep_name,
                        depends: this._plugin[dep_name].depends,
                        config: this._plugin[dep_name].defaults,
                        constructor: this._plugin[dep_name].constructor,
                        state: 'init',
                        defaults: this._plugin[name].defaults,
                    };
                }
                if (count)
                    break;
            }
        }
            
        for (count = 1; count; ) {
            count = 0;
            for (name in use_plugin) {
                if (use_plugin[name].state != 'init')
                    continue;
                count++;
                skip = false;

                for (i = 0; i < use_plugin[name].depends.length; i++) {
                    dep_name = use_plugin[name].depends[i];
                    if (dep_name == name)
                        continue;

                    if (use_plugin[dep_name].state == 'init') {
                        skip = true;
                        break;
                    }
                }
                if (skip)
                    continue;

                var plugin = use_plugin[name].constructor(
                                    'init',
                                    use_plugin[name].config,
                                    this._plugin[name].defaults);
                
                if (plugin) {
                    this[name] = plugin;
                }

                use_plugin[name].state = 'created'; 
            }
        }

        this._state = 'created';
    },


    plugin: function(name, constructor, defaults, depends) {
        "use strict";

        name = String(name);

        if (this._state != 'init') {
            throw new Error('All plugins have to be registered before init');
        }

        if (this._plugin.hasOwnProperty(name))
            throw new Error('Plugin "' + name + '" has already registered');
        if (this.hasOwnProperty(name))
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

        switch(name) {
            case 'ev':
                this._plugin[name].depends.push('log');
                break;
            case 'log':
                break;
            default:
                this._plugin[name].depends.push('ev');
                this._plugin[name].depends.push('log');
                break;
        }
        this._plugin.all.depends.push(name);
    }
};

