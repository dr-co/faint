/* globals Promise, QUnit, ejst */
QUnit.test('qunit', function(assert) {
    "use strict";
    assert.expect(1);
    assert.ok(true, 'qunit works');
});


QUnit.test('ejst', function(assert) {
    "use strict";
    
    assert.expect(10);
    var done = assert.async();

    Promise.all([
        ejst('inline', 'Hello')
            .then(function(res) {
                assert.equal(res, 'Hello', 'String value');
            }),

        ejst('inline', 'Hello, <%= "world" %>')
            .then(function(res) {
                assert.equal(res, 'Hello, world', 'variable');
            }),

        ejst('inline', '%= "Hello, world"')
            .then(function(res) {
                assert.equal(res, 'Hello, world', 'line insert');
            }),
        
        ejst('inline', '%= "Hello, & world"')
            .then(function(res) {
                assert.equal(res, 'Hello, &amp; world', 'line insert: escape');
            }),
        
        ejst('inline', '%== "Hello, & world"')
            .then(function(res) {
                assert.equal(res, 'Hello, & world', 'line insert: noescape');
            }),
        
        ejst('inline', 'Hello, <%= "&" %> world')
            .then(function(res) {
                assert.equal(res, 'Hello, &amp; world', 'variable: escape');
            }),
        
        ejst('inline', 'Hello, <%== "&" %> world')
            .then(function(res) {
                assert.equal(res, 'Hello, & world', 'variable: noescape');
            }),
        
        ejst('inline', 'Hello, <%= ejst.bytestream("&") %> world')
            .then(function(res) {
                assert.equal(res, 'Hello, & world',
                    'variable: noescape - bytestream');
            }),
        
        ejst('inline', 'Hello, <%= tst %> world', {
                tst: new Promise(function(resolve) {
                    window.setTimeout(function() { resolve('&'); }, 250);
                })
            })
            .then(function(res) {
                assert.equal(res, 'Hello, &amp; world',
                    'variable: escape');
            }),
        
        ejst('inline', 'Hello, <%= tst %> world', {
                tst: new Promise(function(resolve) {
                    window.setTimeout(function() {
                        resolve(ejst.bytestream('&'));
                    }, 125);
                })
            })
            .then(function(res) {
                assert.equal(res, 'Hello, & world',
                    'variable: noescape - bytestream');
            }),
    ]).then(function() {
        done();
    })
    .catch(function(e) {
        assert.notOk('No exception: ' + e);
        done();
    });
});
