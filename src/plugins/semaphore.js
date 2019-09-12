/* globals FAINT, Promise */
FAINT.plugin('semaphore',
    function(/* config */) {
        "use strict";
        var semaphore = function(name) {
            if (!semaphore._list.hasOwnProperty(name)) {
                semaphore.create(name, 1);
            }
            return new Promise(function(resolve) {
                if (!semaphore._list.hasOwnProperty(name))
                    throw new Error('Semaphore "' + name + '" not exists');

                if (!semaphore._wait[name])
                    semaphore._wait[name] = [];

                semaphore._wait[name].push(function() {
                    semaphore._list[name]--;
                    
                    var done = function() {
                        semaphore._list[name]++;
                        if (semaphore._list[name] <= 0)
                            return;
                        if (!semaphore._wait[name])
                            return;
                        if (!semaphore._wait[name].length)
                            return;

                        var cb = semaphore._wait[name].shift();
                        cb();
                    };
                    
                    resolve(done);
                });

                if (semaphore._list[name] <= 0)
                    return;
                var cb = semaphore._wait[name].shift();
                cb();
            });
        };

        semaphore.create = function(name, count) {
            name = String(name);
            count = parseInt(count || 1);
            if (count < 1)
                throw new Error('Wrong semaphore start value: ' +
                    String(count));
            if (semaphore._list.hasOwnProperty(name))
                throw new Error('Semaphore "' + name + '" exists');

            semaphore._list[name] = count;
        };

        semaphore._list = {};
        semaphore._wait = {};

        return semaphore;
    },
    {},
    []
);
