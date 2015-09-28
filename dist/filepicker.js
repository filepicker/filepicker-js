"use strict";

(function() {
    var fp = function() {
        var context = {};
        var addObjectTo = function(name, obj, base) {
            var path = name.split(".");
            for (var i = 0; i < path.length - 1; i++) {
                if (!base[path[i]]) {
                    base[path[i]] = {};
                }
                base = base[path[i]];
            }
            if (typeof obj === "function") {
                if (obj.isClass) {
                    base[path[i]] = obj;
                } else {
                    base[path[i]] = function() {
                        return obj.apply(context, arguments);
                    };
                }
            } else {
                base[path[i]] = obj;
            }
        };
        var extendObject = function(name, obj, is_public) {
            addObjectTo(name, obj, context);
            if (is_public) {
                addObjectTo(name, obj, window.filepicker);
            }
        };
        var extend = function(pkg, init_fn, is_public) {
            if (typeof pkg === "function") {
                is_public = init_fn;
                init_fn = pkg;
                pkg = "";
            }
            if (pkg) {
                pkg += ".";
            }
            var objs = init_fn.call(context);
            for (var obj_name in objs) {
                extendObject(pkg + obj_name, objs[obj_name], is_public);
            }
        };
        var internal = function(fn) {
            fn.apply(context, arguments);
        };
        return {
            extend: extend,
            internal: internal
        };
    }();
    if (!window.filepicker) {
        window.filepicker = fp;
    } else {
        for (var attr in fp) {
            window.filepicker[attr] = fp[attr];
        }
    }
})();

"use strict";

filepicker.extend("comm", function() {
    var fp = this;
    var COMM_IFRAME_NAME = "filepicker_comm_iframe";
    var API_IFRAME_NAME = "fpapi_comm_iframe";
    var openCommIframe = function() {
        if (window.frames[COMM_IFRAME_NAME] === undefined) {
            openCommunicationsChannel();
            var commIFrame;
            commIFrame = document.createElement("iframe");
            commIFrame.id = commIFrame.name = COMM_IFRAME_NAME;
            commIFrame.src = fp.urls.COMM;
            commIFrame.style.display = "none";
            document.body.appendChild(commIFrame);
        }
        if (window.frames[API_IFRAME_NAME] === undefined) {
            openCommunicationsChannel();
            var apiIFrame;
            apiIFrame = document.createElement("iframe");
            apiIFrame.id = apiIFrame.name = API_IFRAME_NAME;
            apiIFrame.src = fp.urls.API_COMM;
            apiIFrame.style.display = "none";
            document.body.appendChild(apiIFrame);
        }
    };
    var communicationsHandler = function(event) {
        if (event.origin !== fp.urls.BASE && event.origin !== fp.urls.DIALOG_BASE) {
            return;
        }
        var data = fp.json.parse(event.data);
        fp.handlers.run(data);
    };
    var isOpen = false;
    var openCommunicationsChannel = function() {
        if (isOpen) {
            return;
        } else {
            isOpen = true;
        }
        if (window.addEventListener) {
            window.addEventListener("message", communicationsHandler, false);
        } else if (window.attachEvent) {
            window.attachEvent("onmessage", communicationsHandler);
        } else {
            throw new fp.FilepickerException("Unsupported browser");
        }
    };
    var destroyCommIframe = function() {
        if (window.removeEventListener) {
            window.removeEventListener("message", communicationsHandler, false);
        } else if (window.attachEvent) {
            window.detachEvent("onmessage", communicationsHandler);
        } else {
            throw new fp.FilepickerException("Unsupported browser");
        }
        if (!isOpen) {
            return;
        } else {
            isOpen = false;
        }
        var iframes = document.getElementsByName(COMM_IFRAME_NAME);
        for (var i = 0; i < iframes.length; i++) {
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        try {
            delete window.frames[COMM_IFRAME_NAME];
        } catch (e) {}
        var api_iframes = document.getElementsByName(API_IFRAME_NAME);
        for (var j = 0; j < api_iframes.length; j++) {
            api_iframes[j].parentNode.removeChild(api_iframes[j]);
        }
        try {
            delete window.frames[API_IFRAME_NAME];
        } catch (e) {}
    };
    return {
        openChannel: openCommIframe,
        closeChannel: destroyCommIframe
    };
});

"use strict";

filepicker.extend("comm_fallback", function() {
    var fp = this;
    var FP_COMM_IFRAME_NAME = "filepicker_comm_iframe";
    var HOST_COMM_IFRAME_NAME = "host_comm_iframe";
    var base_host_location = "";
    var hash_check_interval = 200;
    var openCommIframe = function() {
        openHostCommIframe();
    };
    var openHostCommIframe = function() {
        if (window.frames[HOST_COMM_IFRAME_NAME] === undefined) {
            var hostCommIFrame;
            hostCommIFrame = document.createElement("iframe");
            hostCommIFrame.id = hostCommIFrame.name = HOST_COMM_IFRAME_NAME;
            base_host_location = hostCommIFrame.src = fp.urls.constructHostCommFallback();
            hostCommIFrame.style.display = "none";
            var onload = function() {
                base_host_location = hostCommIFrame.contentWindow.location.href;
                openFPCommIframe();
            };
            if (hostCommIFrame.attachEvent) {
                hostCommIFrame.attachEvent("onload", onload);
            } else {
                hostCommIFrame.onload = onload;
            }
            document.body.appendChild(hostCommIFrame);
        }
    };
    var openFPCommIframe = function() {
        if (window.frames[FP_COMM_IFRAME_NAME] === undefined) {
            var fpCommIFrame;
            fpCommIFrame = document.createElement("iframe");
            fpCommIFrame.id = fpCommIFrame.name = FP_COMM_IFRAME_NAME;
            fpCommIFrame.src = fp.urls.FP_COMM_FALLBACK + "?host_url=" + encodeURIComponent(base_host_location);
            fpCommIFrame.style.display = "none";
            document.body.appendChild(fpCommIFrame);
        }
        openCommunicationsChannel();
    };
    var isOpen = false;
    var timer;
    var lastHash = "";
    var checkHash = function() {
        var comm_iframe = window.frames[FP_COMM_IFRAME_NAME];
        if (!comm_iframe) {
            return;
        }
        var host_iframe = comm_iframe.frames[HOST_COMM_IFRAME_NAME];
        if (!host_iframe) {
            return;
        }
        var hash = host_iframe.location.hash;
        if (hash && hash.charAt(0) === "#") {
            hash = hash.substr(1);
        }
        if (hash === lastHash) {
            return;
        }
        lastHash = hash;
        if (!lastHash) {
            return;
        }
        var data;
        try {
            data = fp.json.parse(hash);
        } catch (e) {}
        if (data) {
            fp.handlers.run(data);
        }
    };
    var openCommunicationsChannel = function() {
        if (isOpen) {
            return;
        } else {
            isOpen = true;
        }
        timer = window.setInterval(checkHash, hash_check_interval);
    };
    var destroyCommIframe = function() {
        window.clearInterval(timer);
        if (!isOpen) {
            return;
        } else {
            isOpen = false;
        }
        var iframes = document.getElementsByName(FP_COMM_IFRAME_NAME);
        for (var i = 0; i < iframes.length; i++) {
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        try {
            delete window.frames[FP_COMM_IFRAME_NAME];
        } catch (e) {}
        iframes = document.getElementsByName(HOST_COMM_IFRAME_NAME);
        for (i = 0; i < iframes.length; i++) {
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        try {
            delete window.frames[HOST_COMM_IFRAME_NAME];
        } catch (e) {}
    };
    var isEnabled = !("postMessage" in window);
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
    var activate = function() {
        old_comm = fp.comm;
        fp.comm = {
            openChannel: openCommIframe,
            closeChannel: destroyCommIframe
        };
    };
    var deactivate = function() {
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

"use strict";

filepicker.extend("cookies", function() {
    var fp = this;
    var getReceiveCookiesMessage = function(callback) {
        var handler = function(data) {
            if (data.type !== "ThirdPartyCookies") {
                return;
            }
            fp.cookies.THIRD_PARTY_COOKIES = !!data.payload;
            if (callback && typeof callback === "function") {
                callback(!!data.payload);
            }
        };
        return handler;
    };
    var checkThirdParty = function(callback) {
        var handler = getReceiveCookiesMessage(callback);
        fp.handlers.attach("cookies", handler);
        fp.comm.openChannel();
    };
    return {
        checkThirdParty: checkThirdParty
    };
});

"use strict";

filepicker.extend("handlers", function() {
    var fp = this;
    var storage = {};
    var attachHandler = function(id, handler) {
        if (storage.hasOwnProperty(id)) {
            storage[id].push(handler);
        } else {
            storage[id] = [ handler ];
        }
        return handler;
    };
    var detachHandler = function(id, fn) {
        var handlers = storage[id];
        if (!handlers) {
            return;
        }
        if (fn) {
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i] === fn) {
                    handlers.splice(i, 1);
                    break;
                }
            }
            if (handlers.length === 0) {
                delete storage[id];
            }
        } else {
            delete storage[id];
        }
    };
    var run = function(data) {
        var callerId = data.id;
        if (storage.hasOwnProperty(callerId)) {
            var handlers = storage[callerId];
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](data);
            }
            return true;
        }
        return false;
    };
    return {
        attach: attachHandler,
        detach: detachHandler,
        run: run
    };
});

"use strict";

filepicker.extend("exporter", function() {
    var fp = this;
    var normalizeOptions = function(options) {
        var normalize = function(singular, plural, def) {
            if (options[plural] && !fp.util.isArray(options[plural])) {
                options[plural] = [ options[plural] ];
            } else if (options[singular]) {
                options[plural] = [ options[singular] ];
            } else if (def) {
                options[plural] = def;
            }
        };
        if (options.mimetype && options.extension) {
            throw fp.FilepickerException("Error: Cannot pass in both mimetype and extension parameters to the export function");
        }
        normalize("service", "services");
        if (options.services) {
            for (var i = 0; i < options.services.length; i++) {
                var service = ("" + options.services[i]).replace(" ", "");
                var sid = fp.services[service];
                options.services[i] = sid === undefined ? service : sid;
            }
        }
        if (options.openTo) {
            options.openTo = fp.services[options.openTo] || options.openTo;
        }
        fp.util.setDefault(options, "container", fp.browser.isMobile ? "window" : "modal");
    };
    var getExportHandler = function(onSuccess, onError) {
        var handler = function(data) {
            if (data.type !== "filepickerUrl") {
                return;
            }
            if (data.error) {
                fp.util.console.error(data.error);
                onError(fp.errors.FPError(132));
            } else {
                var fpfile = {};
                fpfile.url = data.payload.url;
                fpfile.filename = data.payload.data.filename;
                fpfile.mimetype = data.payload.data.type;
                fpfile.size = data.payload.data.size;
                fpfile.isWriteable = true;
                onSuccess(fpfile);
            }
            fp.modal.close();
        };
        return handler;
    };
    var createExporter = function(input, options, onSuccess, onError) {
        normalizeOptions(options);
        if (options.debug) {
            setTimeout(function() {
                onSuccess({
                    url: "https://www.filepicker.io/api/file/-nBq2onTSemLBxlcBWn1",
                    filename: "test.png",
                    mimetype: "image/png",
                    size: 58979
                });
            }, 1);
            return;
        }
        if (fp.cookies.THIRD_PARTY_COOKIES === undefined) {
            var alreadyHandled = false;
            fp.cookies.checkThirdParty(function() {
                if (!alreadyHandled) {
                    createExporter(input, options, onSuccess, onError);
                    alreadyHandled = true;
                }
            });
            return;
        }
        var id = fp.util.getId();
        var finished = false;
        var onSuccessMark = function(fpfile) {
            finished = true;
            onSuccess(fpfile);
        };
        var onErrorMark = function(fperror) {
            finished = true;
            onError(fperror);
        };
        var onClose = function() {
            if (!finished) {
                finished = true;
                onError(fp.errors.FPError(131));
            }
        };
        fp.window.open(options.container, options.mobile, fp.urls.constructExportUrl(input, options, id), onClose);
        fp.handlers.attach(id, getExportHandler(onSuccessMark, onErrorMark));
    };
    return {
        createExporter: createExporter
    };
});

"use strict";

filepicker.extend("modal", function() {
    var fp = this, SHADE_NAME = "filepicker_shade", WINDOW_CONTAINER_NAME = "filepicker_dialog_container";
    var originalBody = getHtmlTag();
    if (originalBody) {
        var originalOverflow = originalBody.style.overflow;
    }
    var generateModal = function(modalUrl, onClose) {
        appendStyle();
        var shade = createModalShade(onClose), container = createModalContainer(), close = createModalClose(onClose), modal = document.createElement("iframe");
        modal.name = fp.window.WINDOW_NAME;
        modal.id = fp.window.WINDOW_NAME;
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.border = "none";
        modal.style.position = "relative";
        modal.setAttribute("border", 0);
        modal.setAttribute("frameborder", 0);
        modal.setAttribute("frameBorder", 0);
        modal.setAttribute("marginwidth", 0);
        modal.setAttribute("marginheight", 0);
        modal.src = modalUrl;
        container.appendChild(modal);
        shade.appendChild(close);
        shade.appendChild(container);
        document.body.appendChild(shade);
        var body = getHtmlTag();
        if (body) {
            body.style.overflow = "hidden";
        }
        return modal;
    };
    var createModalShade = function(onClose) {
        var shade = document.createElement("div");
        shade.id = SHADE_NAME;
        shade.className = "fp__overlay";
        shade.onclick = getCloseModal(onClose);
        return shade;
    };
    var createModalContainer = function() {
        var modalcontainer = document.createElement("div");
        modalcontainer.id = WINDOW_CONTAINER_NAME;
        modalcontainer.className = "fp__container";
        return modalcontainer;
    };
    var createModalClose = function(onClose) {
        var close = document.createElement("div");
        close.className = "fp__close";
        var closeAnchor = document.createElement("a");
        closeAnchor.appendChild(document.createTextNode("X"));
        close.appendChild(closeAnchor);
        closeAnchor.onclick = getCloseModal(onClose);
        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode === 27) {
                getCloseModal(onClose)();
            }
        };
        return close;
    };
    var getCloseModal = function(onClose, force) {
        force = !!force;
        return function() {
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
            try {
                delete window.frames[fp.window.WINDOW_NAME];
            } catch (e) {}
            if (onClose) {
                onClose();
            }
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
    function setOriginalOverflow() {
        var body = getHtmlTag();
        if (body) {
            body.style.overflow = originalOverflow;
        }
    }
    function appendStyle() {
        var css = ".fp__overlay {top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;background: rgba(0, 0, 0, 0.8);}" + ".fp__close {top: 104px; right: 108px; width: 35px; height: 35px; z-index: 20; cursor: pointer}" + "@media screen and (max-width: 768px), screen and (max-height: 500px) {.fp__close {top: 15px; right: 12px;}}" + ".fp__close a {text-indent: -9999px; overflow: hidden; display: block; width: 100%; height: 100%; background: url(https://d1zyh3sbxittvg.cloudfront.net/close.png) 50% 50% no-repeat;}" + ".fp__close a:hover {background-color: rgba(0,0,0, .02); opacity: .8;}" + "@media screen and (max-width: 768px), screen and (max-height: 500px) {top: 14px; right: 14px;}" + ".fp__copy {display: none;}" + ".fp__container {-webkit-overflow-scrolling: touch; overflow: hidden; min-height: 300px; top: 100px;right: 100px;bottom: 100px;left: 100px;background: #eee; box-sizing:content-box; -webkit-box-sizing:content-box; -moz-box-sizing:content-box;}" + "@media screen and (max-width: 768px), screen and (max-height: 500px) {.fp__copy {bottom: 0; left: 0; right: 0; height: 20px; background: #333;}}" + "@media screen and (max-width: 768px), screen and (max-height: 500px) {.fp__copy a {margin-left: 5px;}}" + "@media screen and (max-width: 768px), screen and (max-height: 500px) {.fp__container {top: 0;right: 0;bottom: 0;left: 0;}}" + ".fp__overlay, .fp__close, .fp__copy, .fp__container {position: fixed;}";
        var head = document.head || document.getElementsByTagName("head")[0], style = document.createElement("style");
        style.type = "text/css";
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    }
    function getHtmlTag() {
        try {
            return document.getElementsByTagName("html")[0];
        } catch (err) {
            return null;
        }
    }
    var closeModal = getCloseModal(function() {});
    return {
        generate: generateModal,
        close: closeModal,
        hide: hide
    };
});

"use strict";

filepicker.extend("picker", function() {
    var fp = this;
    var normalizeOptions = function(options) {
        var normalize = function(singular, plural, def) {
            if (options[plural]) {
                if (!fp.util.isArray(options[plural])) {
                    options[plural] = [ options[plural] ];
                }
            } else if (options[singular]) {
                options[plural] = [ options[singular] ];
            } else if (def) {
                options[plural] = def;
            }
        };
        normalize("service", "services");
        normalize("mimetype", "mimetypes");
        normalize("extension", "extensions");
        if (options.services) {
            for (var i = 0; i < options.services.length; i++) {
                var service = ("" + options.services[i]).replace(" ", "");
                if (fp.services[service] !== undefined) {
                    service = fp.services[service];
                }
                options.services[i] = service;
            }
        }
        if (options.mimetypes && options.extensions) {
            throw fp.FilepickerException("Error: Cannot pass in both mimetype and extension parameters to the pick function");
        }
        if (!options.mimetypes && !options.extensions) {
            options.mimetypes = [ "*/*" ];
        }
        if (options.openTo) {
            options.openTo = fp.services[options.openTo] || options.openTo;
        }
        fp.util.setDefault(options, "container", fp.browser.isMobile ? "window" : "modal");
    };
    var getPickHandler = function(onSuccess, onError, onProgress) {
        var handler = function(data) {
            if (filterDataType(data, onProgress)) {
                return;
            }
            fp.uploading = false;
            if (data.error) {
                fp.util.console.error(data.error);
                onError(fp.errors.FPError(102));
            } else {
                var fpfile = fpfileFromPayload(data.payload);
                onSuccess(fpfile);
            }
            fp.modal.close();
        };
        return handler;
    };
    var getPickFolderHandler = function(onSuccess, onError, onProgress) {
        var handler = function(data) {
            if (filterDataType(data, onProgress)) {
                return;
            }
            fp.uploading = false;
            if (data.error) {
                fp.util.console.error(data.error);
                onError(fp.errors.FPError(102));
            } else {
                data.payload.data.url = data.payload.url;
                onSuccess(data.payload.data);
            }
            fp.modal.close();
        };
        return handler;
    };
    var getUploadingHandler = function(onUploading) {
        onUploading = onUploading || function() {};
        var handler = function(data) {
            if (data.type !== "uploading") {
                return;
            }
            fp.uploading = !!data.payload;
            onUploading(fp.uploading);
        };
        return handler;
    };
    var addIfExist = function(data, fpfile, key) {
        if (data[key]) {
            fpfile[key] = data[key];
        }
    };
    var fpfileFromPayload = function(payload) {
        var fpfile = {};
        var url = payload.url;
        if (url && url.url) {
            url = url.url;
        }
        fpfile.url = url;
        var data = payload.url.data || payload.data;
        fpfile.filename = data.filename;
        fpfile.mimetype = data.type;
        fpfile.size = data.size;
        addIfExist(data, fpfile, "id");
        addIfExist(data, fpfile, "key");
        addIfExist(data, fpfile, "container");
        addIfExist(data, fpfile, "path");
        fpfile.isWriteable = true;
        return fpfile;
    };
    var getPickMultipleHandler = function(onSuccess, onError, onProgress) {
        var handler = function(data) {
            if (filterDataType(data, onProgress)) {
                return;
            }
            fp.uploading = false;
            if (data.error) {
                fp.util.console.error(data.error);
                onError(fp.errors.FPError(102));
            } else {
                var fpfiles = [];
                if (!fp.util.isArray(data.payload)) {
                    data.payload = [ data.payload ];
                }
                for (var i = 0; i < data.payload.length; i++) {
                    var fpfile = fpfileFromPayload(data.payload[i]);
                    fpfiles.push(fpfile);
                }
                onSuccess(fpfiles);
            }
            fp.modal.close();
        };
        return handler;
    };
    var createPicker = function(options, onSuccess, onError, multiple, folder, onProgress, convertFile) {
        normalizeOptions(options);
        if (options.debug) {
            var dumy_data = {
                url: "https://www.filepicker.io/api/file/-nBq2onTSemLBxlcBWn1",
                filename: "test.png",
                mimetype: "image/png",
                size: 58979
            };
            var dumy_callback;
            if (multiple || options.storeLocation) {
                dumy_callback = [ dumy_data, dumy_data, dumy_data ];
            } else {
                dumy_callback = dumy_data;
            }
            setTimeout(function() {
                onSuccess(dumy_callback);
            }, 1);
            return;
        }
        if (fp.cookies.THIRD_PARTY_COOKIES === undefined) {
            var alreadyHandled = false;
            fp.cookies.checkThirdParty(function() {
                if (!alreadyHandled) {
                    createPicker(options, onSuccess, onError, !!multiple, folder, onProgress);
                    alreadyHandled = true;
                }
            });
            return;
        }
        var id = fp.util.getId();
        var finished = false;
        var onSuccessMark = function(fpfile) {
            if (options.container === "window") {
                window.onbeforeunload = null;
            }
            finished = true;
            onSuccess(fpfile);
        };
        var onErrorMark = function(fperror) {
            finished = true;
            onError(fperror);
        };
        var onClose = function() {
            if (!finished) {
                finished = true;
                onError(fp.errors.FPError(101));
            }
        };
        var url;
        var handler;
        if (convertFile) {
            url = fp.urls.constructConvertUrl(options, id);
            handler = getPickHandler(onSuccessMark, onErrorMark, onProgress);
        } else if (multiple) {
            url = fp.urls.constructPickUrl(options, id, true);
            handler = getPickMultipleHandler(onSuccessMark, onErrorMark, onProgress);
        } else if (folder) {
            url = fp.urls.constructPickFolderUrl(options, id);
            handler = getPickFolderHandler(onSuccessMark, onErrorMark, onProgress);
        } else {
            url = fp.urls.constructPickUrl(options, id, false);
            handler = getPickHandler(onSuccessMark, onErrorMark, onProgress);
        }
        fp.window.open(options.container, options.mobile, url, onClose);
        fp.handlers.attach(id, handler);
        var key = id + "-upload";
        fp.handlers.attach(key, getUploadingHandler(function() {
            fp.handlers.detach(key);
        }));
    };
    function filterDataType(data, onProgress) {
        if (data.type === "filepickerProgress") {
            fp.uploading = true;
            if (onProgress) {
                onProgress(data.payload.data);
            }
        } else if (data.type === "notUploading") {
            fp.uploading = false;
        } else if (data.type === "closeModal") {
            fp.modal.close();
        } else if (data.type === "hideModal") {
            fp.modal.hide();
        } else if (data.type === "filepickerUrl") {
            return false;
        }
        return true;
    }
    return {
        createPicker: createPicker
    };
});

"use strict";

filepicker.extend("window", function() {
    var fp = this;
    var DIALOG_TYPES = {
        OPEN: "/dialog/open/",
        SAVEAS: "/dialog/save/"
    };
    var WINDOW_NAME = "filepicker_dialog";
    var WINDOW_PROPERTIES = "left=100,top=100,height=600,width=800,menubar=no,toolbar=no,location=no,personalbar=no,status=no,resizable=yes,scrollbars=yes,dependent=yes,dialog=yes";
    var CLOSE_CHECK_INTERVAL = 100;
    var getWindowSize = function() {
        var winW, winH;
        if (document.body && document.body.offsetWidth) {
            winW = document.body.offsetWidth;
            winH = document.body.offsetHeight;
        }
        if (document.compatMode === "CSS1Compat" && document.documentElement && document.documentElement.offsetWidth) {
            winW = document.documentElement.offsetWidth;
            winH = document.documentElement.offsetHeight;
        }
        if (window.innerWidth && window.innerHeight) {
            winW = window.innerWidth;
            winH = window.innerHeight;
        }
        return [ winW, winH ];
    };
    var openWindow = function(container, mobileOption, src, onClose) {
        onClose = onClose || function() {};
        var isMobile = fp.browser.isIOS() || fp.browser.isAndroid();
        if (!container && isMobile) {
            container = "window";
        } else if (!container) {
            container = "modal";
        }
        if (container === "window") {
            var name = WINDOW_NAME + fp.util.getId();
            window.onbeforeunload = function confirmExit() {
                return "Filepicker upload does not complete.";
            };
            var win = window.open(src, name, WINDOW_PROPERTIES);
            if (!win) {
                window.onbeforeunload = null;
                window.alert("Please disable your popup blocker to upload files.");
            }
            var closeCheck = window.setInterval(function() {
                if (!win || win.closed) {
                    window.onbeforeunload = null;
                    window.clearInterval(closeCheck);
                    onClose();
                }
            }, CLOSE_CHECK_INTERVAL);
        } else if (container === "modal") {
            fp.modal.generate(src, onClose);
        } else {
            var container_iframe = document.getElementById(container);
            if (!container_iframe) {
                throw new fp.FilepickerException('Container "' + container + '" not found. This should either be set to "window","modal", or the ID of an iframe that is currently in the document.');
            }
            container_iframe.src = src;
        }
    };
    return {
        open: openWindow,
        WINDOW_NAME: WINDOW_NAME,
        getSize: getWindowSize
    };
});

"use strict";

filepicker.extend("conversions", function() {
    var fp = this;
    var valid_parameters = {
        align: "string",
        blurAmount: "number",
        crop: "string or array",
        crop_first: "boolean",
        compress: "boolean",
        exif: "string or boolean",
        filter: "string",
        fit: "string",
        format: "string",
        height: "number",
        policy: "string",
        quality: "number",
        page: "number",
        rotate: "string or number",
        secure: "boolean",
        sharpenAmount: "number",
        signature: "string",
        storeAccess: "string",
        storeContainer: "string",
        storeLocation: "string",
        storePath: "string",
        text: "string",
        text_align: "string",
        text_color: "string",
        text_font: "string",
        text_padding: "number",
        text_size: "number",
        watermark: "string",
        watermark_position: "string",
        watermark_size: "number",
        width: "number"
    };
    var rest_map = {
        w: "width",
        h: "height"
    };
    var mapRestParams = function(options) {
        var obj = {};
        for (var key in options) {
            obj[rest_map[key] || key] = options[key];
            if (valid_parameters[rest_map[key] || key] === "number") {
                obj[rest_map[key] || key] = Number(options[key]);
            }
        }
        return obj;
    };
    var checkParameters = function(options) {
        var found;
        for (var key in options) {
            found = false;
            for (var test in valid_parameters) {
                if (key === test) {
                    found = true;
                    if (valid_parameters[test].indexOf(fp.util.typeOf(options[key])) === -1) {
                        throw new fp.FilepickerException("Conversion parameter " + key + " is not the right type: " + options[key] + ". Should be a " + valid_parameters[test]);
                    }
                }
            }
            if (!found) {
                throw new fp.FilepickerException("Conversion parameter " + key + " is not a valid parameter.");
            }
        }
    };
    var convert = function(fp_url, options, onSuccess, onError, onProgress) {
        checkParameters(options);
        if (options.crop && fp.util.isArray(options.crop)) {
            options.crop = options.crop.join(",");
        }
        fp.ajax.post(fp_url + "/convert", {
            data: options,
            json: true,
            success: function(fpfile) {
                onSuccess(fp.util.standardizeFPFile(fpfile));
            },
            error: function(msg, status, xhr) {
                if (msg === "not_found") {
                    onError(new fp.errors.FPError(141));
                } else if (msg === "bad_params") {
                    onError(new fp.errors.FPError(142));
                } else if (msg === "not_authorized") {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(143));
                }
            },
            progress: onProgress
        });
    };
    return {
        convert: convert,
        mapRestParams: mapRestParams
    };
});

"use strict";

filepicker.extend("errors", function() {
    var fp = this;
    var FPError = function(code) {
        if (this === window) {
            return new FPError(code);
        }
        this.code = code;
        if (filepicker.debug) {
            var info = filepicker.error_map[this.code];
            this.message = info.message;
            this.moreInfo = info.moreInfo;
            this.toString = function() {
                return "FPError " + this.code + ": " + this.message + ". For help, see " + this.moreInfo;
            };
        } else {
            this.toString = function() {
                return "FPError " + this.code + ". Include filepicker_debug.js for more info";
            };
        }
        return this;
    };
    FPError.isClass = true;
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

"use strict";

filepicker.extend(function() {
    var fp = this;
    fp.API_VERSION = "v2";
    var setKey = function(key) {
        fp.apikey = key;
    };
    var FilepickerException = function(text) {
        this.text = text;
        this.toString = function() {
            return "FilepickerException: " + this.text;
        };
        return this;
    };
    FilepickerException.isClass = true;
    var checkApiKey = function() {
        if (!fp.apikey) {
            throw new fp.FilepickerException("API Key not found");
        }
    };
    var pick = function(options, onSuccess, onError, onProgress) {
        checkApiKey();
        if (typeof options === "function") {
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        fp.picker.createPicker(options, onSuccess, onError, false, false, onProgress);
    };
    var pickMultiple = function(options, onSuccess, onError, onProgress) {
        checkApiKey();
        if (typeof options === "function") {
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        fp.picker.createPicker(options, onSuccess, onError, true, false, onProgress);
    };
    var pickAndStore = function(picker_options, store_options, onSuccess, onError, onProgress) {
        checkApiKey();
        if (!picker_options || !store_options || typeof picker_options === "function" || typeof picker_options === "function") {
            throw new fp.FilepickerException("Not all required parameters given, missing picker or store options");
        }
        onError = onError || fp.errors.handleError;
        var multiple = !!picker_options.multiple;
        var options = !!picker_options ? fp.util.clone(picker_options) : {};
        options.storeLocation = store_options.location || "S3";
        options.storePath = store_options.path;
        options.storeContainer = store_options.storeContainer || store_options.container;
        options.storeAccess = store_options.access || "private";
        if (multiple && options.storePath) {
            if (options.storePath.charAt(options.storePath.length - 1) !== "/") {
                throw new fp.FilepickerException("pickAndStore with multiple files requires a path that ends in " / "");
            }
        }
        var success = onSuccess;
        if (!multiple) {
            success = function(resp) {
                onSuccess([ resp ]);
            };
        }
        fp.picker.createPicker(options, success, onError, multiple, false, onProgress);
    };
    var pickFolder = function(options, onSuccess, onError, onProgress) {
        checkApiKey();
        if (typeof options === "function") {
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        fp.picker.createPicker(options, onSuccess, onError, false, true, onProgress);
    };
    var read = function(input, options, onSuccess, onError, onProgress) {
        checkApiKey();
        if (!input) {
            throw new fp.FilepickerException("No input given - nothing to read!");
        }
        if (typeof options === "function") {
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function() {};
        if (typeof input === "string") {
            if (fp.util.isFPUrl(input)) {
                fp.files.readFromFPUrl(input, options, onSuccess, onError, onProgress);
            } else {
                fp.files.readFromUrl(input, options, onSuccess, onError, onProgress);
            }
        } else if (fp.util.isFileInputElement(input)) {
            if (!input.files) {
                storeThenRead(input, options, onSuccess, onError, onProgress);
            } else if (input.files.length === 0) {
                onError(new fp.errors.FPError(115));
            } else {
                fp.files.readFromFile(input.files[0], options, onSuccess, onError, onProgress);
            }
        } else if (fp.util.isFile(input)) {
            fp.files.readFromFile(input, options, onSuccess, onError, onProgress);
        } else if (input.url) {
            fp.files.readFromFPUrl(input.url, options, onSuccess, onError, onProgress);
        } else {
            throw new fp.FilepickerException("Cannot read given input: " + input + ". Not a url, file input, DOM File, or FPFile object.");
        }
    };
    var storeThenRead = function(input, readOptions, onSuccess, onError, onProgress) {
        onProgress(10);
        fp.store(input, function(fpfile) {
            onProgress(50);
            fp.read(fpfile, readOptions, onSuccess, onError, function(progress) {
                onProgress(50 + progress / 2);
            });
        }, onError);
    };
    var write = function(fpfile, input, options, onSuccess, onError, onProgress) {
        checkApiKey();
        if (!fpfile) {
            throw new fp.FilepickerException("No fpfile given - nothing to write to!");
        }
        if (input === undefined || input === null) {
            throw new fp.FilepickerException("No input given - nothing to write!");
        }
        if (typeof options === "function") {
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function() {};
        var fp_url;
        if (fp.util.isFPUrl(fpfile)) {
            fp_url = fpfile;
        } else if (fpfile.url) {
            fp_url = fpfile.url;
        } else {
            throw new fp.FilepickerException("Invalid file to write to: " + fpfile + ". Not a filepicker url or FPFile object.");
        }
        fp_url = fp.util.trimConvert(fp_url);
        if (typeof input === "string") {
            fp.files.writeDataToFPUrl(fp_url, input, options, onSuccess, onError, onProgress);
        } else {
            if (fp.util.isFileInputElement(input)) {
                if (!input.files) {
                    fp.files.writeFileInputToFPUrl(fp_url, input, options, onSuccess, onError, onProgress);
                } else if (input.files.length === 0) {
                    onError(new fp.errors.FPError(115));
                } else {
                    fp.files.writeFileToFPUrl(fp_url, input.files[0], options, onSuccess, onError, onProgress);
                }
            } else if (fp.util.isFile(input)) {
                fp.files.writeFileToFPUrl(fp_url, input, options, onSuccess, onError, onProgress);
            } else if (input.url) {
                fp.files.writeUrlToFPUrl(fp_url, input.url, options, onSuccess, onError, onProgress);
            } else {
                throw new fp.FilepickerException("Cannot read from given input: " + input + ". Not a string, file input, DOM File, or FPFile object.");
            }
        }
    };
    var writeUrl = function(fpfile, input, options, onSuccess, onError, onProgress) {
        checkApiKey();
        if (!fpfile) {
            throw new fp.FilepickerException("No fpfile given - nothing to write to!");
        }
        if (input === undefined || input === null) {
            throw new fp.FilepickerException("No input given - nothing to write!");
        }
        if (typeof options === "function") {
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function() {};
        var fp_url;
        if (fp.util.isFPUrl(fpfile)) {
            fp_url = fpfile;
        } else if (fpfile.url) {
            fp_url = fpfile.url;
        } else {
            throw new fp.FilepickerException("Invalid file to write to: " + fpfile + ". Not a filepicker url or FPFile object.");
        }
        fp.files.writeUrlToFPUrl(fp.util.trimConvert(fp_url), input, options, onSuccess, onError, onProgress);
    };
    var exportFn = function(input, options, onSuccess, onError) {
        checkApiKey();
        if (typeof options === "function") {
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = !!options ? fp.util.clone(options) : {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        var fp_url;
        if (typeof input === "string" && fp.util.isUrl(input)) {
            fp_url = input;
        } else if (input.url) {
            fp_url = input.url;
            if (!options.mimetype && !options.extension) {
                options.mimetype = input.mimetype;
            }
            if (!options.suggestedFilename) {
                options.suggestedFilename = input.filename;
            }
        } else {
            throw new fp.FilepickerException("Invalid file to export: " + input + ". Not a valid url or FPFile object. You may want to use filepicker.store() to get an FPFile to export");
        }
        if (options.suggestedFilename) {
            options.suggestedFilename = encodeURI(options.suggestedFilename);
        }
        fp.exporter.createExporter(fp_url, options, onSuccess, onError);
    };
    var processImage = function(input, options, onSuccess, onError, onProgress) {
        var convertUrl;
        checkApiKey();
        if (typeof options === "function") {
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        if (typeof input === "string" && fp.util.isFPUrlCdn(input)) {
            convertUrl = input;
        } else if (input.url && fp.util.isFPUrl(input.url)) {
            convertUrl = input.url;
            if (!options.filename) {
                options.filename = input.filename;
            }
        } else {
            throw new fp.FilepickerException("Invalid file to convert: " + input + ". Not a valid url or FPFile object or not filepicker url. You can convert only filepicker url images.");
        }
        options.convertUrl = convertUrl;
        options.multiple = false;
        options.services = [ "CONVERT", "COMPUTER" ];
        options.backgroundUpload = true;
        options.hide = false;
        fp.picker.createPicker(options, onSuccess, onError, false, false, onProgress, true);
    };
    var store = function(input, options, onSuccess, onError, onProgress) {
        checkApiKey();
        if (typeof options === "function") {
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = !!options ? fp.util.clone(options) : {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function() {};
        if (typeof input === "string") {
            fp.files.storeData(input, options, onSuccess, onError, onProgress);
        } else {
            if (fp.util.isFileInputElement(input)) {
                if (!input.files) {
                    fp.files.storeFileInput(input, options, onSuccess, onError, onProgress);
                } else if (input.files.length === 0) {
                    onError(new fp.errors.FPError(115));
                } else {
                    fp.files.storeFile(input.files[0], options, onSuccess, onError, onProgress);
                }
            } else if (fp.util.isFile(input)) {
                fp.files.storeFile(input, options, onSuccess, onError, onProgress);
            } else if (input.url) {
                if (!options.filename) {
                    options.filename = input.filename;
                }
                fp.files.storeUrl(input.url, options, onSuccess, onError, onProgress);
            } else {
                throw new fp.FilepickerException("Cannot store given input: " + input + ". Not a string, file input, DOM File, or FPFile object.");
            }
        }
    };
    var storeUrl = function(input, options, onSuccess, onError, onProgress) {
        checkApiKey();
        if (typeof options === "function") {
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function() {};
        fp.files.storeUrl(input, options, onSuccess, onError, onProgress);
    };
    var stat = function(fpfile, options, onSuccess, onError) {
        checkApiKey();
        if (typeof options === "function") {
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        var fp_url;
        if (fp.util.isFPUrl(fpfile)) {
            fp_url = fpfile;
        } else if (fpfile.url) {
            fp_url = fpfile.url;
        } else {
            throw new fp.FilepickerException("Invalid file to get metadata for: " + fpfile + ". Not a filepicker url or FPFile object.");
        }
        fp.files.stat(fp.util.trimConvert(fp_url), options, onSuccess, onError);
    };
    var remove = function(fpfile, options, onSuccess, onError) {
        checkApiKey();
        if (typeof options === "function") {
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }
        options = options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        var fp_url;
        if (fp.util.isFPUrl(fpfile)) {
            fp_url = fpfile;
        } else if (fpfile.url) {
            fp_url = fpfile.url;
        } else {
            throw new fp.FilepickerException("Invalid file to remove: " + fpfile + ". Not a filepicker url or FPFile object.");
        }
        fp.files.remove(fp.util.trimConvert(fp_url), options, onSuccess, onError);
    };
    var convert = function(fpfile, convert_options, store_options, onSuccess, onError, onProgress) {
        checkApiKey();
        if (!fpfile) {
            throw new fp.FilepickerException("No fpfile given - nothing to convert!");
        }
        if (typeof store_options === "function") {
            onProgress = onError;
            onError = onSuccess;
            onSuccess = store_options;
            store_options = {};
        }
        var options = !!convert_options ? fp.util.clone(convert_options) : {};
        store_options = store_options || {};
        onSuccess = onSuccess || function() {};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function() {};
        if (store_options.location) {
            options.storeLocation = store_options.location;
        }
        if (store_options.path) {
            options.storePath = store_options.path;
        }
        if (store_options.container) {
            options.storeContainer = store_options.container;
        }
        options.storeAccess = store_options.access || "private";
        var fp_url;
        if (fp.util.isFPUrl(fpfile)) {
            fp_url = fpfile;
        } else if (fpfile.url) {
            fp_url = fpfile.url;
            if (!fp.mimetypes.matchesMimetype(fpfile.mimetype, "image/*") && !fp.mimetypes.matchesMimetype(fpfile.mimetype, "application/pdf")) {
                onError(new fp.errors.FPError(142));
                return;
            }
        } else {
            throw new fp.FilepickerException("Invalid file to convert: " + fpfile + ". Not a filepicker url or FPFile object.");
        }
        if (fp_url.indexOf("/convert") > -1) {
            var restConvertOptions = fp.util.parseUrl(fp_url).params;
            restConvertOptions = fp.conversions.mapRestParams(restConvertOptions);
            if (restConvertOptions.crop) {
                fp.util.setDefault(restConvertOptions, "crop_first", true);
            }
            for (var attr in restConvertOptions) {
                fp.util.setDefault(options, attr, restConvertOptions[attr]);
            }
        }
        fp.conversions.convert(fp.util.trimConvert(fp_url), options, onSuccess, onError, onProgress);
    };
    var constructWidget = function(base) {
        return fp.widgets.constructWidget(base);
    };
    var makeDropPane = function(div, options) {
        return fp.dragdrop.makeDropPane(div, options);
    };
    return {
        setKey: setKey,
        pick: pick,
        pickFolder: pickFolder,
        pickMultiple: pickMultiple,
        pickAndStore: pickAndStore,
        read: read,
        write: write,
        writeUrl: writeUrl,
        "export": exportFn,
        exportFile: exportFn,
        processImage: processImage,
        store: store,
        storeUrl: storeUrl,
        stat: stat,
        metadata: stat,
        remove: remove,
        convert: convert,
        constructWidget: constructWidget,
        makeDropPane: makeDropPane,
        FilepickerException: FilepickerException
    };
}, true);

"use strict";

filepicker.extend("mimetypes", function() {
    var fp = this;
    var mimetype_extension_map = {
        ".stl": "application/sla",
        ".hbs": "text/html",
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".jpe": "image/jpeg",
        ".imp": "application/x-impressionist"
    };
    var mimetype_bad_array = [ "application/octet-stream", "application/download", "application/force-download", "octet/stream", "application/unknown", "application/x-download", "application/x-msdownload", "application/x-secure-download" ];
    var getMimetype = function(file) {
        if (file.type) {
            var type = file.type;
            type = type.toLowerCase();
            var bad_type = false;
            for (var n = 0; n < mimetype_bad_array.length; n++) {
                bad_type = bad_type || type === mimetype_bad_array[n];
            }
            if (!bad_type) {
                return file.type;
            }
        }
        var filename = file.name || file.fileName;
        var extension = filename.match(/\.\w*$/);
        if (extension) {
            return mimetype_extension_map[extension[0].toLowerCase()] || "";
        } else {
            if (file.type) {
                return file.type;
            } else {
                return "";
            }
        }
    };
    var matchesMimetype = function(test, against) {
        if (!test) {
            return against === "*/*";
        }
        test = fp.util.trim(test).toLowerCase();
        against = fp.util.trim(against).toLowerCase();
        for (var n = 0; n < mimetype_bad_array.length; n++) {
            if (test === mimetype_bad_array[n]) {
                return true;
            }
        }
        var test_parts = test.split("/"), against_parts = against.split("/");
        if (against_parts[0] === "*") {
            return true;
        }
        if (against_parts[0] !== test_parts[0]) {
            return false;
        }
        if (against_parts[1] === "*") {
            return true;
        }
        return against_parts[1] === test_parts[1];
    };
    return {
        getMimetype: getMimetype,
        matchesMimetype: matchesMimetype
    };
});

"use strict";

filepicker.extend("services", function() {
    return {
        COMPUTER: 1,
        DROPBOX: 2,
        FACEBOOK: 3,
        GITHUB: 4,
        GMAIL: 5,
        IMAGE_SEARCH: 6,
        URL: 7,
        WEBCAM: 8,
        GOOGLE_DRIVE: 9,
        SEND_EMAIL: 10,
        INSTAGRAM: 11,
        FLICKR: 12,
        VIDEO: 13,
        EVERNOTE: 14,
        PICASA: 15,
        WEBDAV: 16,
        FTP: 17,
        ALFRESCO: 18,
        BOX: 19,
        SKYDRIVE: 20,
        GDRIVE: 21,
        CUSTOMSOURCE: 22,
        CLOUDDRIVE: 23,
        GENERIC: 24,
        CONVERT: 25
    };
}, true);

"use strict";

filepicker.extend("urls", function() {
    var fp = this;
    var base = "https://www.filepicker.io";
    if (window.filepicker.hostname) {
        base = window.filepicker.hostname;
    }
    var dialog_base = base.replace("www", "dialog"), pick_url = dialog_base + "/dialog/open/", export_url = dialog_base + "/dialog/save/", convert_url = dialog_base + "/dialog/process/", pick_folder_url = dialog_base + "/dialog/folder/", store_url = base + "/api/store/";
    var allowedConversions = [ "crop", "rotate", "filter" ];
    var constructPickUrl = function(options, id, multiple) {
        return pick_url + constructModalQuery(options, id) + (multiple ? "&multi=" + !!multiple : "") + (options.mimetypes !== undefined ? "&m=" + options.mimetypes.join(",") : "") + (options.extensions !== undefined ? "&ext=" + options.extensions.join(",") : "") + (options.maxSize ? "&maxSize=" + options.maxSize : "") + (options.maxFiles ? "&maxFiles=" + options.maxFiles : "") + (options.folders !== undefined ? "&folders=" + options.folders : "") + (options.storeLocation ? "&storeLocation=" + options.storeLocation : "") + (options.storePath ? "&storePath=" + options.storePath : "") + (options.storeContainer ? "&storeContainer=" + options.storeContainer : "") + (options.storeAccess ? "&storeAccess=" + options.storeAccess : "") + (options.webcamDim ? "&wdim=" + options.webcamDim.join(",") : "") + constructConversionsQuery(options.conversions);
    };
    var constructConvertUrl = function(options, id) {
        var url = options.convertUrl;
        if (url.indexOf("&") >= 0 || url.indexOf("?") >= 0) {
            url = encodeURIComponent(url);
        }
        return convert_url + constructModalQuery(options, id) + "&curl=" + url + constructConversionsQuery(options.conversions);
    };
    var constructPickFolderUrl = function(options, id) {
        return pick_folder_url + constructModalQuery(options, id);
    };
    var constructExportUrl = function(url, options, id) {
        if (url.indexOf("&") >= 0 || url.indexOf("?") >= 0) {
            url = encodeURIComponent(url);
        }
        return export_url + constructModalQuery(options, id) + "&url=" + url + (options.mimetype !== undefined ? "&m=" + options.mimetype : "") + (options.extension !== undefined ? "&ext=" + options.extension : "") + (options.suggestedFilename ? "&defaultSaveasName=" + options.suggestedFilename : "");
    };
    var constructStoreUrl = function(options) {
        return store_url + options.location + "?key=" + fp.apikey + (options.base64decode ? "&base64decode=true" : "") + (options.mimetype ? "&mimetype=" + options.mimetype : "") + (options.filename ? "&filename=" + encodeURIComponent(options.filename) : "") + (options.path ? "&path=" + options.path : "") + (options.container ? "&container=" + options.container : "") + (options.access ? "&access=" + options.access : "") + constructSecurityQuery(options) + "&plugin=" + getPlugin();
    };
    var constructWriteUrl = function(fp_url, options) {
        return fp_url + "?nonce=fp" + (!!options.base64decode ? "&base64decode=true" : "") + (options.mimetype ? "&mimetype=" + options.mimetype : "") + constructSecurityQuery(options) + "&plugin=" + getPlugin();
    };
    var constructHostCommFallback = function() {
        var parts = fp.util.parseUrl(window.location.href);
        return parts.origin + "/404";
    };
    function constructModalQuery(options, id) {
        return "?key=" + fp.apikey + "&id=" + id + "&referrer=" + window.location.hostname + "&iframe=" + (options.container !== "window") + "&version=" + fp.API_VERSION + (options.services ? "&s=" + options.services.join(",") : "") + (options.container !== undefined ? "&container=" + options.container : "modal") + (options.openTo ? "&loc=" + options.openTo : "") + "&language=" + (options.language || fp.browser.getLanguage()) + (options.mobile !== undefined ? "&mobile=" + options.mobile : "") + (options.backgroundUpload !== undefined ? "&bu=" + options.backgroundUpload : "") + (options.cropRatio ? "&cratio=" + options.cropRatio : "") + (options.cropDim ? "&cdim=" + options.cropDim.join(",") : "") + (options.cropMax ? "&cmax=" + options.cropMax.join(",") : "") + (options.cropMin ? "&cmin=" + options.cropMin.join(",") : "") + (options.cropForce !== undefined ? "&cforce=" + options.cropForce : "") + (options.hide !== undefined ? "&hide=" + options.hide : "") + (options.customCss ? "&css=" + encodeURIComponent(options.customCss) : "") + (options.customText ? "&text=" + encodeURIComponent(options.customText) : "") + (options.imageMin ? "&imin=" + options.imageMin.join(",") : "") + (options.imageMax ? "&imax=" + options.imageMax.join(",") : "") + (options.imageDim ? "&idim=" + options.imageDim.join(",") : "") + (options.imageQuality ? "&iq=" + options.imageQuality : "") + (fp.util.isCanvasSupported() ? "" : "&canvas=false") + (options.redirectUrl ? "&redirect_url=" + options.redirectUrl : "") + (options.showClose && options.container !== "modal" ? "&showClose=" + options.showClose : "") + constructSecurityQuery(options) + "&plugin=" + getPlugin();
    }
    function constructSecurityQuery(options) {
        return (options.signature ? "&signature=" + options.signature : "") + (options.policy ? "&policy=" + options.policy : "");
    }
    function getPlugin() {
        return filepicker.plugin || "js_lib";
    }
    function constructConversionsQuery(conversions) {
        conversions = conversions || [];
        var allowed = conversions.filter(function(option) {
            if (allowedConversions.indexOf(option) > -1) {
                return option;
            }
        });
        if (!allowed.length) {
            allowed.push("crop");
        }
        return "&co=" + allowed.join(",");
    }
    return {
        BASE: base,
        DIALOG_BASE: dialog_base,
        API_COMM: base + "/dialog/comm_iframe/",
        COMM: dialog_base + "/dialog/comm_iframe/",
        FP_COMM_FALLBACK: dialog_base + "/dialog/comm_hash_iframe/",
        STORE: store_url,
        PICK: pick_url,
        EXPORT: export_url,
        constructPickUrl: constructPickUrl,
        constructConvertUrl: constructConvertUrl,
        constructPickFolderUrl: constructPickFolderUrl,
        constructExportUrl: constructExportUrl,
        constructWriteUrl: constructWriteUrl,
        constructStoreUrl: constructStoreUrl,
        constructHostCommFallback: constructHostCommFallback,
        getPlugin: getPlugin
    };
});

"use strict";

filepicker.extend("ajax", function() {
    var fp = this;
    var get_request = function(url, options) {
        options.method = "GET";
        make_request(url, options);
    };
    var post_request = function(url, options) {
        options.method = "POST";
        url += (url.indexOf("?") >= 0 ? "&" : "?") + "_cacheBust=" + fp.util.getId();
        make_request(url, options);
    };
    var toQueryString = function(object, base) {
        var queryString = [];
        for (var key in object) {
            var value = object[key];
            if (base) {
                key = base + ". + key + ";
            }
            var result;
            switch (fp.util.typeOf(value)) {
              case "object":
                result = toQueryString(value, key);
                break;

              case "array":
                var qs = {};
                for (var i = 0; i < value.length; i++) {
                    qs[i] = value[i];
                }
                result = toQueryString(qs, key);
                break;

              default:
                result = key + "=" + encodeURIComponent(value);
                break;
            }
            if (value !== null) {
                queryString.push(result);
            }
        }
        return queryString.join("&");
    };
    var getXhr = function() {
        try {
            return new window.XMLHttpRequest();
        } catch (e) {
            try {
                return new window.ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    return new window.ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    return null;
                }
            }
        }
    };
    var make_request = function(url, options) {
        url = url || "";
        var method = options.method ? options.method.toUpperCase() : "POST";
        var success = options.success || function() {};
        var error = options.error || function() {};
        var async = options.async === undefined ? true : options.async;
        var data = options.data || null;
        var processData = options.processData === undefined ? true : options.processData;
        var headers = options.headers || {};
        var urlParts = fp.util.parseUrl(url);
        var origin = window.location.protocol + "//" + window.location.host;
        var crossdomain = origin !== urlParts.origin;
        var finished = false;
        url += (url.indexOf("?") >= 0 ? "&" : "?") + "plugin=" + fp.urls.getPlugin();
        if (data && processData) {
            data = toQueryString(options.data);
        }
        var xhr;
        if (options.xhr) {
            xhr = options.xhr;
        } else {
            xhr = getXhr();
            if (!xhr) {
                options.error("Ajax not allowed");
                return xhr;
            }
        }
        if (crossdomain && window.XDomainRequest && !("withCredentials" in xhr)) {
            return new XDomainAjax(url, options);
        }
        if (options.progress && xhr.upload) {
            xhr.upload.addEventListener("progress", function(e) {
                if (e.lengthComputable) {
                    options.progress(Math.round(e.loaded * 95 / e.total));
                }
            }, false);
        }
        var onStateChange = function() {
            if (xhr.readyState == 4 && !finished) {
                if (options.progress) {
                    options.progress(100);
                }
                if (xhr.status >= 200 && xhr.status < 300) {
                    var resp = xhr.responseText;
                    if (options.json) {
                        try {
                            resp = fp.json.decode(resp);
                        } catch (e) {
                            onerror.call(xhr, "Invalid json: " + resp);
                            return;
                        }
                    }
                    success(resp, xhr.status, xhr);
                    finished = true;
                } else {
                    onerror.call(xhr, xhr.responseText);
                    finished = true;
                }
            }
        };
        xhr.onreadystatechange = onStateChange;
        var onerror = function(err) {
            if (finished) {
                return;
            }
            if (options.progress) {
                options.progress(100);
            }
            finished = true;
            if (this.status == 400) {
                error("bad_params", this.status, this);
                return;
            } else if (this.status == 403) {
                error("not_authorized", this.status, this);
                return;
            } else if (this.status == 404) {
                error("not_found", this.status, this);
                return;
            }
            if (crossdomain) {
                if (this.readyState == 4 && this.status === 0) {
                    error("CORS_not_allowed", this.status, this);
                    return;
                } else {
                    error("CORS_error", this.status, this);
                    return;
                }
            }
            error(err, this.status, this);
        };
        xhr.onerror = onerror;
        if (data && method == "GET") {
            url += (url.indexOf("?") !== -1 ? "&" : "?") + data;
            data = null;
        }
        xhr.open(method, url, async);
        if (options.json) {
            xhr.setRequestHeader("Accept", "application/json, text/javascript");
        } else {
            xhr.setRequestHeader("Accept", "text/javascript, text/html, application/xml, text/xml, */*");
        }
        var contentType = headers["Content-Type"] || headers["content-type"];
        if (data && processData && (method == "POST" || method == "PUT") && contentType === undefined) {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        }
        if (headers) {
            for (var key in headers) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }
        xhr.send(data);
        return xhr;
    };
    var XDomainAjax = function(url, options) {
        if (!window.XDomainRequest) {
            return null;
        }
        var method = options.method ? options.method.toUpperCase() : "POST";
        var success = options.success || function() {};
        var error = options.error || function() {};
        var data = options.data || {};
        if (window.location.protocol == "http:") {
            url = url.replace("https:", "http:");
        } else if (window.location.protocol == "https:") {
            url = url.replace("http:", "https:");
        }
        if (options.async) {
            throw new fp.FilepickerException("Asyncronous Cross-domain requests are not supported");
        }
        if (method !== "GET" && method !== "POST") {
            data._method = method;
            method = "POST";
        }
        if (options.processData !== false) {
            data = data ? toQueryString(data) : null;
        }
        if (data && method == "GET") {
            url += (url.indexOf("?") >= 0 ? "&" : "?") + data;
            data = null;
        }
        url += (url.indexOf("?") >= 0 ? "&" : "?") + "_xdr=true&_cacheBust=" + fp.util.getId();
        var xdr = new window.XDomainRequest();
        xdr.onload = function() {
            var resp = xdr.responseText;
            if (options.progress) {
                options.progress(100);
            }
            if (options.json) {
                try {
                    resp = fp.json.decode(resp);
                } catch (e) {
                    error("Invalid json: " + resp, 200, xdr);
                    return;
                }
            }
            success(resp, 200, xdr);
        };
        xdr.onerror = function() {
            if (options.progress) {
                options.progress(100);
            }
            error(xdr.responseText || "CORS_error", this.status || 500, this);
        };
        xdr.onprogress = function() {};
        xdr.ontimeout = function() {};
        xdr.timeout = 3e4;
        xdr.open(method, url, true);
        xdr.send(data);
        return xdr;
    };
    return {
        get: get_request,
        post: post_request,
        request: make_request
    };
});

"use strict";

filepicker.extend("files", function() {
    var fp = this;
    var readFromFPUrl = function(url, options, onSuccess, onError, onProgress) {
        var temp64 = options.base64encode === undefined;
        if (temp64) {
            options.base64encode = true;
        }
        options.base64encode = options.base64encode !== false;
        var success = function(responseText) {
            if (temp64) {
                responseText = fp.base64.decode(responseText, !!options.asText);
            }
            onSuccess(responseText);
        };
        readFromUrl.call(this, url, options, success, onError, onProgress);
    };
    var readFromUrl = function(url, options, onSuccess, onError, onProgress) {
        if (options.cache !== true) {
            options._cacheBust = fp.util.getId();
        }
        fp.ajax.get(url, {
            data: options,
            headers: {
                "X-NO-STREAM": true
            },
            success: onSuccess,
            error: function(msg, status, xhr) {
                if (msg === "CORS_not_allowed") {
                    onError(new fp.errors.FPError(113));
                } else if (msg === "CORS_error") {
                    onError(new fp.errors.FPError(114));
                } else if (msg === "not_found") {
                    onError(new fp.errors.FPError(115));
                } else if (msg === "bad_params") {
                    onError(new fp.errors.FPError(400));
                } else if (msg === "not_authorized") {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(118));
                }
            },
            progress: onProgress
        });
    };
    var readFromFile = function(file, options, onSuccess, onError, onProgress) {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            onProgress(10);
            fp.files.storeFile(file, {}, function(fpfile) {
                onProgress(50);
                fp.files.readFromFPUrl(fpfile.url, options, onSuccess, onError, function(progress) {
                    onProgress(50 + progress / 2);
                });
            }, onError, function(progress) {
                onProgress(progress / 2);
            });
            return;
        }
        var base64encode = !!options.base64encode;
        var asText = !!options.asText;
        var reader = new FileReader();
        reader.onprogress = function(evt) {
            if (evt.lengthComputable) {
                onProgress(Math.round(evt.loaded / evt.total * 100));
            }
        };
        reader.onload = function(evt) {
            onProgress(100);
            if (base64encode) {
                onSuccess(fp.base64.encode(evt.target.result, asText));
            } else {
                onSuccess(evt.target.result);
            }
        };
        reader.onerror = function(evt) {
            switch (evt.target.error.code) {
              case evt.target.error.NOT_FOUND_ERR:
                onError(new fp.errors.FPError(115));
                break;

              case evt.target.error.NOT_READABLE_ERR:
                onError(new fp.errors.FPError(116));
                break;

              case evt.target.error.ABORT_ERR:
                onError(new fp.errors.FPError(117));
                break;

              default:
                onError(new fp.errors.FPError(118));
                break;
            }
        };
        if (asText || !reader.readAsBinaryString) {
            reader.readAsText(file);
        } else {
            reader.readAsBinaryString(file);
        }
    };
    var writeDataToFPUrl = function(fp_url, input, options, onSuccess, onError, onProgress) {
        var mimetype = options.mimetype || "text/plain";
        fp.ajax.post(fp.urls.constructWriteUrl(fp_url, options), {
            headers: {
                "Content-Type": mimetype
            },
            data: input,
            processData: false,
            json: true,
            success: function(json) {
                onSuccess(fp.util.standardizeFPFile(json));
            },
            error: function(msg, status, xhr) {
                if (msg === "not_found") {
                    onError(new fp.errors.FPError(121));
                } else if (msg === "bad_params") {
                    onError(new fp.errors.FPError(122));
                } else if (msg === "not_authorized") {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(123));
                }
            },
            progress: onProgress
        });
    };
    var writeFileInputToFPUrl = function(fp_url, input, options, onSuccess, onError, onProgress) {
        var error = function(msg, status, xhr) {
            if (msg === "not_found") {
                onError(new fp.errors.FPError(121));
            } else if (msg === "bad_params") {
                onError(new fp.errors.FPError(122));
            } else if (msg === "not_authorized") {
                onError(new fp.errors.FPError(403));
            } else {
                onError(new fp.errors.FPError(123));
            }
        };
        var success = function(json) {
            onSuccess(fp.util.standardizeFPFile(json));
        };
        uploadFile(input, fp.urls.constructWriteUrl(fp_url, options), success, error, onProgress);
    };
    var writeFileToFPUrl = function(fp_url, input, options, onSuccess, onError, onProgress) {
        var error = function(msg, status, xhr) {
            if (msg === "not_found") {
                onError(new fp.errors.FPError(121));
            } else if (msg === "bad_params") {
                onError(new fp.errors.FPError(122));
            } else if (msg === "not_authorized") {
                onError(new fp.errors.FPError(403));
            } else {
                onError(new fp.errors.FPError(123));
            }
        };
        var success = function(json) {
            onSuccess(fp.util.standardizeFPFile(json));
        };
        options.mimetype = input.type;
        uploadFile(input, fp.urls.constructWriteUrl(fp_url, options), success, error, onProgress);
    };
    var writeUrlToFPUrl = function(fp_url, input, options, onSuccess, onError, onProgress) {
        fp.ajax.post(fp.urls.constructWriteUrl(fp_url, options), {
            data: {
                url: input
            },
            json: true,
            success: function(json) {
                onSuccess(fp.util.standardizeFPFile(json));
            },
            error: function(msg, status, xhr) {
                if (msg === "not_found") {
                    onError(new fp.errors.FPError(121));
                } else if (msg === "bad_params") {
                    onError(new fp.errors.FPError(122));
                } else if (msg === "not_authorized") {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(123));
                }
            },
            progress: onProgress
        });
    };
    var storeFileInput = function(input, options, onSuccess, onError, onProgress) {
        if (input.files) {
            if (input.files.length === 0) {
                onError(new fp.errors.FPError(115));
            } else {
                storeFile(input.files[0], options, onSuccess, onError, onProgress);
            }
            return;
        }
        fp.util.setDefault(options, "location", "S3");
        if (!options.filename) {
            options.filename = input.value.replace("C:\\fakepath\\", "") || input.name;
        }
        var old_name = input.name;
        input.name = "fileUpload";
        fp.iframeAjax.post(fp.urls.constructStoreUrl(options), {
            data: input,
            processData: false,
            json: true,
            success: function(json) {
                input.name = old_name;
                onSuccess(fp.util.standardizeFPFile(json));
            },
            error: function(msg, status, xhr) {
                if (msg === "not_found") {
                    onError(new fp.errors.FPError(121));
                } else if (msg === "bad_params") {
                    onError(new fp.errors.FPError(122));
                } else if (msg === "not_authorized") {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(123));
                }
            }
        });
    };
    var storeFile = function(input, options, onSuccess, onError, onProgress) {
        fp.util.setDefault(options, "location", "S3");
        var error = function(msg, status, xhr) {
            if (msg === "not_found") {
                onError(new fp.errors.FPError(121));
            } else if (msg === "bad_params") {
                onError(new fp.errors.FPError(122));
            } else if (msg === "not_authorized") {
                onError(new fp.errors.FPError(403));
            } else {
                fp.util.console.error(msg);
                onError(new fp.errors.FPError(123));
            }
        };
        var success = function(json) {
            onSuccess(fp.util.standardizeFPFile(json));
        };
        if (!options.filename) {
            options.filename = input.name || input.fileName;
        }
        uploadFile(input, fp.urls.constructStoreUrl(options), success, error, onProgress);
    };
    var uploadFile = function(file, url, success, error, progress) {
        if (file.files) {
            file = file.files[0];
        }
        var html5Upload = !!window.FormData && !!window.XMLHttpRequest;
        if (html5Upload) {
            var data = new window.FormData();
            data.append("fileUpload", file);
            fp.ajax.post(url, {
                json: true,
                processData: false,
                data: data,
                success: success,
                error: error,
                progress: progress
            });
        } else {
            fp.iframeAjax.post(url, {
                data: file,
                json: true,
                success: success,
                error: error
            });
        }
    };
    var storeData = function(input, options, onSuccess, onError, onProgress) {
        fp.util.setDefault(options, "location", "S3");
        fp.util.setDefault(options, "mimetype", "text/plain");
        fp.ajax.post(fp.urls.constructStoreUrl(options), {
            headers: {
                "Content-Type": options.mimetype
            },
            data: input,
            processData: false,
            json: true,
            success: function(json) {
                onSuccess(fp.util.standardizeFPFile(json));
            },
            error: function(msg, status, xhr) {
                if (msg === "not_found") {
                    onError(new fp.errors.FPError(121));
                } else if (msg === "bad_params") {
                    onError(new fp.errors.FPError(122));
                } else if (msg === "not_authorized") {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(123));
                }
            },
            progress: onProgress
        });
    };
    var storeUrl = function(input, options, onSuccess, onError, onProgress) {
        fp.util.setDefault(options, "location", "S3");
        fp.ajax.post(fp.urls.constructStoreUrl(options), {
            data: {
                url: input
            },
            json: true,
            success: function(json) {
                onSuccess(fp.util.standardizeFPFile(json));
            },
            error: function(msg, status, xhr) {
                if (msg === "not_found") {
                    onError(new fp.errors.FPError(151));
                } else if (msg === "bad_params") {
                    onError(new fp.errors.FPError(152));
                } else if (msg === "not_authorized") {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(153));
                }
            },
            progress: onProgress
        });
    };
    var stat = function(fp_url, options, onSuccess, onError) {
        var dateparams = [ "uploaded", "modified", "created" ];
        if (options.cache !== true) {
            options._cacheBust = fp.util.getId();
        }
        fp.ajax.get(fp_url + "/metadata", {
            json: true,
            data: options,
            success: function(metadata) {
                for (var i = 0; i < dateparams.length; i++) {
                    if (metadata[dateparams[i]]) {
                        metadata[dateparams[i]] = new Date(metadata[dateparams[i]]);
                    }
                }
                onSuccess(metadata);
            },
            error: function(msg, status, xhr) {
                if (msg === "not_found") {
                    onError(new fp.errors.FPError(161));
                } else if (msg === "bad_params") {
                    onError(new fp.errors.FPError(400));
                } else if (msg === "not_authorized") {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(162));
                }
            }
        });
    };
    var remove = function(fp_url, options, onSuccess, onError) {
        options.key = fp.apikey;
        fp.ajax.post(fp_url + "/remove", {
            data: options,
            success: function(resp) {
                onSuccess();
            },
            error: function(msg, status, xhr) {
                if (msg === "not_found") {
                    onError(new fp.errors.FPError(171));
                } else if (msg === "bad_params") {
                    onError(new fp.errors.FPError(400));
                } else if (msg === "not_authorized") {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(172));
                }
            }
        });
    };
    return {
        readFromUrl: readFromUrl,
        readFromFile: readFromFile,
        readFromFPUrl: readFromFPUrl,
        writeDataToFPUrl: writeDataToFPUrl,
        writeFileToFPUrl: writeFileToFPUrl,
        writeFileInputToFPUrl: writeFileInputToFPUrl,
        writeUrlToFPUrl: writeUrlToFPUrl,
        storeFileInput: storeFileInput,
        storeFile: storeFile,
        storeUrl: storeUrl,
        storeData: storeData,
        stat: stat,
        remove: remove
    };
});

"use strict";

filepicker.extend("iframeAjax", function() {
    var fp = this;
    var IFRAME_ID = "ajax_iframe";
    var queue = [];
    var running = false;
    var get_request = function(url, options) {
        options.method = "GET";
        make_request(url, options);
    };
    var post_request = function(url, options) {
        options.method = "POST";
        url += (url.indexOf("?") >= 0 ? "&" : "?") + "_cacheBust=" + fp.util.getId();
        make_request(url, options);
    };
    var runQueue = function() {
        if (queue.length > 0) {
            var next = queue.shift();
            make_request(next.url, next.options);
        }
    };
    var make_request = function(url, options) {
        if (running) {
            queue.push({
                url: url,
                options: options
            });
            return;
        }
        url += (url.indexOf("?") >= 0 ? "&" : "?") + "plugin=" + fp.urls.getPlugin() + "&_cacheBust=" + fp.util.getId();
        url += "&Content-Type=text%2Fhtml";
        fp.comm.openChannel();
        var uploadIFrame;
        try {
            uploadIFrame = document.createElement('<iframe name="' + IFRAME_ID + '">');
        } catch (ex) {
            uploadIFrame = document.createElement("iframe");
        }
        uploadIFrame.id = uploadIFrame.name = IFRAME_ID;
        uploadIFrame.style.display = "none";
        var release = function() {
            running = false;
        };
        if (uploadIFrame.attachEvent) {
            uploadIFrame.attachEvent("onload", release);
            uploadIFrame.attachEvent("onerror", release);
        } else {
            uploadIFrame.onerror = uploadIFrame.onload = release;
        }
        uploadIFrame.id = IFRAME_ID;
        uploadIFrame.name = IFRAME_ID;
        uploadIFrame.style.display = "none";
        uploadIFrame.onerror = uploadIFrame.onload = function() {
            running = false;
        };
        document.body.appendChild(uploadIFrame);
        fp.handlers.attach("upload", getReceiveUploadMessage(options));
        var form = document.createElement("form");
        form.method = options.method || "GET";
        form.action = url;
        form.target = IFRAME_ID;
        var data = options.data;
        if (fp.util.isFileInputElement(data) || fp.util.isFile(data)) {
            form.encoding = form.enctype = "multipart/form-data";
        }
        document.body.appendChild(form);
        var input;
        if (fp.util.isFile(data)) {
            var file_input = getInputForFile(data);
            if (!file_input) {
                throw fp.FilepickerException("Couldn't find corresponding file input.");
            }
            data = {
                fileUpload: file_input
            };
        } else if (fp.util.isFileInputElement(data)) {
            input = data;
            data = {};
            data.fileUpload = input;
        } else if (data && fp.util.isElement(data) && data.tagName === "INPUT") {
            input = data;
            data = {};
            data[input.name] = input;
        } else if (options.processData !== false) {
            data = {
                data: data
            };
        }
        data.format = "iframe";
        var input_cache = {};
        for (var key in data) {
            var val = data[key];
            if (fp.util.isElement(val) && val.tagName === "INPUT") {
                input_cache[key] = {
                    par: val.parentNode,
                    sib: val.nextSibling,
                    name: val.name,
                    input: val,
                    focused: val === document.activeElement
                };
                val.name = key;
                form.appendChild(val);
            } else {
                var input_val = document.createElement("input");
                input_val.name = key;
                input_val.value = val;
                form.appendChild(input_val);
            }
        }
        running = true;
        window.setTimeout(function() {
            form.submit();
            for (var cache_key in input_cache) {
                var cache_val = input_cache[cache_key];
                cache_val.par.insertBefore(cache_val.input, cache_val.sib);
                cache_val.input.name = cache_val.name;
                if (cache_val.focused) {
                    cache_val.input.focus();
                }
            }
            form.parentNode.removeChild(form);
        }, 1);
    };
    var getReceiveUploadMessage = function(options) {
        var success = options.success || function() {};
        var error = options.error || function() {};
        var handler = function(data) {
            if (data.type !== "Upload") {
                return;
            }
            running = false;
            var response = data.payload;
            if (response.error) {
                error(response.error);
            } else {
                success(response);
            }
            fp.handlers.detach("upload");
            runQueue();
        };
        return handler;
    };
    var getInputForFile = function(file) {
        var inputs = document.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[0];
            if (input.type !== "file" || !input.files || !input.files.length) {
                continue;
            }
            for (var j = 0; j < input.files.length; j++) {
                if (input.files[j] === file) {
                    return input;
                }
            }
        }
        return null;
    };
    return {
        get: get_request,
        post: post_request,
        request: make_request
    };
});

"use strict";

filepicker.extend("base64", function() {
    var fp = this;
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var encode = function(input, utf8encode) {
        utf8encode = utf8encode || utf8encode === undefined;
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        if (utf8encode) {
            input = _utf8_encode(input);
        }
        while (i < input.length) {
            chr1 = input.charCodeAt(i);
            chr2 = input.charCodeAt(i + 1);
            chr3 = input.charCodeAt(i + 2);
            i += 3;
            enc1 = chr1 >> 2;
            enc2 = (chr1 & 3) << 4 | chr2 >> 4;
            enc3 = (chr2 & 15) << 2 | chr3 >> 6;
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    };
    var decode = function(input, utf8decode) {
        utf8decode = utf8decode || utf8decode === undefined;
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i));
            enc2 = _keyStr.indexOf(input.charAt(i + 1));
            enc3 = _keyStr.indexOf(input.charAt(i + 2));
            enc4 = _keyStr.indexOf(input.charAt(i + 3));
            i += 4;
            chr1 = enc1 << 2 | enc2 >> 4;
            chr2 = (enc2 & 15) << 4 | enc3 >> 2;
            chr3 = (enc3 & 3) << 6 | enc4;
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
    var _utf8_encode = function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if (c > 127 && c < 2048) {
                utftext += String.fromCharCode(c >> 6 | 192);
                utftext += String.fromCharCode(c & 63 | 128);
            } else {
                utftext += String.fromCharCode(c >> 12 | 224);
                utftext += String.fromCharCode(c >> 6 & 63 | 128);
                utftext += String.fromCharCode(c & 63 | 128);
            }
        }
        return utftext;
    };
    var _utf8_decode = function(utftext) {
        var string = "";
        var i = 0;
        var c = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if (c > 191 && c < 224) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode((c & 31) << 6 | c2 & 63);
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
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

"use strict";

filepicker.extend("browser", function() {
    var fp = this;
    var isIOS = function() {
        return !!(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i));
    };
    var isAndroid = function() {
        return !!navigator.userAgent.match(/Android/i);
    };
    var isIE7 = function() {
        return !!navigator.userAgent.match(/MSIE 7\.0/i);
    };
    var isSafari = function() {
        return navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0;
    };
    var isMobileSafari = function() {
        return !!(navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/) && !navigator.userAgent.match(/CriOS/));
    };
    var getLanguage = function() {
        var language = window.navigator.userLanguage || window.navigator.language;
        if (language === undefined) {
            language = "en";
        }
        language = language.replace("-", "_").toLowerCase();
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

"use strict";

filepicker.extend("json", function() {
    var fp = this;
    var special = {
        "\b": "\\b",
        "	": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        '"': '\\"',
        "\\": "\\\\"
    };
    var escape = function(chr) {
        return special[chr] || "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4);
    };
    var validate = function(string) {
        string = string.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, "");
        return /^[\],:{}\s]*$/.test(string);
    };
    var encode = function(obj) {
        if (window.JSON && window.JSON.stringify) {
            return window.JSON.stringify(obj);
        }
        if (obj && obj.toJSON) {
            obj = obj.toJSON();
        }
        var string = [];
        switch (fp.util.typeOf(obj)) {
          case "string":
            return '"' + obj.replace(/[\x00-\x1f\\"]/g, escape) + '"';

          case "array":
            for (var i = 0; i < obj.length; i++) {
                string.push(encode(obj[i]));
            }
            return "[" + string + "]";

          case "object":
          case "hash":
            var json;
            var key;
            for (key in obj) {
                json = encode(obj[key]);
                if (json) {
                    string.push(encode(key) + ":" + json);
                }
                json = null;
            }
            return "{" + string + "}";

          case "number":
          case "boolean":
            return "" + obj;

          case "null":
            return "null";

          default:
            return "null";
        }
        return null;
    };
    var decode = function(string, secure) {
        if (!string || fp.util.typeOf(string) !== "string") {
            return null;
        }
        if (window.JSON && window.JSON.parse) {
            return window.JSON.parse(string);
        } else {
            if (secure) {
                if (!validate(string)) {
                    throw new Error("JSON could not decode the input; security is enabled and the value is not secure.");
                }
            }
            return eval("(" + string + ")");
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

"use strict";

filepicker.extend("util", function() {
    var fp = this;
    var trim = function(string) {
        return string.replace(/^\s+|\s+$/g, "");
    };
    var trimConvert = function(url) {
        return url.replace(/\/convert\b.*/, "");
    };
    var URL_REGEX = /^(http|https)\:.*\/\//i;
    var isUrl = function(string) {
        return !!string.match(URL_REGEX);
    };
    var parseUrl = function(url) {
        if (!url || url.charAt(0) === "/") {
            url = window.location.protocol + "//" + window.location.host + url;
        }
        var a = document.createElement("a");
        a.href = url;
        var host = a.hostname.indexOf(":") === -1 ? a.hostname : a.host;
        var ret = {
            source: url,
            protocol: a.protocol.replace(":", ""),
            host: host,
            port: a.port,
            query: a.search,
            params: function() {
                var ret = {}, seg = a.search.replace(/^\?/, "").split("&"), len = seg.length, i = 0, s;
                for (;i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split("=");
                    ret[s[0]] = s[1];
                }
                return ret;
            }(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [ undefined, "" ])[1],
            hash: a.hash.replace("#", ""),
            path: a.pathname.replace(/^([^\/])/, "/$1"),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [ undefined, "" ])[1],
            segments: a.pathname.replace(/^\//, "").split("/")
        };
        ret.origin = ret.protocol + "://" + ret.host + (ret.port ? ":" + ret.port : "");
        return ret;
    };
    var endsWith = function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };
    return {
        trim: trim,
        trimConvert: trimConvert,
        parseUrl: parseUrl,
        isUrl: isUrl,
        endsWith: endsWith
    };
});

"use strict";

filepicker.extend("util", function() {
    var fp = this;
    var isArray = function(o) {
        return o && Object.prototype.toString.call(o) === "[object Array]";
    };
    var isFile = function(o) {
        return o && Object.prototype.toString.call(o) === "[object File]";
    };
    var isElement = function(o) {
        if (typeof window.HTMLElement === "object") {
            return o instanceof window.HTMLElement;
        } else {
            return o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string";
        }
    };
    var isFileInputElement = function(o) {
        return isElement(o) && o.tagName === "INPUT" && o.type === "file";
    };
    var typeOf = function(value) {
        if (value === null) {
            return "null";
        } else if (isArray(value)) {
            return "array";
        } else if (isFile(value)) {
            return "file";
        }
        return typeof value;
    };
    var getId = function() {
        var d = new Date();
        return d.getTime().toString();
    };
    var setDefault = function(obj, key, def) {
        if (obj[key] === undefined) {
            obj[key] = def;
        }
    };
    var addOnLoad = function(func) {
        if (window.jQuery) {
            window.jQuery(function() {
                func();
            });
        } else {
            var evnt = "load";
            if (window.addEventListener) {
                window.addEventListener(evnt, func, false);
            } else if (window.attachEvent) {
                window.attachEvent("on" + evnt, func);
            } else {
                if (window.onload) {
                    var curr = window.onload;
                    window.onload = function() {
                        curr();
                        func();
                    };
                } else {
                    window.onload = func;
                }
            }
        }
    };
    var isFPUrl = function(url) {
        return typeof url === "string" && url.match("www.filepicker.io/api/file/");
    };
    var isFPUrlCdn = function(url) {
        return typeof url === "string" && url.match("/api/file/");
    };
    var consoleWrap = function(fn) {
        return function() {
            if (window.console && typeof window.console[fn] === "function") {
                try {
                    window.console[fn].apply(window.console, arguments);
                } catch (e) {
                    window.alert(Array.prototype.join.call(arguments, ","));
                }
            }
        };
    };
    var console = {};
    console.log = consoleWrap("log");
    console.error = consoleWrap("error");
    var clone = function(o) {
        var ret = {};
        for (var key in o) {
            ret[key] = o[key];
        }
        return ret;
    };
    var standardizeFPFile = function(json) {
        var fpfile = {};
        fpfile.url = json.url;
        fpfile.filename = json.filename || json.name;
        fpfile.mimetype = json.mimetype || json.type;
        fpfile.size = json.size;
        fpfile.key = json.key || json.s3_key;
        fpfile.isWriteable = !!(json.isWriteable || json.writeable);
        return fpfile;
    };
    var isCanvasSupported = function() {
        try {
            var elem = document.createElement("canvas");
            return !!(elem.getContext && elem.getContext("2d"));
        } catch (err) {
            return false;
        }
    };
    return {
        isArray: isArray,
        isFile: isFile,
        isElement: isElement,
        isFileInputElement: isFileInputElement,
        getId: getId,
        setDefault: setDefault,
        typeOf: typeOf,
        addOnLoad: addOnLoad,
        isFPUrl: isFPUrl,
        isFPUrlCdn: isFPUrlCdn,
        console: console,
        clone: clone,
        standardizeFPFile: standardizeFPFile,
        isCanvasSupported: isCanvasSupported
    };
});

"use strict";

filepicker.extend("dragdrop", function() {
    var fp = this;
    var canDragDrop = function() {
        return (!!window.FileReader || navigator.userAgent.indexOf("Safari") >= 0) && "draggable" in document.createElement("span");
    };
    var makeDropPane = function(div, options) {
        var err = "No DOM element found to create drop pane";
        if (!div) {
            throw new fp.FilepickerException(err);
        }
        if (div.jquery) {
            if (div.length === 0) {
                throw new fp.FilepickerException(err);
            }
            div = div[0];
        }
        if (!canDragDrop()) {
            fp.util.console.error("Your browser doesn't support drag-drop functionality");
            return false;
        }
        options = options || {};
        var dragEnter = options.dragEnter || function() {};
        var dragLeave = options.dragLeave || function() {};
        var onStart = options.onStart || function() {};
        var onSuccess = options.onSuccess || function() {};
        var onError = options.onError || function() {};
        var onProgress = options.onProgress || function() {};
        var mimetypes = options.mimetypes;
        if (!mimetypes) {
            if (options.mimetype) {
                mimetypes = [ options.mimetype ];
            } else {
                mimetypes = [ "*/*" ];
            }
        }
        if (fp.util.typeOf(mimetypes) === "string") {
            mimetypes = mimetypes.split(",");
        }
        var extensions = options.extensions;
        if (!extensions) {
            if (options.extension) {
                extensions = [ options.extension ];
            }
        }
        if (fp.util.typeOf(extensions) === "string") {
            extensions = extensions.replace(/ /g, "").split(",");
        }
        var store_options = {
            location: options.location,
            path: options.path,
            container: options.container,
            access: options.access,
            policy: options.policy,
            signature: options.signature
        };
        var enabled = function() {
            return div && (div.getAttribute("disabled") || "enabled") !== "disabled";
        };
        div.addEventListener("dragenter", function(e) {
            if (enabled()) {
                dragEnter();
            }
            e.stopPropagation();
            e.preventDefault();
            return false;
        }, false);
        div.addEventListener("dragleave", function(e) {
            if (enabled()) {
                dragLeave();
            }
            e.stopPropagation();
            e.preventDefault();
            return false;
        }, false);
        div.addEventListener("dragover", function(e) {
            e.dataTransfer.dropEffect = "copy";
            e.preventDefault();
            return false;
        }, false);
        div.addEventListener("drop", function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (!enabled()) {
                return false;
            }
            var i;
            var items;
            var entry;
            if (e.dataTransfer.items) {
                items = e.dataTransfer.items;
                for (i = 0; i < items.length; i++) {
                    entry = items[i] && items[i].webkitGetAsEntry ? items[i].webkitGetAsEntry() : undefined;
                    if (entry && !!entry.isDirectory) {
                        onError("WrongType", "Uploading a folder is not allowed");
                        return false;
                    }
                }
            }
            var files = e.dataTransfer.files;
            var total = files.length;
            if (verifyUpload(files)) {
                onStart(files);
                div.setAttribute("disabled", "disabled");
                for (i = 0; i < files.length; i++) {
                    fp.store(files[i], store_options, getSuccessHandler(i, total), errorHandler, getProgressHandler(i, total));
                }
            }
            return false;
        });
        var reenablePane = function() {
            div.setAttribute("disabled", "enabled");
            if (window.$) {
                window.$(div).prop("disabled", false);
            }
        };
        var progresses = {};
        var response = [];
        var getSuccessHandler = function(i, total) {
            return function(fpfile) {
                if (!options.multiple) {
                    onSuccess([ fpfile ]);
                } else {
                    response.push(fpfile);
                    if (response.length === total) {
                        onSuccess(response);
                        response = [];
                        progresses = {};
                    } else {
                        progresses[i] = 100;
                        updateProgress(total);
                    }
                }
                reenablePane();
            };
        };
        var errorHandler = function(err) {
            onError("UploadError", err.toString());
            reenablePane();
        };
        var getProgressHandler = function(i, total) {
            return function(percent) {
                progresses[i] = percent;
                updateProgress(total);
            };
        };
        var updateProgress = function(totalCount) {
            var totalProgress = 0;
            for (var i in progresses) {
                totalProgress += progresses[i];
            }
            var percentage = totalProgress / totalCount;
            onProgress(percentage);
        };
        var verifyUpload = function(files) {
            if (files.length > 0) {
                if (files.length > 1 && !options.multiple) {
                    onError("TooManyFiles", "Only one file at a time");
                    return false;
                }
                if (options.maxFiles > 0 && files.length > options.maxFiles) {
                    onError("TooManyFiles", "Only " + options.maxFiles + " files at a time");
                    return false;
                }
                var found;
                var file;
                var filename;
                for (var i = 0; i < files.length; i++) {
                    found = false;
                    file = files[i];
                    filename = file.name || file.fileName || "Unknown file";
                    for (var j = 0; j < mimetypes.length; j++) {
                        var mimetype = fp.mimetypes.getMimetype(file);
                        found = found || fp.mimetypes.matchesMimetype(mimetype, mimetypes[j]);
                    }
                    if (!found) {
                        onError("WrongType", filename + " isn't the right type of file");
                        return false;
                    }
                    if (extensions) {
                        found = false;
                        for (j = 0; j < extensions.length; j++) {
                            found = found || fp.util.endsWith(filename, extensions[j]);
                        }
                        if (!found) {
                            onError("WrongType", filename + " isn't the right type of file");
                            return false;
                        }
                    }
                    if (file.size && !!options.maxSize && file.size > options.maxSize) {
                        onError("WrongSize", filename + " is too large (" + file.size + " Bytes)");
                        return false;
                    }
                }
                return true;
            } else {
                onError("NoFilesFound", "No files uploaded");
            }
            return false;
        };
        return true;
    };
    return {
        enabled: canDragDrop,
        makeDropPane: makeDropPane
    };
});

"use strict";

filepicker.extend("widgets", function() {
    var fp = this;
    var setAttrIfExists = function(key, options, attrname, dom) {
        var val = dom.getAttribute(attrname);
        if (val) {
            options[key] = val;
        }
    };
    var fireOnChangeEvent = function(input, fpfiles) {
        var e;
        if (document.createEvent) {
            e = document.createEvent("Event");
            e.initEvent("change", true, false);
            e.fpfile = fpfiles ? fpfiles[0] : undefined;
            e.fpfiles = fpfiles;
            input.dispatchEvent(e);
        } else if (document.createEventObject) {
            e = document.createEventObject("Event");
            e.eventPhase = 2;
            e.currentTarget = e.srcElement = e.target = input;
            e.fpfile = fpfiles ? fpfiles[0] : undefined;
            e.fpfiles = fpfiles;
            input.fireEvent("onchange", e);
        } else if (input.onchange) {
            input.onchange(fpfiles);
        }
    };
    var splitIfExist = function(key, options) {
        if (options[key]) {
            options[key] = options[key].split(",");
        }
    };
    var setAttrIfExistsArray = function(fpoptions, domElement, optionsObj) {
        for (var option in optionsObj) {
            setAttrIfExists(optionsObj[option], fpoptions, option, domElement);
        }
    };
    var constructOptions = function(domElement, mode) {
        mode = mode || "pick";
        var fpoptions = {}, generalOptionsMap = {
            "data-fp-container": "container",
            "data-fp-mimetype": "mimetype",
            "data-fp-extension": "extension",
            "data-fp-openTo": "openTo",
            "data-fp-debug": "debug",
            "data-fp-signature": "signature",
            "data-fp-policy": "policy",
            "data-fp-language": "language",
            "data-fp-background-upload": "backgroundUpload",
            "data-fp-hide": "hide",
            "data-fp-custom-css": "customCss",
            "data-fp-crop-force": "cropForce",
            "data-fp-crop-ratio": "cropRatio",
            "data-fp-crop-dim": "cropDim",
            "data-fp-crop-max": "cropMax",
            "data-fp-crop-min": "cropMin",
            "data-fp-show-close": "showClose",
            "data-fp-conversions": "conversions"
        }, pickOnlyOptionsMap = {
            "data-fp-mimetypes": "mimetypes",
            "data-fp-extensions": "extensions",
            "data-fp-maxSize": "maxSize",
            "data-fp-maxFiles": "maxFiles",
            "data-fp-store-location": "storeLocation",
            "data-fp-store-path": "storePath",
            "data-fp-store-container": "storeContainer",
            "data-fp-store-access": "storeAccess",
            "data-fp-image-quality": "imageQuality",
            "data-fp-image-dim": "imageDim",
            "data-fp-image-max": "imageMax",
            "data-fp-image-min": "imageMin",
            "data-fp-webcam-dim": "webcamDim"
        };
        setAttrIfExistsArray(fpoptions, domElement, generalOptionsMap);
        if (mode === "export") {
            setAttrIfExists("suggestedFilename", fpoptions, "data-fp-suggestedFilename", domElement);
        } else if (mode === "pick") {
            setAttrIfExistsArray(fpoptions, domElement, pickOnlyOptionsMap);
        }
        var services = domElement.getAttribute("data-fp-services");
        if (services) {
            services = services.split(",");
            for (var j = 0; j < services.length; j++) {
                services[j] = fp.services[services[j].replace(" ", "")] || services[j];
            }
            fpoptions.services = services;
        }
        var service = domElement.getAttribute("data-fp-service");
        if (service) {
            fpoptions.service = fp.services[service.replace(" ", "")] || service;
        }
        var arrayToSplit = [ "extensions", "mimetypes", "imageDim", "imageMin", "imageMax", "cropDim", "cropMax", "cropMin", "webcamDim", "conversions" ];
        for (var key in arrayToSplit) {
            splitIfExist(arrayToSplit[key], fpoptions);
        }
        var apikey = domElement.getAttribute("data-fp-apikey");
        if (apikey) {
            fp.setKey(apikey);
        }
        fpoptions.folders = domElement.getAttribute("data-fp-folders") === "true";
        return fpoptions;
    };
    var isMultiple = function(domElement) {
        return domElement.getAttribute("data-fp-multiple") === "true";
    };
    var constructPickWidget = function(domElement) {
        var widget = document.createElement("button");
        widget.setAttribute("type", "button");
        widget.innerHTML = domElement.getAttribute("data-fp-button-text") || "Pick File";
        widget.className = domElement.getAttribute("data-fp-button-class") || domElement.className || "fp__btn";
        domElement.style.display = "none";
        var fpoptions = constructOptions(domElement);
        if (isMultiple(domElement)) {
            widget.onclick = function() {
                widget.blur();
                fp.pickMultiple(fpoptions, function(fpfiles) {
                    var urls = [];
                    for (var j = 0; j < fpfiles.length; j++) {
                        urls.push(fpfiles[j].url);
                    }
                    domElement.value = urls.join();
                    fireOnChangeEvent(domElement, fpfiles);
                });
                return false;
            };
        } else {
            widget.onclick = function() {
                widget.blur();
                fp.pick(fpoptions, function(fpfile) {
                    domElement.value = fpfile.url;
                    fireOnChangeEvent(domElement, [ fpfile ]);
                });
                return false;
            };
        }
        domElement.parentNode.insertBefore(widget, domElement.nextSibling);
    };
    var constructConvertWidget = function(domElement) {
        var url = domElement.getAttribute("data-fp-url");
        if (!url) {
            return true;
        }
        var widget = document.createElement("button");
        widget.setAttribute("type", "button");
        widget.innerHTML = domElement.getAttribute("data-fp-button-text") || "Convert File";
        widget.className = domElement.getAttribute("data-fp-button-class") || domElement.className || "fp__btn";
        domElement.style.display = "none";
        var fpoptions = constructOptions(domElement, "convert");
        widget.onclick = function() {
            widget.blur();
            fp.processImage(url, fpoptions, function(fpfile) {
                domElement.value = fpfile.url;
                fireOnChangeEvent(domElement, [ fpfile ]);
            });
            return false;
        };
        domElement.parentNode.insertBefore(widget, domElement.nextSibling);
    };
    var constructDragWidget = function(domElement) {
        var pane = document.createElement("div");
        pane.className = domElement.getAttribute("data-fp-class") || domElement.className;
        pane.style.padding = "1px";
        domElement.style.display = "none";
        domElement.parentNode.insertBefore(pane, domElement.nextSibling);
        var pickButton = document.createElement("button");
        pickButton.setAttribute("type", "button");
        pickButton.innerHTML = domElement.getAttribute("data-fp-button-text") || "Pick File";
        pickButton.className = domElement.getAttribute("data-fp-button-class") || "fp__btn";
        pane.appendChild(pickButton);
        var dragPane = document.createElement("div");
        setupDragContainer(dragPane);
        dragPane.innerHTML = domElement.getAttribute("data-fp-drag-text") || "Or drop files here";
        dragPane.className = domElement.getAttribute("data-fp-drag-class") || "";
        pane.appendChild(dragPane);
        var fpoptions = constructOptions(domElement), multiple = isMultiple(domElement);
        if (fp.dragdrop.enabled()) {
            setupDropPane(dragPane, multiple, fpoptions, domElement);
        } else {
            dragPane.innerHTML = "&nbsp;";
        }
        if (multiple) {
            dragPane.onclick = pickButton.onclick = function() {
                pickButton.blur();
                fp.pickMultiple(fpoptions, function(fpfiles) {
                    var urls = [];
                    var filenames = [];
                    for (var j = 0; j < fpfiles.length; j++) {
                        urls.push(fpfiles[j].url);
                        filenames.push(fpfiles[j].filename);
                    }
                    domElement.value = urls.join();
                    onFilesUploaded(domElement, dragPane, filenames.join(", "));
                    fireOnChangeEvent(domElement, fpfiles);
                });
                return false;
            };
        } else {
            dragPane.onclick = pickButton.onclick = function() {
                pickButton.blur();
                fp.pick(fpoptions, function(fpfile) {
                    domElement.value = fpfile.url;
                    onFilesUploaded(domElement, dragPane, fpfile.filename);
                    fireOnChangeEvent(domElement, [ fpfile ]);
                });
                return false;
            };
        }
    };
    var onFilesUploaded = function(input, odrag, text) {
        odrag.innerHTML = text;
        odrag.style.padding = "2px 4px";
        odrag.style.cursor = "default";
        odrag.style.width = "";
        var cancel = document.createElement("span");
        cancel.innerHTML = "X";
        cancel.style.borderRadius = "8px";
        cancel.style.fontSize = "14px";
        cancel.style.cssFloat = "right";
        cancel.style.padding = "0 3px";
        cancel.style.color = "#600";
        cancel.style.cursor = "pointer";
        var clickFn = function(e) {
            if (!e) {
                e = window.event;
            }
            e.cancelBubble = true;
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            setupDragContainer(odrag);
            if (!fp.dragdrop.enabled) {
                odrag.innerHTML = "&nbsp;";
            } else {
                odrag.innerHTML = input.getAttribute("data-fp-drag-text") || "Or drop files here";
            }
            input.value = "";
            fireOnChangeEvent(input);
            return false;
        };
        if (cancel.addEventListener) {
            cancel.addEventListener("click", clickFn, false);
        } else if (cancel.attachEvent) {
            cancel.attachEvent("onclick", clickFn);
        }
        odrag.appendChild(cancel);
    };
    var setupDragContainer = function(dragPane) {
        dragPane.style.border = "1px dashed #AAA";
        dragPane.style.display = "inline-block";
        dragPane.style.margin = "0 0 0 4px";
        dragPane.style.borderRadius = "3px";
        dragPane.style.backgroundColor = "#F3F3F3";
        dragPane.style.color = "#333";
        dragPane.style.fontSize = "14px";
        dragPane.style.lineHeight = "22px";
        dragPane.style.padding = "2px 4px";
        dragPane.style.verticalAlign = "middle";
        dragPane.style.cursor = "pointer";
        dragPane.style.overflow = "hidden";
    };
    var setupDropPane = function(odrag, multiple, fpoptions, input) {
        var text = odrag.innerHTML;
        var pbar;
        fp.dragdrop.makeDropPane(odrag, {
            multiple: multiple,
            maxSize: fpoptions.maxSize,
            mimetypes: fpoptions.mimetypes,
            mimetype: fpoptions.mimetype,
            extensions: fpoptions.extensions,
            extension: fpoptions.extension,
            location: fpoptions.storeLocation,
            path: fpoptions.storePath,
            container: fpoptions.storeContainer,
            access: fpoptions.storeAccess,
            policy: fpoptions.policy,
            signature: fpoptions.signature,
            dragEnter: function() {
                odrag.innerHTML = "Drop to upload";
                odrag.style.backgroundColor = "#E0E0E0";
                odrag.style.border = "1px solid #000";
            },
            dragLeave: function() {
                odrag.innerHTML = text;
                odrag.style.backgroundColor = "#F3F3F3";
                odrag.style.border = "1px dashed #AAA";
            },
            onError: function(type, msg) {
                if (type === "TooManyFiles") {
                    odrag.innerHTML = msg;
                } else if (type === "WrongType") {
                    odrag.innerHTML = msg;
                } else if (type === "NoFilesFound") {
                    odrag.innerHTML = msg;
                } else if (type === "UploadError") {
                    odrag.innerHTML = "Oops! Had trouble uploading.";
                }
            },
            onStart: function(files) {
                pbar = setupProgress(odrag);
            },
            onProgress: function(percentage) {
                if (pbar) {
                    pbar.style.width = percentage + "%";
                }
            },
            onSuccess: function(fpfiles) {
                var vals = [];
                var filenames = [];
                for (var i = 0; i < fpfiles.length; i++) {
                    vals.push(fpfiles[i].url);
                    filenames.push(fpfiles[i].filename);
                }
                input.value = vals.join();
                onFilesUploaded(input, odrag, filenames.join(", "));
                fireOnChangeEvent(input, fpfiles);
            }
        });
    };
    var setupProgress = function(odrag) {
        var pbar = document.createElement("div");
        var height = odrag.offsetHeight - 2;
        pbar.style.height = height + "px";
        pbar.style.backgroundColor = "#0E90D2";
        pbar.style.width = "2%";
        pbar.style.borderRadius = "3px";
        odrag.style.width = odrag.offsetWidth + "px";
        odrag.style.padding = "0";
        odrag.style.border = "1px solid #AAA";
        odrag.style.backgroundColor = "#F3F3F3";
        odrag.style.boxShadow = "inset 0 1px 2px rgba(0, 0, 0, 0.1)";
        odrag.innerHTML = "";
        odrag.appendChild(pbar);
        return pbar;
    };
    var constructExportWidget = function(domElement) {
        domElement.onclick = function() {
            var url = domElement.getAttribute("data-fp-url");
            if (!url) {
                return true;
            }
            var fpoptions = constructOptions(domElement, "export");
            fp.exportFile(url, fpoptions);
            return false;
        };
    };
    var buildWidgets = function() {
        if (document.querySelectorAll) {
            var i;
            var pick_base = document.querySelectorAll('input[type="filepicker"]');
            for (i = 0; i < pick_base.length; i++) {
                constructPickWidget(pick_base[i]);
            }
            var drag_widgets = document.querySelectorAll('input[type="filepicker-dragdrop"]');
            for (i = 0; i < drag_widgets.length; i++) {
                constructDragWidget(drag_widgets[i]);
            }
            var convert_widgets = document.querySelectorAll('input[type="filepicker-convert"]');
            for (i = 0; i < convert_widgets.length; i++) {
                constructConvertWidget(convert_widgets[i]);
            }
            var export_base = [];
            var tmp = document.querySelectorAll("button[data-fp-url]");
            for (i = 0; i < tmp.length; i++) {
                export_base.push(tmp[i]);
            }
            tmp = document.querySelectorAll("a[data-fp-url]");
            for (i = 0; i < tmp.length; i++) {
                export_base.push(tmp[i]);
            }
            tmp = document.querySelectorAll('input[type="button"][data-fp-url]');
            for (i = 0; i < tmp.length; i++) {
                export_base.push(tmp[i]);
            }
            for (i = 0; i < export_base.length; i++) {
                constructExportWidget(export_base[i]);
            }
            var previews = document.querySelectorAll('[type="filepicker-preview"][data-fp-url]');
            for (i = 0; i < previews.length; i++) {
                constructPreview(previews[i]);
            }
            appendStyle();
        }
    };
    var constructWidget = function(base) {
        if (base.jquery) {
            base = base[0];
        }
        var base_type = base.getAttribute("type");
        if (base_type === "filepicker") {
            constructPickWidget(base);
        } else if (base_type === "filepicker-dragdrop") {
            constructDragWidget(base);
        } else if (base_type === "filepicker-preview") {
            constructPreview(base);
        } else {
            constructExportWidget(base);
        }
    };
    var constructPreview = function(domElement) {
        var url = domElement.getAttribute("data-fp-url");
        if (!url || !fp.util.isFPUrl(url)) {
            return true;
        } else {
            url = url.replace("api/file/", "api/preview/");
        }
        var iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.width = "100%";
        iframe.height = "100%";
        domElement.appendChild(iframe);
    };
    function appendStyle() {
        try {
            var css = '.fp__btn{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:inline-block;height:34px;padding:4px 20px 5px 40px;margin-bottom:0;vertical-align:middle;-ms-touch-action:manipulation;touch-action:manipulation;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;font-family:"Open Sans", sans-serif;font-size:12px;font-weight:600;line-height:1.42857143;color:#fff;text-align:center;white-space:nowrap;background:#3ac7ed;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkMTI4ZDMwOC1iNjY2LTQyNzgtOTU1MC04NDk5YzViMzBhMmYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTJCRDQ1RUEwQzIxMTFFNThEOTU4QzAyNzQ4QUU2NzUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTJCRDQ1RTkwQzIxMTFFNThEOTU4QzAyNzQ4QUU2NzUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxZDgzZTQ5ZS0zYzE1LTQ3MTgtOTFkZi1iNTc0N2EyMjI5M2MiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ZDEyOGQzMDgtYjY2Ni00Mjc4LTk1NTAtODQ5OWM1YjMwYTJmIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+SmKrTgAAAOxJREFUeNqE0bFqQjEYhuFooSjUUhBEujsVXdtJwdFRvBBx1ntwEPdS8Ao6OpU6qbg4ilKRglooqDhV0jf4HTgcYht4SEL+LwlJzFp7b4zpoogE1lhghrl8YosNvg2hvj23IcbY2b/byoV+FDRyhTxeVXSIhF5c0QpfyISCzkJFD5rfIuXGbtIIjkUOMVRCO98hietgw2DXGpq4QSlynaP652goqqPCE0YYoPxfqKXQ0rceN/6WUj/3LYZDT3jUOKt+6t1SR1Z1nTfNJ5pXfNcLBnUVuU8u6AHe9fwXQ+4P2vjAHj2kLzyS+RVgAJKfyOcTLuk9AAAAAElFTkSuQmCC");background-repeat:no-repeat;background-position:17px 9px;border:1px solid transparent;border-radius:17px}.fp__btn:hover{background-color:#12a2c8}.fp__btn:active,.fp__btn:focus{outline:none}@media only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2 / 1), only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2){.fp__btn{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAaCAYAAABCfffNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkMTI4ZDMwOC1iNjY2LTQyNzgtOTU1MC04NDk5YzViMzBhMmYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTJCRDQ1RTYwQzIxMTFFNThEOTU4QzAyNzQ4QUU2NzUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTJCRDQ1RTUwQzIxMTFFNThEOTU4QzAyNzQ4QUU2NzUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyYTg3Yjk2MS1lYjk5LTRhODAtYWZjZi0wZjA2MTBlNzA5ZDYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ZDEyOGQzMDgtYjY2Ni00Mjc4LTk1NTAtODQ5OWM1YjMwYTJmIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+yaecmgAAAftJREFUeNq0ls8rRFEUx9+MSUKR8mPKr4YtxUJJykZkY6HIUlmglKUSFmwssZB/wI+FstGUBcWUBRZWyI8I0+RX2AjxfI/O5Di9Z+7z49Rnuvfcc+Z73733nft8tm1bbDWgF9SCHPAE7sAZOAH7zAE4BreWoflYZACMUN8yNxI5Ys5BDFwx1L7k9jOJ1KOxbP2fzZNIGI1GdjyDOXABAqAAVIHQL0QeLYjc25/WTcvnQB5oAeNgz/Zma/QHb8JR5yIiWRDxryAKHl0ENkEJJcWEcyyBQA54EfHrYiwVZIMQKOf2xxj9hEUSzaj6G5EONdMpgye3/NiYCbFJKWAV9Lkc5wbVjxltPatNO6xnk5hNEWgDNyqmn8eTQC4vlU8/iSWCBsEDJ2+BDBF47LKxJHqlfF1uInGS+bhqv5djO5RIxA1ahiUDgSdQofN9okAmslYqEcq3Am7AC9evGbCjEwMeykOag28YRBIl+j2IpDv4TkwS/b94Erpvon8tkqX6dHG9/bVIturvmiY6ibSDWTAJ8oW/WMVtG09PnekRde6bxdi1Gqs0fMe+iGTwyyStkMdKlX/XVCBeheMWBMmi/8pfKpa4nuM26ukCFopUJA/VjDtBUBXIRadKa7pcRBk4/aY2RVR1/pEIkcmVdJM/Mu7ABugBAa8CxLsAAwAX4ouMwjfqEwAAAABJRU5ErkJggg==");background-size:13px 13px}}';
            var head = document.head || document.getElementsByTagName("head")[0], style = document.createElement("style");
            style.type = "text/css";
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            head.appendChild(style);
        } catch (err) {}
    }
    return {
        constructPickWidget: constructPickWidget,
        constructDragWidget: constructDragWidget,
        constructExportWidget: constructExportWidget,
        buildWidgets: buildWidgets,
        constructWidget: constructWidget
    };
});

"use strict";

(function() {
    filepicker.internal(function() {
        var fp = this;
        fp.util.addOnLoad(fp.cookies.checkThirdParty);
        fp.util.addOnLoad(fp.widgets.buildWidgets);
    });
    delete filepicker.internal;
    delete filepicker.extend;
    var queue = filepicker._queue || [];
    var args;
    var len = queue.length;
    if (len) {
        for (var i = 0; i < len; i++) {
            args = queue[i];
            filepicker[args[0]].apply(filepicker, args[1]);
        }
    }
    if (filepicker._queue) {
        delete filepicker._queue;
    }
})();