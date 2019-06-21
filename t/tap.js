/* global module, process, global */
module.exports = {
    $: { done: 0, ok: 0, fail: 0, plan: 0 },

    note: function(description) {
        var lines = String(description).split(/\n/);
        for (var i in lines) {
            process.stdout.write('# ' + lines[i] + "\n");
        }
        return this;
    },

    diag: function(description) {
        var lines = String(description).split(/\n/);
        for (var i in lines) {
            process.stderr.write('# ' + lines[i] + "\n");
        }
        return this;
    },

    explain: function(o) {
        return JSON.stringify(o, null, 4);
    },

    note_explain: function(o) {
        return this.note(this.explain(o));
    },

    plan: function(count) {
        this.$.plan = count;
        process.stdout.write('1..' + String(count) + "\n");


        var tp = this;
        process.on('exit', function() {
            failed = false;
            if (tp.$.plan) {
                if (tp.$.plan != tp.$.done) {
                    tp.note(
                        'Looks like you planned ' +
                            tp.$.plan + ' tests but ran ' + tp.$.done);
                    failed = true;
                }
            }

            if (tp.$.fail) {
                tp.note(
                    'Looks like you failed ' +
                        tp.$.fail + ' test of ' + tp.$.no);
                failed = true;
            }
            if (failed)
                process.exit(1);
        });

    },

    pass: function(description) {
        this.$.done++;
        process.stdout.write('ok ' +
            this.$.done + ' - ' + String(description) + '\n');
        return true;
    },

    fail: function(description) {
        this.$.fail++;
        this.$.done++;
        this.diag('  Failed test "' + String(description) + '"');
        return false;
    },

    ok: function(tf, description) {

        this.$.done++;


        if (tf) {
            this.$.ok++;
            process.stdout.write('ok ' +
                this.$.done + ' - ' + String(description) + "\n");
        } else {
            this.$.fail++;
            process.stderr.write('not ok ' +
                this.$.done + ' - ' + String(description) + "\n");
            this.diag('  Failed test "' + String(description) + '"');
        }
        return tf;
    },

    like: function(str, pattern, description) {
        this.$.done++;

        if (String(str).match(pattern)) {
            this.$.ok++;
            process.stdout.write('ok ' +
                this.$.done + ' - ' + String(description) + "\n");
            return true;
        }
        this.$.fail++;
        process.stderr.write('not ok ' +
            this.$.done + ' - ' + String(description) + "\n");
        this.diag('          received "' + String(str) + '"');
        this.diag('  expected pattern "' + String(pattern) + '"');
    },

    is: function(v, ex, description) {
        if (this.ok(v === ex, description))
            return true;
        this.diag('       got: ' + String(v));
        this.diag('  expected: ' + String(ex));
        this._print_stack();
        return false;
    },
    
    isnt: function(v, ex, description) {
        if (this.ok(v !== ex, description))
            return true;
        this.diag('       got: ' + String(v));
        this.diag('  expected: anything else');
        this._print_stack();
        return false;
    },

    isa: function(o, cls, description) {
        var isaok = o instanceof cls;
        this.ok(isaok, description);
        return isaok;
    },

    _print_stack: function(begin) {
        var e = new Error('dummy');
        var stack = String(e.stack).split(/\n/);
        if (begin == null)
            begin = 0;

        for (var i = 3 + begin; i < stack.length; i++)
            this.diag(stack[i].replace(/^\s*/, '    '));
    },

    /* global __dirname, require */
    load_file: function(name) {
        var file = __dirname + '/' + name;
        if (name.match(/^(\/|\.)/))
            file = name;
        return require('fs').readFileSync(file, 'utf8');
    },

    load_json: function(name) {
        return JSON.parse(this.load_file(name));
    },

    closure: function() {
        var fn = arguments[0];
        var alist = [];
        for (var i = 1; i < arguments.length; i++)
            alist.push(arguments[i]);
        return fn.apply(this, alist);
    }
};

