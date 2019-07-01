/* globals QUnit, FAINT */
QUnit.test('closure', function(assert) {
    "use strict";
    assert.equal(typeof(FAINT.closure), 'function', 'FAINT.closure');
    FAINT.closure(function(a, b) {
        assert.equal(a, 1, 'a');
        assert.equal(b, 2, 'b');
    }, 1, 2);
});
