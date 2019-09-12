/* globals FAINT */
FAINT.plugin('bootstrap',
    function(state, config) {
        "use strict";

        if (!config.content)
            return;

        FAINT.ev.on(['browser', 'init', 'done'], function() {
            FAINT.ejst(
                'faint.bootstrap',
                '%= include(' + JSON.stringify(String(config.page)) + ')'
            )
            .then(function(html) {
                $(config.content).html(html);
            })
            .catch(function(e) {
                FAINT
                    .ejst('error bootstrap', config.error, {error: e})
                    .then(function(html) {
                        console.log(e);
                        $(config.content).html(html);
                    })
                    .catch(function(e) {
                        $(config.content).text(e);
                    });
            });
        });

    },
    {
        content: null,              // selector for content
        page: 'default',
        error:
            '<div class="alert alert-danger">' +
                'Can not load start page: ' +
                '<% if (error instanceof Error) { %>' +
                    '<%= error %>' +
                '<% } else { %>' +
                    '<%= error.statusText %>' +
                    '<dl>' +
                        '<dd>Url</dd>' +
                        '<dt><%= error.url %></dt>' +
                        '<dd>http code</dd>' +
                        '<dt><%= error.status %></dt>' +
                    '</dl>' +
                '<% } %>' +
            '</div>'

    },
    ['ejst', 'browser-init']
);
