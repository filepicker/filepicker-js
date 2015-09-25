// json.js
'use strict';

filepicker.extend('json', function(){
    var fp = this;

    var special = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'};

    var escape = function(chr){
        return special[chr] || '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
    };

    var validate = function(string){
        string = string.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
                        replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                        replace(/(?:^|:|,)(?:\s*\[)+/g, '');

        return (/^[\],:{}\s]*$/).test(string);
    };

    var encode = function(obj) {
        if (window.JSON && window.JSON.stringify) {
            return window.JSON.stringify(obj);
        }
        if (obj && obj.toJSON){
            obj = obj.toJSON();
        }

        var string = [];
        switch (fp.util.typeOf(obj)){
            case 'string':
                return '"' + obj.replace(/[\x00-\x1f\\"]/g, escape) + '"';
            case 'array':
                for (var i = 0; i < obj.length; i++) {
                    string.push(encode(obj[i]));
                }
                return '[' + string + ']';
            case 'object': case 'hash':
                var json;
                var key;
                for (key in obj) {
                    json = encode(obj[key]);
                    if (json){
                        string.push(encode(key) + ':' + json);
                    }
                    json = null;
                }
                return '{' + string + '}';
            case 'number': case 'boolean': return '' + obj;
            case 'null': return 'null';
            default: return 'null';
        }

        return null;
    };

    var decode = function(string, secure){
        if (!string || fp.util.typeOf(string) !== 'string'){
            return null;
        }

        if (window.JSON && window.JSON.parse) {
            return window.JSON.parse(string);
        } else {
            if (secure){
                if (!validate(string)){
                    throw new Error('JSON could not decode the input; security is enabled and the value is not secure.');
                }
            }
            return eval('(' + string + ')');
        }
    };

    return {
        validate: validate,
        encode: encode,
        stringify: encode,
        decode: decode,
        parse: decode
    };
});
