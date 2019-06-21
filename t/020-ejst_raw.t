#!/usr/bin/nodejs

/* vim: set ft=javascript : */

function unexpected_error(name) {
    "use strict";
    return function(e) {
        tap.fail(name);
        tap.diag('  ' + e);
    };
}

var tap = require(__dirname + '/tap.js');
var ejst = require(__dirname + '/../src/ejst.js').ejst;

tap.plan(10);
tap.ok(ejst, 'ejst function');


ejst('test', 'Hello, world')
    .then(function(res) {
        "use strict";
        tap.is(res, 'Hello, world', 'Render string');
    })
    .catch(unexpected_error('Render string'))
;

ejst('test', 'Hello, <%= "&&&&" %> world\naaa')
    .then(function(res) {
        "use strict";
        tap.like(res, /^Hello, (&amp;){4}/, 'Render easy template');
        tap.like(res, /\naaa/, 'Render easy template: second line');
    })
    .catch(unexpected_error('Render easy template'))
;


ejst('test', 'Hello, <%= 1 + 11 %> world')
    .then(function(res) {
        "use strict";
        tap.is(res, 'Hello, 12 world', 'javascript result');
    })
    .catch(unexpected_error('javascript result'))
;

ejst('test', 'Hello, <%= 1 + vari %> world', {'vari': 11})
    .then(function(res) {
        "use strict";
        tap.is(res, 'Hello, 12 world', 'javascript result: variable');
    })
    .catch(unexpected_error('javascript result: variable'))
;

ejst('test', 'Hello, <%= aa() + 1 + vari %> world', {'vari': 11})
    .then(function(/* res */) {
        "use strict";
        tap.fail('await exception');
    })
    .catch(function(e) {
        "use strict";
        tap.like(e, /aa is not defined/, 'error message');
    })
;
