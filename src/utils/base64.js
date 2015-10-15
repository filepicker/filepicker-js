//base64.js
'use strict';
 /* jshint ignore:start */

filepicker.extend('base64', function(){
    var fp = this;
    /**
    *
    *  Base64 encode / decode
    *  http://www.webtoolkit.info/
    *
    **/    
    // private property
    var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    // public method for encoding
    var encode = function (input, utf8encode) {
        utf8encode = utf8encode || utf8encode === undefined;

        var output = '';
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        if (utf8encode) {
            input = _utf8_encode(input);
        }

        while (i < input.length) {
            chr1 = input.charCodeAt(i);
            chr2 = input.charCodeAt(i+1);
            chr3 = input.charCodeAt(i+2);
            i += 3;

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

        }
        return output;
    };

    // public method for decoding
    var decode = function (input, utf8decode) {
        utf8decode = utf8decode || utf8decode === undefined;
        var output = '';
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

        while (i < input.length) {

            enc1 = _keyStr.indexOf(input.charAt(i));
            enc2 = _keyStr.indexOf(input.charAt(i+1));
            enc3 = _keyStr.indexOf(input.charAt(i+2));
            enc4 = _keyStr.indexOf(input.charAt(i+3));
            i+=4;

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        if (utf8decode) {
            output = _utf8_decode(output);
        }

        return output;
    };

    // private method for UTF-8 encoding
    var _utf8_encode = function (string) {
        string = string.replace(/\r\n/g,'\n');
        var utftext = '';

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    };

    // private method for UTF-8 decoding
    var _utf8_decode = function (utftext) {
        var string = '',
            i = 0,
            c = 0,
            c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    };

    return {
        encode: encode,
        decode: decode
    };
}, true);

/* jshint ignore:end */