/* global FAINT */
FAINT.plugin('browser-init', function(/* state, config */) {
    "use strict";

    var state = 'start';
    var sections = {};

    FAINT.ev.on(['browser', 'init', 'section', 'begin'], function(name) {
        if (state != 'prepare')
            throw new Error('browser::init::section after init');
        
        if (!sections.hasOwnProperty(name))
            sections[name] = [];

        sections[name].push(true);

        if (name != 'faint-browser-init')
            return;

        FAINT.ev.later(['browser', 'init', 'section', 'done'],
            'faint-browser-init');
    });

    FAINT.ev.on(['browser', 'init', 'section', 'done'], function(name) {
        if (state != 'prepare') 
            throw new Error('browser::init::section after init');
        if (!sections.hasOwnProperty(name))
            throw new Error('browser::init::section::done without begin');

        sections[name].shift();

        for (name in sections) {
            if (sections[name].length)
                return;
        }

        state = 'done';
        FAINT.ev(['browser', 'init', 'done']);
    });

    $(window).on('load', function() {
        if (state != 'start')
            return;
        state = 'prepare';
        FAINT.ev(['browser', 'init', 'prepare']);
        FAINT.ev(['browser', 'init', 'section', 'begin'], 'faint-browser-init');
    });

});
