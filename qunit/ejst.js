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
            assert.ok(String(e).match(/aa is not defined/), 'error message');
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
        })
        .finally(done2);
    
    
    var done3 = assert.async();
    FAINT.ejst('test3', '%= include("index-unknown.html")')
        .then(function(result) {
            assert.ok($(result).hasClass('include-error'),
                      'ошибка рендерена');
        })
        .catch(function(e) {
            assert.ok(false, 'Не должно быть ошибки');
            console.error(e);
        })
        .finally(done3);
});

QUnit.test('ejst.layout', function(assert) {
    "use strict";

    assert.expect(4);

    var done1 = assert.async();

    FAINT.ejst('test', '%= include("test-in-layout.html", '+
                       '{layout: "test-layout.html"})')
        .then(function(result) {
            assert.ok(result, 'результат с layout есть');
            assert.ok($(result).hasClass('content'), 'контейнер');
            assert.ok($(result).find('> div.alert').length > 0, 'вложенность');
        })
        .catch(function(e) {
            assert.ok(false, 'нет ошибки');
            console.error(e);
        })
        .finally(done1);

    var done2 = assert.async();
    FAINT.ejst('test', '%= include("test-in-layout.html", '+
                       '{layout: "test-layout-error.html"})')
        .then(function(result) {
            assert.ok($(result).hasClass('include-error'),
                      'ошибка include-error при неудаче подгрузки template');
        })
        .catch(function(e) {
            assert.ok(false, 'нет ошибки');
            console.error(e);
        })
        .finally(done2);

});

