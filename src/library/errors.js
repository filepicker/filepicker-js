//errors.js
'use strict';

filepicker.extend('errors', function(){
    var fp = this;

    var FPError = function(code) {
        if (this === window) { return new FPError(code);}

        this.code = code;
        if (filepicker.debug) {
            var info = filepicker.error_map[this.code];
            this.message = info.message;
            this.moreInfo = info.moreInfo;
            this.toString = function(){
                return 'FPError '+this.code+': '+this.message+'. For help, see '+this.moreInfo;
            };
        } else {
            this.toString = function(){return 'FPError '+this.code+'. Include filepicker_debug.js for more info';};
        }
        return this;
    };
    //Telling router how to call us
    FPError.isClass = true;

    //The defualt error handler
    var handleError = function(fperror) {
        if (filepicker.debug) {
            fp.util.console.error(fperror.toString());
        }
    };

    return {
        FPError: FPError,
        handleError: handleError
    };
}, true);
