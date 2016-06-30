//handlers.js
'use strict';

filepicker.extend('handlers', function(){
    var fp = this;
    var storage = {};

    var attachHandler = function(id, handler){
        if (storage.hasOwnProperty(id)){
            storage[id].push(handler);
        } else {
            storage[id] = [handler];
        }
        return handler;
    };

    var detachHandler = function(id, fn){
        var handlers = storage[id];
        if (!handlers) {
            return;
        }

        if (fn) {
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i] === fn) {
                    handlers.splice(i,1);
                    break;
                }
            }
            if (handlers.length === 0) {
                delete(storage[id]);
            }
        } else {
            delete(storage[id]);
        }
    };

    var run = function(data){
        if (data == null || data.id == null) {
            return false;
        }
        var callerId = data.id;
        if (storage.hasOwnProperty(callerId)){
            //have to grab first in case someone removes mid-go
            var handlers = storage[callerId];
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](data);
            }
            return true;
        }
        return false;
    };

    return {
        attach: attachHandler,
        detach: detachHandler,
        run: run
    };
});
