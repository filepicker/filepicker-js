//comm.js
'use strict';

filepicker.extend('comm', function(){
    var fp = this;

    var COMM_IFRAME_NAME = 'filepicker_comm_iframe';
    var API_IFRAME_NAME = 'fpapi_comm_iframe';

    /*
     * Opens the IFrame if there isn't one
     */
    var openCommIframe = function(){
        if (window.frames[COMM_IFRAME_NAME] === undefined) {
            //Attach a event handler
            openCommunicationsChannel();

            //Opening an iframe to send events
            var commIFrame;
            commIFrame = document.createElement('iframe');
            commIFrame.id = commIFrame.name = COMM_IFRAME_NAME;
            commIFrame.src = fp.urls.COMM;
            commIFrame.style.display = 'none';
            document.body.appendChild(commIFrame);
        }
        if (window.frames[API_IFRAME_NAME] === undefined) {
            //Attach a event handler
            openCommunicationsChannel();

            //Opening an iframe to send events
            var apiIFrame;
            apiIFrame = document.createElement('iframe');
            apiIFrame.id = apiIFrame.name = API_IFRAME_NAME;
            apiIFrame.src = fp.urls.API_COMM;
            apiIFrame.style.display = 'none';
            document.body.appendChild(apiIFrame);
        }
    };

    var communicationsHandler = function(event){
        if (event.origin !== fp.urls.BASE && event.origin !== fp.urls.DIALOG_BASE) {
            return;
        }
        var data = fp.json.parse(event.data);
        fp.handlers.run(data);
    };

    /*
     * 1. Creates the general communcation handler
     * 2. Set to listen
     * ONLY RUN ONCE
     */
    var isOpen = false;

    var openCommunicationsChannel = function(){
        if (isOpen){
            return;
        } else {
            isOpen = true;
        }


        //Modern
        if (window.addEventListener) {
            window.addEventListener('message', communicationsHandler, false);
        //IE8, FF3
        } else if (window.attachEvent) {
            window.attachEvent('onmessage', communicationsHandler);
        //No hope
        } else {
            throw new fp.FilepickerException('Unsupported browser');
        }
    };

    var destroyCommIframe = function(){
        //Modern
        if (window.removeEventListener) {
            window.removeEventListener('message', communicationsHandler, false);
        //IE8, FF3
        } else if (window.attachEvent) {
            window.detachEvent('onmessage', communicationsHandler);
        //No hope
        } else {
            throw new fp.FilepickerException('Unsupported browser');
        }

        if (!isOpen){
            return;
        } else {
            isOpen = false;
        }
        //Also removing iframe
        var iframes = document.getElementsByName(COMM_IFRAME_NAME);
        for (var i = 0; i < iframes.length; i++){
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        try{delete window.frames[COMM_IFRAME_NAME];}catch(e){}
        var api_iframes = document.getElementsByName(API_IFRAME_NAME);
        for (var j = 0; j < api_iframes.length; j++){
            api_iframes[j].parentNode.removeChild(api_iframes[j]);
        }
        try{delete window.frames[API_IFRAME_NAME];}catch(e){}
    };

    return {
        openChannel: openCommIframe,
        closeChannel: destroyCommIframe
    };
});
