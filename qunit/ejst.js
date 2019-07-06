/* globals QUnit, FAINT */
QUnit.test('ejst.raw', function(assert) {
    "use strict";
    assert.ok(FAINT.ejst, 'FAINT.ejst');

    var done1 = assert.async();

    function unexpected_error(name) {
        return function(e) {
            assert.ok(false, name);
            console.error(e);
        };
    }

    FAINT.ejst('test', 'Hello, world')
        .then(function(res) {
            assert.equal(res, 'Hello, world', 'Render string');
        })
        .catch(unexpected_error('Render string'))
        .finally(done1);


    var done2 = assert.async();
    FAINT.ejst('test', 'Hello, <%= "&&&&" %> world\naaa')
        .then(function(res) {
            assert.ok(res.match(/^Hello, (&amp;){4}/), 'Render easy template');
            assert.ok(res.match(/\naaa/), 'Render easy template: second line');
        })
        .catch(unexpected_error('Render easy template'))
        .finally(done2);

    var done3 = assert.async();
    FAINT.ejst('test', 'Hello, <%= 1 + 11 %> world')
        .then(function(res) {
            assert.equal(res, 'Hello, 12 world', 'javascript result');
        })
        .catch(unexpected_error('javascript result'))
        .finally(done3);

    var done4 = assert.async();
    FAINT.ejst('test', 'Hello, <%= 1 + vari %> world', {'vari': 11})
        .then(function(res) {
            assert.equal(res, 'Hello, 12 world', 'javascript result: variable');
        })
        .catch(unexpected_error('javascript result: variable'))
        .finally(done4);

    var done5 = assert.async();
    FAINT.ejst('test', 'Hello, <%= aa() + 1 + vari %> world', {'vari': 11})
        .then(function(/* res */) {
            assert.ok(false, 'await exception');
        })
        .catch(function(e) {
            assert.ok(e.match(/aa is not defined/), 'error message');
        })
        .finally(done5);

    var done6 = assert.async();
    FAINT.ejst('test', 'Hello, <%= foo() %>')
        .then(function(res) {
            assert.equal(res, 'Hello, bar', 'javascript result: variable');
        })
        .catch(unexpected_error('javascript result: variable'))
        .finally(done6);
    
    var done7 = assert.async();
    FAINT.ejst('test', 'Hello, <%= tag() %>')
        .then(function(res) {
            assert.equal(res, 'Hello, &lt;tag&gt;&lt;/tag&gt;',
                'javascript result: variable');
        })
        .catch(unexpected_error('javascript result: variable'))
        .finally(done7);
        
});

QUnit.test('ejst.include', function(assert) {
    "use strict";
    
    var done1 = assert.async();
    FAINT.ajax('index.html')
        .then(function(html) {
            assert.ok(html, 'html получен');
            
            return FAINT.ejst('test', '%= include("index.html")')
                    .then(function(res) {
                        assert.ok(res);
                        assert.equal(res, html, 'инклюд');
                    });
        })
        .finally(done1);

    var done2 = assert.async();
    FAINT.ejst('test2', '% include("index.html")', {'a': 'b'})
        .then(function(result) {
            assert.equal(result, '', 'пустое значение без %=');
            done2();
        });
});
