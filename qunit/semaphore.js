/* globals QUnit, FAINT */
QUnit.test('semaphore parallel', function(assert) {
    "use strict";
    assert.ok(typeof FAINT.semaphore, 'function', 'FAINT.semaphore');

    var i;
    var test = [];
    var count = 30;
        
    var async_done = assert.async();

    var done_tests = function() {
        for (i = 0; i < test.length - 1; i++) {
            var diff = test[i + 1][1] - test[i][1];
            assert.ok(diff <= 10 && diff >= 0, 'delta time');
        }
        assert.ok(
            test[test.length - 1][1] - test[0][1] < 100, 'common delta time');
        async_done();
    };

    FAINT.semaphore.create('test', 20 * count);

    
    for (i = 0; i < count; i++) {
        FAINT.semaphore('test')
            .then(function(done) {  // jshint ignore: line
                assert.ok(true, 'first locked');
                setTimeout(function() {
                    test.push([1, new Date().valueOf()]);
                    done();
                    if (test.length == 2 * count) {
                        done_tests();
                    }
                }, 55);
            });
        FAINT.semaphore('test')
            .then(function(done) {  // jshint ignore: line
                assert.ok(true, 'second locked');
                setTimeout(function() {
                    test.push([2, new Date().valueOf()]);
                    done();
                    if (test.length == 2 * count) {
                        done_tests();
                    }
                }, 55);
            });
    }
});

QUnit.test('semaphore one by one', function(assert) {
    "use strict";
    assert.ok(typeof FAINT.semaphore, 'function', 'FAINT.semaphore');

    var i;
    var test = [];
    var count = 30;
        
    var async_done = assert.async();

    var done_tests = function() {
        if (test.length != count * 2)
            return;
        for (i = 0; i < test.length - 1; i++) {
            var diff = test[i + 1][1] - test[i][1];
            assert.ok(diff >= 14, 'delta time');
        }
        async_done();
    };

    for (i = 0; i < count; i++) {
        FAINT.semaphore('test2')
            .then(function(done) {  // jshint ignore: line
                assert.ok(true, 'first locked');
                setTimeout(function() {
                    test.push([1, new Date().valueOf()]);
                    done();
                    done_tests();
                }, 15);
            });
        FAINT.semaphore('test2')
            .then(function(done) {  // jshint ignore: line
                assert.ok(true, 'second locked');
                setTimeout(function() {
                    test.push([2, new Date().valueOf()]);
                    done();
                    done_tests();
                }, 15);
            });
    }
});
