// vim: set tabsize=4 et */
/* globals Promise, module */

var ejst;

ejst = function(name, template, stash) {
    "use strict";
    if (!stash)
        stash = {};

    var body = '(function() { return function(';
    var args = [];

    for (var arg_name in stash) {
        body += arg_name;
        body += ', ';
        args.push(stash[arg_name]);
    }

    
    body += '___q, ';

    body += '___i';

    body += ') { ';
    body += ejst.compile(template);
    body += '\n}; })();';


    return ejst._render(name, body, args);
};

ejst._parse = function(template, text, code) {
    "use strict";
    
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

ejst.compile = function(template) {
    "use strict";
    
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
    "use strict";
    
    if (typeof(text) == 'object' && typeof(text.xmlescape) == 'function') {
        return text.xmlescape();
    }
    return String(text)
                .replace(/\&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
};

ejst._render = function(name, btemplate, ___args) {
    "use strict";
    
    var ___res = [];
    var ___foo;
    ___args.push(function(t) {      // ___q
        if (typeof(t) == 'object' && typeof(t.then) == 'function') {
            ___res.push(
                t.then(function(item) { return ejst.xmlescape(item); })
            );
            return;
        }
        ___res.push(ejst.xmlescape(String(t)));
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
        return Promise.reject('Syntax error at template "' + name + '": ' + e);
    }

    try {
        ___foo.apply(null, ___args);
    } catch (e) {
        if (e.stack) {
            var line = e.stack.split(/\n/)[1];
            if (line) {
                var pos = /.*eval.*:(\d+):(\d+)\)$/.exec(line);
                if (pos) {
                    return Promise.reject(
                        'Template error at "' + name + '" (at line ' + pos[1] +
                        '): ' + e
                    );
                }
            }
        }
        return Promise.reject('Template error at "' + name + '": ' + e);
    }
    return Promise.all(___res).then(function(lst) { return lst.join(''); });
};


if (module) {
    module.exports = {
        ejst: ejst,
    };
}
