//strutil.js
'use strict';

filepicker.extend('util', function(){
    var fp = this;

    var trim = function(string) {
        return string.replace(/^\s+|\s+$/g,'');
    };

    var trimConvert = function(url){
        return url.replace(/\/convert\b.*/, '');
    };

    var URL_REGEX = /^(http|https)\:.*\/\//i;
    var isUrl = function(string) {
        return !!string.match(URL_REGEX);
    };

    var parseUrl = function(url) {
        //returns a dictonary of info about the url. Actually the best way to do it, although it seems odd
        if (!url || url.charAt(0) === '/') {
            url = window.location.protocol+'//'+window.location.host+url;
        }
        var a = document.createElement('a');
        a.href = url;
        //safari 4.0 and 5.1 do opposite things
        var host = a.hostname.indexOf(':') === -1 ? a.hostname : a.host;
        var ret = {
            source: url,
            protocol: a.protocol.replace(':',''),
            host: host,
            port: a.port,
            query: a.search,
            params: (function(){
                var ret = {},
                    seg = a.search.replace(/^\?/,'').split('&'),
                    len = seg.length, i = 0, s;
                for (;i<len;i++) {
                    if (!seg[i]) { continue; }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [undefined,''])[1],
            hash: a.hash.replace('#',''),
            path: a.pathname.replace(/^([^\/])/,'/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [undefined,''])[1],
            segments: a.pathname.replace(/^\//,'').split('/')
        };
        ret.origin = ret.protocol+'://'+ret.host+(ret.port ? ':'+ret.port : '');
        ret.rawUrl = (ret.origin + ret.path).replace('/convert', '');
        return ret;
    };

    var endsWith = function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    var getExtension = function(filename){
        var matched = filename.match(/\.\w*$/);
        return matched && matched.length ? matched[0] : null;
    };

    var appendQueryToUrl = function(url, key, value){
        return  url + (url.indexOf('?') >= 0 ? '&' : '?') + key + '=' + value;
    };


    return {
        trim: trim,
        trimConvert: trimConvert,
        parseUrl: parseUrl,
        isUrl: isUrl,
        endsWith: endsWith,
        appendQueryToUrl: appendQueryToUrl,
        getExtension: getExtension
    };
});
