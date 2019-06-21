/* globals Promise, module, ejst */

function Faint() {
    "use strict";
    var _this = this;
    this.defaults = {
    };
    this.config = {
        template_load_error: 
            '<div class="alert alert-danger">' +
                'Can not load template <%= name %>.' +
                'HTTP-response: <%= http_code %>' +
            '</div>',
        template_error:
            '<div class="alert alert-danger">' +
                'Rendering error: <%= error %>' +
            '</div>'
    };
    this.helpers = {
        include: function(name, stash) {
            return Promise.resolve(name, stash);
        },
    };

    this.bundle = {};

    this.add_helper = function(name, cb) {
        if (name in this.helpers) {
            throw new Error('Helper "' + name + '" has already exists');
        }
        this.helpers[name] = cb;
    };

    this.add_helper('include', function(name, stash) {
        stash = _this._make_stash(stash);
        return _this
            .get_template(name)
            .then(function(template) {
                return ejst(name, template, stash)
                        .then(function(rendered) {
                            return ejst.bytestream(rendered);
                        });
            });
    });

    this._make_stash = function(stash) {
        var res = {};
        var name;

        for (name in this.defaults) {
            res[name] = this.defaults[name];
        }
        if (stash) {
            for (name in stash) {
                res[name] = stash[name];
            }
        }
        for (name in this.helpers) {
            res[name] = this.helpers[name];
        }
        return res;
    };

    this.get_template = function(name) {
        name = String(name);

        if (name.match(/^\//)) {
            name = name.substring(1);
        }

        if (name in _this.bundle) {
            return Promise.resolve(_this.bundle[name]);
        }
    };

    this.render = function(name, stash) {
        _this = this;
        stash = this._make_stash(stash);

        var layout = stash.layout;
        stash.layout = null;

        this.get_template(name)
            .then(function(template) {
                return ejst(name, template, stash);
            })
            .then(function(rendered) {
                if (!layout) {
                    return rendered;
                }

                stash = _this._make_stash(stash);
                stash.layout = null;
                stash.content = ejst.bytestream(rendered);

                return _this
                    .get_template(layout)
                    .then(function(ltemplate) {
                        return ejst(layout, ltemplate, stash);
                    });
            });
    };
}




if (module) {
    module.exports = {
        faint: Faint
    };
}
