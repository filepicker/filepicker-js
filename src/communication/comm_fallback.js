//comm_fallback.js
'use strict';

filepicker.extend('comm_fallback', function(){
    var fp = this;

    var FP_COMM_IFRAME_NAME = 'filepicker_comm_iframe';
    var HOST_COMM_IFRAME_NAME = 'host_comm_iframe';
    var base_host_location = '';
    var hash_check_interval = 200;

    /*
     * Opens the IFrame if there isn't one
     */
    var openCommIframe = function(){
        openHostCommIframe();
    };

    //First we open a host comm iframe to test what the url is we'll be working with on the host
    //to make sure we don't run into redirect issues
    var openHostCommIframe = function(){
        if (window.frames[HOST_COMM_IFRAME_NAME] === undefined) {
            //Opening an iframe to send events
            var hostCommIFrame;
            hostCommIFrame = document.createElement('iframe');
            hostCommIFrame.id = hostCommIFrame.name = HOST_COMM_IFRAME_NAME;
            base_host_location = hostCommIFrame.src = fp.urls.constructHostCommFallback();
            hostCommIFrame.style.display = 'none';
            var onload = function(){
                base_host_location = hostCommIFrame.contentWindow.location.href;
                //Then we open the filepicker comm iframe
                openFPCommIframe();
            };
            if (hostCommIFrame.attachEvent) {
                hostCommIFrame.attachEvent('onload', onload);
            } else {
                hostCommIFrame.onload = onload;
            }
            document.body.appendChild(hostCommIFrame);
        }
    };

    var openFPCommIframe = function(){
        if (window.frames[FP_COMM_IFRAME_NAME] === undefined) {
            //Opening an iframe to send events
            var fpCommIFrame;
            fpCommIFrame = document.createElement('iframe');
            fpCommIFrame.id = fpCommIFrame.name = FP_COMM_IFRAME_NAME;
            fpCommIFrame.src = fp.urls.FP_COMM_FALLBACK + '?host_url=' + encodeURIComponent(base_host_location);
            fpCommIFrame.style.display = 'none';
            document.body.appendChild(fpCommIFrame);
        }
        openCommunicationsChannel();
    };

    /*
     * 1. Creates the general communcation handler
     * 2. Set to listen
     * ONLY RUN ONCE
     */
    var isOpen = false;
    var timer;
    var lastHash = '';
    var checkHash = function(){
        var comm_iframe = window.frames[FP_COMM_IFRAME_NAME];
        if (!comm_iframe) {return;}
        var host_iframe = comm_iframe.frames[HOST_COMM_IFRAME_NAME];
        if (!host_iframe) {return;}

        var hash = host_iframe.location.hash;
        //sanitization
        if (hash && hash.charAt(0) === '#') {
            hash = hash.substr(1);
        }
        if (hash === lastHash) {return;}
        lastHash = hash;
        if (!lastHash) {return;}

        var data;
        try{
            data = fp.json.parse(hash);
        } catch (e){}

        if (data) {
            fp.handlers.run(data);
        }
    };

    var openCommunicationsChannel = function(){
        if (isOpen){
            return;
        } else {
            isOpen = true;
        }

        timer = window.setInterval(checkHash, hash_check_interval);
    };

    var destroyCommIframe = function(){
        window.clearInterval(timer);

        if (!isOpen){
            return;
        } else {
            isOpen = false;
        }
        //Also removing iframe
        var iframes = document.getElementsByName(FP_COMM_IFRAME_NAME);
        for (var i = 0; i < iframes.length; i++){
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        try{delete window.frames[FP_COMM_IFRAME_NAME];}catch(e){}

        iframes = document.getElementsByName(HOST_COMM_IFRAME_NAME);
        for (i = 0; i < iframes.length; i++){
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        try{delete window.frames[HOST_COMM_IFRAME_NAME];}catch(e){}
    };

    var isEnabled = !('postMessage' in window);
    var setEnabled = function(enabled) {
        if (enabled !== isEnabled) {
            isEnabled = !!enabled;
            if (isEnabled) {
                activate();
            } else {
                deactivate();
            }
        }
    };

    var old_comm;
    var activate = function(){
        old_comm = fp.comm;
        fp.comm = {
            openChannel: openCommIframe,
            closeChannel: destroyCommIframe
        };
    };

    var deactivate = function(){
        fp.comm = old_comm;
        old_comm = undefined;
    };

    if (isEnabled) {
        activate();
    }

    return {
        openChannel: openCommIframe,
        closeChannel: destroyCommIframe,
        isEnabled: isEnabled
    };
});
