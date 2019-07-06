/* globals FAINT */
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

