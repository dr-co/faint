// vim: set tabsize=4 et */
/* globals Promise, FAINT */

FAINT.plugin('ejst',
function(state, config, defaults) {
    "use strict";
    var ejst;

    if (!config) {
        config = {};
    }
    if (!config.helpers) {
        config.helpers = {};
    }

    function good_identifier(name) {
        switch(name) {
                case '___q':
                case '___i':
                case 'var':
                case 'let':
                case 'function':
                    return false;
                default:
                    return true;
        }
    }

    ejst = function(name, template, stash) {
        if (!stash)
            stash = {};

        var body = '(function() { return function(';
        var args = [];
        var arg_name;

        for (arg_name in stash) {
            if (!good_identifier(arg_name))
                continue;

            if (config.helpers.hasOwnProperty(arg_name))
                continue;
            body += arg_name;
            body += ', ';
            args.push(stash[arg_name]);
        }
        
        for (arg_name in defaults.helpers) {
            if (!good_identifier(arg_name))
                continue;
            if (config.helpers.hasOwnProperty(arg_name))
                continue;
            body += arg_name;
            body += ', ';
            args.push(defaults.helpers[arg_name]);
        }
        
        for (arg_name in config.helpers) {
            if (!good_identifier(arg_name))
                continue;
            body += arg_name;
            body += ', ';
            args.push(config.helpers[arg_name]);
        }
        
        body += '___q, ___i) { ';
        body += ejst._compile(template);
        body += '\n}; })();';

        return ejst._render(name, body, args);
    };

    ejst._parse = function(template, text, code) {
        var _text = function(t) {
            if (t == '')
                return;
            text(t);
        };

        var _code = function(t) {
            if (t == '')
                return;
            code(t);
        };

        var lines = template.split("\n");

        var st = 'text';
        var l;
        var code_text;
        for (var i = 0; i <  lines.length; i++) {
            var line = lines[i];

            var redo = true;
            while(redo) {
                redo = false;
                switch(st) {
                    case 'text': {
                        l = /^(\s*)%(.*)/.exec(line);
                        if (l != null) {
                            _text(l[1]);
                            _code(l[2]);
                            if (i < lines.length - 1)
                                _text("\n");
                            break;
                        }
                    } // jshint ignore: line
                    case 'mtext': {
                        l = /^(.*?)<%(.*)/.exec(line);
                        if (l == null) {
                            if (i < lines.length - 1)
                                _text(line + "\n");
                            else
                                _text(line);
                            st = 'text';
                            break;
                        }
                        _text(l[1]);
                        code_text = '';
                        line = l[2];
                        st = 'code';
                    } // jshint ignore: line
                    case 'code': {
                        l = /^(.*?)%>(.*)/.exec(line);
                        if (l == null) {
                            code_text += line + "\n";
                            break;
                        }
                        _code(code_text + l[1]);
                        line = l[2];
                        redo = true;
                        st = 'mtext';
                        code_text = null;
                        break;
                    }
                }
            }
        }
        if (code_text != null) {
            _text("<%" + code_text + "\n");
        }
    };

    ejst._compile = function(template) {
        var res = '';
        var code = function(c) {
            if (c.match(/^==/)) {
                res += "___i(" + c.replace(/^==/, '') + ");";
                return;
            }

            if (c.match(/^=/)) {
                res += "___q(" + c.replace(/^=/, '') + ");";
                return;
            }
            res += c;
        };
        var text = function(t) {
            res += "___i(" + t.split("\n").map(
                function(a) {
                    return JSON.stringify( a );
                }
            ).join("+" + JSON.stringify("\n") + "+\n") + ");";
        };

        ejst._parse(template, text, code);
        return res;
    };

    ejst.xmlescape = function(text) {
        if (typeof(text) == 'object' && typeof(text.bytestream) == 'function') {
            return text.bytestream();
        }
        return String(text)
                    .replace(/\&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
    };

    ejst._render = function(name, btemplate, ___args) {
        var ___res = [];
        var ___foo;
        ___args.push(function(t) {      // ___q
            if (typeof(t) == 'object' && typeof(t.then) == 'function') {
                ___res.push(
                    t.then(function(item) { return ejst.xmlescape(item); })
                );
                return;
            }
            ___res.push(ejst.xmlescape(t));
        });
        ___args.push(function(t) {      // ___i
            if (typeof(t) == 'object' && typeof(t.then) == 'function') {
                ___res.push(t);
                return;
            }
            ___res.push(String(t));
        });

        try {
            ___foo = eval(btemplate);   // jshint ignore: line
        } catch (e) {
            return Promise.reject(
                new Error(
                    'Syntax error at template "' + name + '": ' + e
                )
                
            );
        }

        try {
            ___foo.apply(null, ___args);
        } catch (e) {
            if (e.stack) {
                var line = e.stack.split(/\n/)[0];
                if (line) {
                    var pos = /.*eval.*:(\d+):(\d+)\)?$/.exec(line);
                    if (pos) {
                        return Promise.reject(
                            new Error(
                                'Template error at "' +
                                name + '" (at line ' + pos[1] +
                                '): ' + e
                            )
                        );
                    }
                }
            }
            return Promise.reject(new Error(
                'Template error at "' + name + '": ' + e)
            );
        }
        return Promise.all(___res).then(function(lst) { return lst.join(''); });
    };


    ejst.bytestream = function(str) {
        return {
            bytestream: function() { return str; },
            toString: function() { return str; }
        };
    };

    ejst.helper = function(name, cb) {
        if (!good_identifier(name))
            throw new Error('Bad identifier: ' + name);
        if (config.helpers.hasOwnProperty(name))
            throw new Error('Helper "' + name + '" has already exists');

        config.helpers[name] = cb;
    };

    ejst._cfg = config;

    ejst._include_error = function(e) {
        return FAINT.bundle('include-error')
                    .then(function(template) {
                        return FAINT.ejst(
                            'include-error',
                            template,
                            {error: e}
                        )
                        .then(
                            FAINT
                                .ejst
                                .bytestream
                        );
                    });
    };

    return ejst;
},
{
    helpers: {
        include: function(tplname, stash) {
            "use strict";
            if (!stash)
                stash = {};
            if (!stash.hasOwnProperty('layout'))
                stash.layout = null;
            var res = FAINT.bundle(tplname)
                    .then(function(template) {
                        return FAINT.ejst(tplname, template, stash)
                                    .then(FAINT.ejst.bytestream);
                    })
                    .catch(FAINT.ejst._include_error);
            if (stash.layout) {
                var layout_tpl = [FAINT.ejst._cfg.layout_dir, stash.layout]
                                    .join('/')
                                    .replace(/\/+/, '/');
                return FAINT.bundle(layout_tpl)
                    .then(function(template) {
                        return FAINT.ejst(
                            stash.layout,
                            template,
                            {content: res}
                        )
                        .then(FAINT.ejst.bytestream);
                    })
                    .catch(FAINT.ejst._include_error);
            }
            return res;
        },

        json: function(object) {
            "use strict";
            return FAINT.ejst.bytestream(JSON.stringify(object));
        },

        jsone: function(object) {
            "use strict";
            return JSON.stringify(object);
        },
    },

    'layout_dir': 'layout',
},
['bundle']);

