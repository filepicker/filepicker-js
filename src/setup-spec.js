// setup.js
'use strict';

(function(){
    var fp = (function(){
        window.filepicker = window.filepicker || {};

        var context = window.filepicker

        var addObjectTo = function(name, obj, base){
            var path = name.split('.');
            for (var i = 0; i < path.length - 1; i++) {
                if (!base[path[i]]) {
                    base[path[i]] = {};
                }
                base = base[path[i]];
            }
            if (typeof obj === 'function') {
                if (obj.isClass) {
                    //We don't do fancy apply tricks because they don't work with new
                    base[path[i]] = obj;
                } else {
                    base[path[i]] = function(){return obj.apply(context, arguments);};
                }
            } else {
                base[path[i]] = obj;
            }
        };
        
        var extendObject = function(name, obj, is_public) {
            /*
                make all functions public
            */
            addObjectTo(name, obj, window.filepicker);
        };

        var extend = function(pkg, init_fn, is_public){
            if (typeof pkg === 'function') {
                is_public = init_fn;
                init_fn = pkg;
                pkg = ''; 
            }


            if (pkg) {
                pkg += '.';
            }
            var objs = init_fn.call(context);
            for (var obj_name in objs) {
                extendObject(pkg+obj_name, objs[obj_name], is_public);
            }
        };

        //So we can access the internal scope until the very end when we delete this call
        var internal = function(fn) {
            fn.apply(context, arguments);
        };

        return {
            extend: extend,
            internal: internal
        };

    })();

    //Initializing
    if (!window.filepicker){
        window.filepicker = fp;
    } else {
        for (var attr in fp) {
            window.filepicker[attr] = fp[attr];
        }
    }

})();
