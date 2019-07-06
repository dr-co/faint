/* globals QUnit, FAINT */
QUnit.test('bundle.success', function(assert) {
    "use strict";
    assert.expect(3);
    assert.ok(FAINT.bundle, 'FAINT.bundle');

    var done = assert.async();

    FAINT.bundle('index.html')
        .then(function(item) {
            assert.ok(true, 'get index.html');
            assert.equal(typeof item, 'string', 'data is string');
        })
        .catch(function(e) {
            assert.ok(false, 'get index.html');
            console.error(e);
        })
        .finally(done);
});
QUnit.test('bundle.error', function(assert) {
    "use strict";
    assert.expect(4);
    assert.ok(FAINT.bundle, 'FAINT.bundle');

    var done = assert.async();

    FAINT.bundle('index-unknown.html')
        .then(function() {
            assert.ok(false, 'get index-unknown.html');
        })
        .catch(function(e) {
            assert.ok(true, 'get unknown.html');
            assert.ok(e instanceof Object, 'Object');
            assert.equal(e.status, 404, 'http status');
        })
        .finally(done);
});
