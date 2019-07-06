/* globals FAINT, Promise */

FAINT.plugin('bundle', function(state, config) {
    "use strict";

    if (!config)
        config = {};

    var base_url = config.base_url;
    if (base_url) {
        base_url = base_url.replace(/\?.*/).replace(/\/$/, '');
        base_url += '/';
    }

    var cache = {}, i;

    var bundle = function(name) {
        name = String(name).replace(/\?.*$/, '');
        if (!cache.hasOwnProperty(name)) {
            var url = name;
            if (base_url) {
                if (!(url.match(/\w+:\/\//) || url.match(/^\//))) {
                    url = base_url + name;
                }
            }
            if (config.suffix) {
                if (!(name.match(/\w+:\/\//) || name.match(/^\//))) {
                    i = url.lastIndexOf(config.suffix);
                    if (i != -1) {
                        i = url.length - i;
                        i -= config.suffix.length;
                    }

                    if (i != 0) {
                        url += config.suffix;
                    }
                }
            }

            FAINT.ev(['faint', 'bundle', 'load'], name, url);
            var ajax_task = {
                url: url,
                method: 'GET',
                cache: true,
                dataType: 'text',
            };
            if (config.data) {
                ajax_task.data = config.data;
            }
            if (config.queue) {
                ajax_task.queue = config.queue;
            }
            if (config.repeat) {
                ajax_task.repeat = config.repeat;
            }
            cache[name] = FAINT.ajax(ajax_task)
                .then(
                    function(data) {
                        FAINT.ev(['faint', 'bundle', 'loaded'], name, url);
                        return Promise.resolve(data);
                    }
                );
        }

        return cache[name];
    };

    return bundle;
},
{
    base_url: null,
    data: null,
    queue: null,
    repeat: null,
    preload: null,
    suffix: '.html.ej',
},
['ajax']);

