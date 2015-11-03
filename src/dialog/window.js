//windows.js
'use strict';

filepicker.extend('window', function(){
    var fp = this;

    var DIALOG_TYPES = {
        OPEN:'/dialog/open/',
        SAVEAS:'/dialog/save/'
    };

    var WINDOW_NAME = 'filepicker_dialog';
    var WINDOW_PROPERTIES = 'left=100,top=100,height=600,width=800,menubar=no,toolbar=no,location=no,personalbar=no,status=no,resizable=yes,scrollbars=yes,dependent=yes,dialog=yes';
    var CLOSE_CHECK_INTERVAL = 100;

    var openWindow = function(container, src, onClose) {
        onClose = onClose || function(){};
        var isMobile = (fp.browser.isIOS() || fp.browser.isAndroid());
        if (!container && isMobile){
            container = 'window';
        } else if (!container) {
            container = 'modal';
        }

        if (container === 'window') {
            var name = WINDOW_NAME + fp.util.getId();
            window.onbeforeunload = function confirmExit() {
                return 'Filepicker upload does not complete.';
            };
            var win = window.open(src, name, WINDOW_PROPERTIES);
            if (!win) {
                window.onbeforeunload = null;
                window.alert('Please disable your popup blocker to upload files.');
            }

            var closeCheck = window.setInterval(function(){
                if (!win || win.closed) {
                    window.onbeforeunload = null;
                    window.clearInterval(closeCheck);
                    onClose();
                }
            }, CLOSE_CHECK_INTERVAL);
        } else if (container === 'modal') {
            fp.modal.generate(src, onClose);
        } else {
            var container_iframe = document.getElementById(container);
            if (!container_iframe) {
                throw new fp.FilepickerException('Container "'+container+'" not found. This should either be set to "window","modal", or the ID of an iframe that is currently in the document.');
            }
            container_iframe.src = src;
        }
    };

    return {
        open: openWindow,
        WINDOW_NAME: WINDOW_NAME
    };
});
