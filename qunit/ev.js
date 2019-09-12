/* globals QUnit, FAINT */
QUnit.test('ev:_normalize_key', function(assert) {
    "use strict";
    assert.expect(8);

    assert.equal(FAINT.ev._normalize_key('abc'), 'abc', 'string key');
    assert.equal(FAINT.ev._normalize_key(123), '123', 'numeric key');
    assert.equal(FAINT.ev._normalize_key(null), 'null', 'null key');
    assert.equal(FAINT.ev._normalize_key([1,2,3]), '1::2::3', 'numeric array');
    assert.equal(FAINT.ev._normalize_key(['a','b']), 'a::b', 'string array');
    assert.equal(FAINT.ev._normalize_key(['a',null]), 'a::null', 'mesh array');
    assert.equal(FAINT.ev._normalize_key([]), '', 'empty array');
    assert.equal(FAINT.ev._normalize_key({}), String({}), 'dict');
});

QUnit.test('ev: pub/sub', function(assert) {
    "use strict";
    assert.expect(11);
    var done = assert.async();

    var count = 0;

    FAINT.ev.on(['test', 123], function(data) {
        assert.ok(true, typeof(data), data);
        assert.equal(
            JSON.stringify(this),
            JSON.stringify(["test","123"]),
            'key');
        if (data == 'done')
            done();
        count++;
    });

    FAINT.ev('test::123', 123);
    FAINT.ev('test::123', true);
    FAINT.ev('test::123');
    FAINT.ev('test::123', null);
    assert.equal(count, 0, 'No tests ran yet');

    setTimeout(function() { FAINT.ev('test::123', 'done'); }, 250);
});

QUnit.test('ev: later', function(assert) {
    "use strict";

    var done = assert.async();
    var received = [];

    FAINT.ev.on('test-later', function(data) {
        received.push(data);

        assert.ok(true, 'received data');
        if (received.length != 2)
            return;


        assert.equal(
            JSON.stringify([1,2]),
            JSON.stringify(received), 'events order');
        done();
    });

    FAINT.ev.later('test-later', 2);
    FAINT.ev('test-later', 1);
});

QUnit.test('ev: later once', function(assert) {
    "use strict";

    var done = assert.async();

    FAINT.ev.on('test-later once', function(data) {
        assert.equal(data, 345, 'received data');
        done();
    });

    FAINT.ev.later('test-later once', 345);
});
