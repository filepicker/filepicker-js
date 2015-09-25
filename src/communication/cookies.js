//cookies.js
'use strict';

filepicker.extend('cookies', function(){
    var fp = this;

    var getReceiveCookiesMessage = function(callback) {
        var handler = function(data) {            
            if (data.type !== 'ThirdPartyCookies'){
                return;
            }
            fp.cookies.THIRD_PARTY_COOKIES = !!data.payload;
            if (callback && typeof callback === 'function'){ callback(!!data.payload);}
        };
        return handler;
    };

    var checkThirdParty = function(callback) {
        var handler = getReceiveCookiesMessage(callback);
        fp.handlers.attach('cookies', handler);

        fp.comm.openChannel();
    };

    return {
        checkThirdParty: checkThirdParty
    };
});
