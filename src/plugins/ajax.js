/* globals FAINT, Promise */

FAINT.plugin('ajax',
    function(/* config */) {
        "use strict";

        var count = 0;

        var ajax = function(_cfg) {
            var cfg = {};

            if (typeof _cfg == 'string') {
                _cfg = {url: _cfg, method: 'GET'};
            }

            for (var name in _cfg) {
                cfg[name] = _cfg[name];
            }
            if (cfg.async === undefined) {
                cfg.async = true;
            }

            return new Promise(function(resolve, reject) {
                var queue = cfg.queue;

                delete cfg.success;
                delete cfg.error;
                delete cfg.complete;
                delete cfg.queue;

                if (queue)
                    queue = String(queue);


                cfg.success = function(data) {
                    resolve(data);
                };

                cfg.error = function(jqXHR, textStatus, errorThrown) {
                    switch(jqXHR.status) {
                        case 0:
                            jqXHR.status = 595;
                            break;
                    }
                    jqXHR.textStatus = textStatus;
                    jqXHR.url = cfg.url;
                    jqXHR.errorThrown = errorThrown;
                    reject(jqXHR);
                };

                var started = (new Date()).valueOf();
                function complete() {
                    count--;
                    var finished = (new Date()).valueOf();
                    FAINT.ev(['faint', 'ajax', 'done'],
                        count,
                        (finished - started) / 1000,
                        queue);
                }

                if (queue) {
                    FAINT.semaphore('faint::ajax::' + queue)
                        .then(function(done) {
                            count++;
                            var finished = (new Date()).valueOf();
                            FAINT.ev(['faint', 'ajax', 'start'],
                                count, (finished - started) / 1000, queue);
                            cfg.complete = function() {
                                try {
                                    done();
                                } finally {
                                    complete();
                                }
                            };
                            $.ajax(cfg);
                        });
                } else {
                    count++;
                    FAINT.ev(['faint', 'ajax', 'start'], count, 0);
                    cfg.complete = complete;
                    $.ajax(cfg);
                }
            });
        };

        return ajax;

    },
    {},
    []
);
