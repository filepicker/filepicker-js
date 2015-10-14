//picker.js
'use strict';

filepicker.extend('picker', function(){
    var fp = this;

    var normalizeOptions = function(options) {
        var normalize = function(singular, plural, def){
            if (options[plural]) {
                if (!fp.util.isArray(options[plural])) {
                    options[plural] = [options[plural]];
                }
            } else if (options[singular]) {
                options[plural] = [options[singular]];
            } else if (def) {
                options[plural] = def;
            }
        };

        normalize('service', 'services');
        normalize('mimetype', 'mimetypes');
        normalize('extension', 'extensions');

        if (options.services) {
            for (var i = 0; i < options.services.length; i++) {
                var service = (''+options.services[i]).replace(' ','');

                if (fp.services[service] !== undefined) {//we use 0, so can't use !
                    service = fp.services[service];
                }

                options.services[i] = service;
            }
        }

        if (options.mimetypes && options.extensions) {
            throw fp.FilepickerException('Error: Cannot pass in both mimetype and extension parameters to the pick function');
        }
        if (!options.mimetypes && !options.extensions){
            options.mimetypes = ['*/*'];
        }

        if (options.openTo) {
            options.openTo = fp.services[options.openTo] || options.openTo;
        }
        fp.util.setDefault(options, 'container', fp.browser.isMobile ? 'window' : 'modal');
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
                //TODO: change payload to not require parsing
                onSuccess(fpfile);
            }

            //Try to close a modal if it exists.
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

            //Try to close a modal if it exists.
            fp.modal.close();
        };
        return handler;
    };

    var getUploadingHandler = function(onUploading) {
        onUploading = onUploading || function(){};
        var handler = function(data) {
            if (data.type !== 'uploading') {
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

        addIfExist(data, fpfile, 'id');
        addIfExist(data, fpfile, 'key');
        addIfExist(data, fpfile, 'container');
        addIfExist(data, fpfile, 'path');
        addIfExist(data, fpfile, 'client');

        //TODO: get writeable
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


                //TODO: change payload to not require parsing
                if (!fp.util.isArray(data.payload)) {
                    data.payload = [data.payload];
                }
                for (var i = 0; i < data.payload.length; i++) {
                    var fpfile = fpfileFromPayload(data.payload[i]);
                    fpfiles.push(fpfile);
                }
                onSuccess(fpfiles);
            }

            //Try to close a modal if it exists.
            fp.modal.close();
        };
        return handler;
    };

    var createPicker = function(options, onSuccess, onError, multiple, folder, onProgress, convertFile) {
        normalizeOptions(options);

        if (options.debug) {
            
            var dumy_data = {
                id:1,
                url: 'https://www.filepicker.io/api/file/-nBq2onTSemLBxlcBWn1',
                filename:'test.png',
                mimetype: 'image/png',
                size:58979,
                client:'computer'
            };

            var dumy_callback;

            if (multiple || options.storeLocation) {
                dumy_callback = [dumy_data, dumy_data, dumy_data];
            } else {
                dumy_callback = dumy_data;
            }

            //return immediately, but still async
            setTimeout(function(){
                onSuccess(dumy_callback);
            }, 1);
            return;
        }

        if (fp.cookies.THIRD_PARTY_COOKIES === undefined) {
            //if you want a modal, then we need to wait until we know if 3rd party cookies allowed.
            var alreadyHandled = false;
            fp.cookies.checkThirdParty(function(){
                if (!alreadyHandled) {
                    createPicker(options, onSuccess, onError, !!multiple, folder, onProgress);
                    alreadyHandled = true;
                }
            });
            return;
        }

        var id = fp.util.getId();

        //Wrapper around on success to make sure we don't also fire on close
        var finished = false;
        var onSuccessMark = function(fpfile){
            if (options.container === 'window') {
                window.onbeforeunload = null;
            }
            finished = true;
            onSuccess(fpfile);
        };
        var onErrorMark = function(fperror){
            finished = true;
            onError(fperror);
        };

        var onClose = function(){
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

        fp.window.open(options.container, url, onClose);
        fp.handlers.attach(id, handler);

        var key = id+'-upload';
        fp.handlers.attach(key, getUploadingHandler(function(){
            fp.handlers.detach(key);
        }));
    };

    function filterDataType(data, onProgress){ 
        if (data.type === 'filepickerProgress'){
            fp.uploading = true;
            if (onProgress) {
                onProgress(data.payload.data);
            }
        } else if (data.type === 'notUploading') {
            fp.uploading = false;
        } else if (data.type === 'closeModal') {
            fp.modal.close();
        } else if (data.type === 'hideModal') {
            fp.modal.hide();
        } else if (data.type === 'filepickerUrl') {
            return false;
        }
        return true;
    }

    return {
        createPicker: createPicker
    };
});
