/* globals FAINT */
FAINT.plugin('closure', function() {
    "use strict";
    return function(code) {
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        code.apply(null, args);
    };
});
