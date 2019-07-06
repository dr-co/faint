/* globals FAINT, QUnit, Promise */
QUnit.test('ajax', function(assert) {
    "use strict";
    
    assert.expect(3);

    var in_test = true;
    FAINT.ev.on(['faint', 'ajax', 'start'], function(count, time) {
        if (!in_test)
            return;
        assert.equal(time, 0, 'time');
        assert.equal(count, 1, 'count');
    });
    FAINT.ev.on(['faint', 'ajax', 'done'], function(count, time) {
        if (!in_test)
            return;

        assert.ok(time > 0, 'time');
        assert.equal(count, 0, 'count');
    });

    var done = assert.async();

    FAINT.ajax('index.html')

    .then(function(content) {
        assert.ok(content, 'контент получен');
    })
    .catch(function(error) {
        assert.ok(false, 'контент получен');
        console.error(error);
    })
    .finally(function() {
        in_test = false;
        done();
    });
});

QUnit.test('ajax.queue', function(assert) {
    "use strict";
    
    assert.expect(62);

    var i, p, parallel = [], queue = [];
    var done = assert.async();

    var started = (new Date()).valueOf();

    var done_parallel = [], done_queue = [];

    var evq = 0;
    var in_test = true;
    FAINT.ev.on(['faint', 'ajax', 'start'], function(count, time, queue) {
        if (!in_test)
            return;

        if (queue)
            evq++;
        
        assert.ok(evq <= 1, 'start ajax, queuecheck');
    });
    FAINT.ev.on(['faint', 'ajax', 'done'], function(count, time, queue) {
        if (!in_test)
            return;
        if (queue)
            evq--;

        assert.ok(evq <= 1, 'done ajax, queuecheck');
    });

    for (i = 0; i < 10; i++) {
        p = FAINT.ajax({
                url: 'index.html?queue=' + Math.random(),
                queue: 'test'
            })
                 .then(function(content) {  // jshint ignore: line
                    assert.ok(content, 'content.queue');
                    var finished = (new Date()).valueOf();
                    done_queue.push(finished - started);
                });
        queue.push(p);
    }
        
    for (i = 0; i < 10; i++) {
        p = FAINT.ajax('index.html?parallel=' + Math.random())
                 .then(function(content) {  // jshint ignore: line
                    assert.ok(content, 'content.parallel');
                    var finished = (new Date()).valueOf();
                    done_parallel.push(finished - started);
                 });
        parallel.push(p);
    }

    var pp = Promise.all(parallel);
    var pq = Promise.all(queue);

    Promise.all([pp, pq])
        .then(function() {
            assert.equal(done_parallel.length, 10,
                'параллельных запросов завершено');
            assert.equal(done_queue.length, 10,
                'последовательных запросов завершено');

            var max_p = Math.max.apply(null, done_parallel);
            var min_p = Math.min.apply(null, done_parallel);
            var max_q = Math.max.apply(null, done_queue);

            assert.ok(max_p < max_q - min_p, 'длительность');
        })
        .catch(function(error) {
            assert.ok(false, 'нет ошибок запросов');
            console.error(error);
        })
        .finally(function() {
            in_test = false;
            done();
        });
});

QUnit.test('ajax.error', function(assert) {
    "use strict";

    assert.expect(2);

    var done = assert.async();

    FAINT.ajax('index-undefined.html')
    .then(function() {
        assert.ok(false, 'ошибка получена');
    })
    .catch(function(error) {
        assert.ok(true, 'ошибка получена');
        assert.ok(!(error instanceof Error), 'http error');
    })
    .finally(function() {
        done();
    });
});
