// finalize.js
'use strict';

(function(){
    //setup functions
    filepicker.internal(function(){
        var fp = this;
        fp.util.addOnLoad(fp.cookies.checkThirdParty);
        fp.util.addOnLoad(fp.widgets.buildWidgets);
        fp.util.addOnLoad(fp.responsiveImages.init);
    });

    //Now we wipe our superpowers
    delete filepicker.internal;
    delete filepicker.extend;

    //process the queue
    var queue = filepicker._queue || [];
    var args;
    var len = queue.length;
    if (len) {
        for (var i = 0; i < len; i++) {
            args = queue[i];
            filepicker[args[0]].apply(filepicker, args[1]);
        }
    }

    //remove the queue
    if (filepicker._queue) {
        delete filepicker._queue;
    }
})();
