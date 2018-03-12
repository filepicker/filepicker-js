//modal.js
'use strict';

filepicker.extend('modal', function(){
    var fp = this,
        SHADE_NAME = 'filepicker_shade',
        WINDOW_CONTAINER_NAME = 'filepicker_dialog_container';


    var originalBody = getHtmlTag();
    if (originalBody) {
        var originalOverflow = originalBody.style.overflow;
    }


    /*
     * Make the code for the modal
     */
    var generateModal = function(modalUrl, onClose){
        appendStyle();
        var shade = createModalShade(onClose),
            container = createModalContainer(),
            close = createModalClose(onClose),
            modal = document.createElement('iframe');

        modal.name = fp.window.WINDOW_NAME;
        modal.id = fp.window.WINDOW_NAME;
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.border = 'none';
        modal.style.position = 'relative';

        //IE...
        modal.setAttribute('border',0);
        modal.setAttribute('frameborder',0);
        modal.setAttribute('frameBorder',0);
        modal.setAttribute('marginwidth',0);
        modal.setAttribute('marginheight',0);
        modal.setAttribute('allow', 'microphone; camera');

        modal.src = modalUrl;
        container.appendChild(modal);

        shade.appendChild(close);
        shade.appendChild(container);
        document.body.appendChild(shade);
        // So user can't scrol page under modal
        var body = getHtmlTag();
        if (body) {
            body.style.overflow = 'hidden';
        }
        return modal;
    };

    var createModalShade = function(onClose) {
        var shade = document.createElement('div');
        shade.id = SHADE_NAME;
        shade.className = 'fp__overlay';
        shade.onclick = getCloseModal(onClose);
        return shade;
    };

    var createModalContainer = function() {
        var modalcontainer = document.createElement('div');
        modalcontainer.id = WINDOW_CONTAINER_NAME;
        modalcontainer.className = 'fp__container';
        // modalcontainer.style.background = '#ecedec url("https://www.filepicker.io/static/img/spinner.gif") no-repeat 50% 50%';
        return modalcontainer;
    };

    var createModalClose = function(onClose) {
        var close = document.createElement('div');
        close.className = 'fp__close';
        var closeAnchor = document.createElement('a');
        closeAnchor.appendChild(document.createTextNode('X'));
        close.appendChild(closeAnchor);
        closeAnchor.onclick = getCloseModal(onClose);
        // Close modal on esc
        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode === 27) {
                getCloseModal(onClose)();
            }
        };
        return close;
    };

    var getCloseModal = function(onClose, force){
        force = !!force;
        return function(){
            if (fp.uploading && !force) {
                if (!window.confirm('You are currently uploading. If you choose "OK", the window will close and your upload will not finish. Do you want to stop uploading and close the window?')) {
                    return;
                }
            }
            fp.uploading = false;
            document.onkeydown = null;

            setOriginalOverflow();

            var shade = document.getElementById(SHADE_NAME);
            if (shade) {
                document.body.removeChild(shade);
            }
            var container = document.getElementById(WINDOW_CONTAINER_NAME);
            if (container) {
                document.body.removeChild(container);
            }
            try{delete window.frames[fp.window.WINDOW_NAME];}catch(e){}
            if (onClose){onClose();}
        };
    };

    function hide() {
        var shade = document.getElementById(SHADE_NAME);
        if (shade) {
            shade.hidden = true;
        }
        var container = document.getElementById(WINDOW_CONTAINER_NAME);
        if (container) {
            container.hidden = true;
        }
        setOriginalOverflow();
    }

    function setOriginalOverflow(){
        var body = getHtmlTag();
        if (body) {
            body.style.overflow = originalOverflow;
        }
    }

    function appendStyle(){
        var css = '.fp__overlay {top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background: rgba(0, 0, 0, 0.8);}' +

            '.fp__close {top: 104px; right: 108px; width: 35px; height: 35px; z-index: 20; cursor: pointer}' +
            '@media screen and (max-width: 768px), screen and (max-height: 500px) {.fp__close {top: 15px; right: 12px;}}' +
            '.fp__close a {text-indent: -9999px; overflow: hidden; display: block; width: 100%; height: 100%; background: url(https://d1zyh3sbxittvg.cloudfront.net/close.png) 50% 50% no-repeat;}' +
            '.fp__close a:hover {background-color: rgba(0,0,0, .02); opacity: .8;}' +
            '@media screen and (max-width: 768px), screen and (max-height: 500px) {top: 14px; right: 14px;}' +
            '.fp__copy {display: none;}' +

            '.fp__container {-webkit-overflow-scrolling: touch; overflow: hidden; min-height: 300px; top: 100px;right: 100px;bottom: 100px;left: 100px;background: #eee; box-sizing:content-box; -webkit-box-sizing:content-box; -moz-box-sizing:content-box;}' +

            '@media screen and (max-width: 768px), screen and (max-height: 500px) {.fp__copy {bottom: 0; left: 0; right: 0; height: 20px; background: #333;}}' +
            '@media screen and (max-width: 768px), screen and (max-height: 500px) {.fp__copy a {margin-left: 5px;}}' +
            '@media screen and (max-width: 768px), screen and (max-height: 500px) {.fp__container {top: 0;right: 0;bottom: 0;left: 0;}}' +

            '.fp__overlay, .fp__close, .fp__copy, .fp__container {position: fixed;}';

        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet){
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    }

    function getHtmlTag(){
        try {
            return document.getElementsByTagName('html')[0];
        } catch(err) {
            return null;
        }
    }

    var closeModal = getCloseModal(function(){});

    return {
        generate: generateModal,
        close: closeModal,
        hide: hide
    };
});
