var EV;

EV = function(key) {
    "use strict";
    key = EV._normalize_key(key);
    var args = arguments.slice(1);
    args.unshift(key);
    EV._queue.push([key, args]);
    if (EV._queue.length == 1) {
        setTimeout(EV._producer, 1);
    }
};

EV.on = function(key, cb) {
    "use strict";
    key = EV._normalize_key(key);

    if (!(key in EV._subscribers))
        EV._subscribers[key] = [];
    EV._subscribers[key].push(cb);
};

EV._normalize_key = function(key) {
    "use strict";
    if (typeof(key) == 'string')
        return key;
    if (typeof(key) == 'object')
        return key.join('::');
    return String(key);
};

EV._queue = [];
EV._subscribers = {};

EV._producer = function() {
    "use strict";
    if (!EV._queue.length)
        return;

    var events = EV._queue;
    EV._queue = [];


    for (var i = 0; i < events; i++) {
        EV._process_message(events[i][0], events[i][1]);
    }
};

EV._process_message = function(key, args) {
    "use strict";
    if (!(key in EV._subscribers))
        return;

    for (var i = 0; i < EV._subscribers[key].length; i++) {
        try {
            EV._subscribers[key][i].apply(EV, args);
        } catch(e) {
            console.error(e);
        }
    }
};
