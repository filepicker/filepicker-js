//browser.js
'use strict';

filepicker.extend('browser', function(){
    var fp = this;

    var isIOS = function() {
        return !!(navigator.userAgent.match(/iPhone/i) ||
                navigator.userAgent.match(/iPod/i) ||
                navigator.userAgent.match(/iPad/i));
    };

    var isAndroid = function() {
        return !!navigator.userAgent.match(/Android/i);
    };

    var isIE7 = function() {
        return !!navigator.userAgent.match(/MSIE 7\.0/i);
    };

    var isSafari = function() {
        return (navigator.userAgent.search('Safari') >= 0 &&
            navigator.userAgent.search('Chrome') < 0);
    };
    
    var isMobileSafari = function() {
        return !!(navigator.userAgent.match(/(iPod|iPhone|iPad)/) && 
            navigator.userAgent.match(/AppleWebKit/) && 
            !navigator.userAgent.match(/CriOS/));
    };

    var getLanguage = function() {
        var language = window.navigator.userLanguage || window.navigator.language;
        if (language === undefined) {
            language = 'en';
        }
        language = language.replace('-', '_').toLowerCase();
        return language;
    };

    var isMobile = isIOS() || isAndroid();
    

    return {
        isIOS: isIOS,
        isAndroid: isAndroid,
        isIE7: isIE7,
        isSafari: isSafari,
        isMobileSafari: isMobileSafari,
        getLanguage: getLanguage,
        isMobile: isMobile
    };
});
