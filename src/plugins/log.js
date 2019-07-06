/* globals FAINT */
FAINT.plugin('log', function(state, config) {
    "use strict";
    var levels = {
        log: 'debug',
        debug: 'debug',
        warning: 'warn',
        warn: 'warn',
        error: 'error',
        fatal: 'error',
    };



    var log = function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        return log._log.apply(log, [ 'log', args ]);
    };


    log._log = function(level, args) {
        if (!levels.hasOwnProperty(level)) {
            throw new Error('Unknown log level: ' + level);
        }

        level = levels[level];

        log._history.push([level, new Date(), args]);
        
        if (config.console) {
            if (!console)
                return;
            console[level].apply(console, args);
        }

        if (console.size) {
            while(config.size < log._history.length) {
                log._history.shift();
            }
        }
        return log._history.length;
    };

    log._history = [];

    log.history = function() {
        return log._history;
    };
    return log;
},
{
    console: false,
    size: 1024,
},
[]
);
