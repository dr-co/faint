/* globals Promise */

function Bundle(cfg) {      // jshint ignore: line
    "use strict";
    this.config = {
        url: null,
        base_url: null,
        suffix: '.html.ep',
        suffix_match: /\.html\.ep(\?.*)$/,
    };

    this.cache = Promise.resolve({});

    if (cfg) {
        for (var name in this.config) {
            if (name in cfg) {
                this.config = cfg[name];
            }
        }
    }

    if (!this.config.base_url)
        this.config.base_url =
            document.location.pathname.replace(/^(.*)\/.*?/, '$1');

    if (this.config.url) {
        // TODO: load bundle
    }


    this.get_template = function(name) {

        var url = name;
        if (!name.match(/^\w+:\/\//)) {
            if (url.match(/^\//)) {
                url = name.substring(1);
            }

            if (this.config.suffix) {
                if (!url.match(this.config.suffix_match)) {
                    url = url.replace(/(\?.*)?$/, this.config.suffix + '$1');
                }
            }
        }

        return this.cache.then(function(cache) {
            if (name in cache) {
                return Promise.resolve(cache[name]);
            }

            return new Promise(function(resolve, reject) {
                $.ajax({
                    url: url,
                    dataType: 'text',
                    success: function(data) {
                        cache[name] = data;
                        resolve(data);
                    },
                    error: function() {
                        reject('Can not load url: ' + url);
                    }
                });
            });
        });
    };
}

