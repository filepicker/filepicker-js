//exporter.js
'use strict';

filepicker.extend('exporter', function(){
    var fp = this;

    var normalizeOptions = function(options) {
        var normalize = function(singular, plural, def){
            if (options[plural] && !fp.util.isArray(options[plural])) {
                options[plural] = [options[plural]];
            } else if (options[singular]) {
                options[plural] = [options[singular]];
            } else if (def) {
                options[plural] = def;
            }
        };

        if (options.mimetype && options.extension) {
            throw fp.FilepickerException('Error: Cannot pass in both mimetype and extension parameters to the export function');
        }
        normalize('service', 'services');
        if (options.services) {
            for (var i = 0; i < options.services.length; i++) {
                var service = (''+options.services[i]).replace(' ','');
                var sid = fp.services[service];
                options.services[i] = (sid === undefined ? service : sid);
            }
        }
        if (options.openTo) {
            options.openTo = fp.services[options.openTo] || options.openTo;
        }

        fp.util.setDefault(options, 'container', fp.browser.openInModal() ? 'modal' : 'window');
    };

    var getExportHandler = function(onSuccess, onError) {
        var handler = function(data) {
            if (data.type !== 'filepickerUrl'){
                return;
            }

            if (data.error) {
                fp.util.console.error(data.error);
                onError(fp.errors.FPError(132));
            } else {
                var fpfile = {};
                //TODO: change payload to not require parsing
                fpfile.url = data.payload.url;
                fpfile.filename = data.payload.data.filename;
                fpfile.mimetype = data.payload.data.type;
                fpfile.size = data.payload.data.size;
                fpfile.client = data.payload.data.client;
                //TODO: get writeable
                fpfile.isWriteable = true;
                onSuccess(fpfile);
            }

            //Try to close a modal if it exists.
            fp.modal.close();
        };
        return handler;
    };

    var createExporter = function(input, options, onSuccess, onError) {
        normalizeOptions(options);

        var api = {
            close: function () {
                fp.modal.close();
            }
        };

        if (options.debug) {
            //return immediately, but still async
            setTimeout(function(){
                onSuccess({
                    id:1,
                    url: 'https://www.filepicker.io/api/file/-nBq2onTSemLBxlcBWn1',
                    filename: 'test.png',
                    mimetype: 'image/png',
                    size:58979,
                    client: 'computer'
                });
            }, 1);
            return api;
        }

        if (fp.cookies.THIRD_PARTY_COOKIES === undefined) {
            //if you want a modal, then we need to wait until we know if 3rd party cookies allowed.
            var alreadyHandled = false;
            fp.cookies.checkThirdParty(function(){
                if (!alreadyHandled) {
                    createExporter(input, options, onSuccess, onError);
                    alreadyHandled = true;
                }
            });
            return api;
        }

        var id = fp.util.getId();

        //Wrapper around on success to make sure we don't also fire on close
        var finished = false;
        var onSuccessMark = function(fpfile){
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
                onError(fp.errors.FPError(131));
            }
        };

        fp.window.open(options.container, fp.urls.constructExportUrl(input, options, id), onClose);
        fp.handlers.attach(id, getExportHandler(onSuccessMark, onErrorMark));

        return api;
    };

    return {
        createExporter: createExporter
    };
});
