//files.js
'use strict';

filepicker.extend('files', function(){
    var fp = this;

    var readFromFPUrl = function(url, options, onSuccess, onError, onProgress){
        //If base64encode === true, then we get base64 back from the server and pass it back
        //If base64encode === false, then we pass back what we get from the server
        //If it's not specified, we do the thing most likely to be right, which is to ask for it base64
        //encoded from the server and decode it before giving it back
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

    var readFromUrl = function(url, options, onSuccess, onError, onProgress){

        if (options.cache !== true) {
            options._cacheBust = fp.util.getId();
        }

        fp.ajax.get(url, {
            data: options,
            headers: {'X-NO-STREAM': true},
            success: onSuccess,
            error: function(msg, status, xhr) {
                if (msg === 'CORS_not_allowed') {
                    onError(new fp.errors.FPError(113));
                } else if (msg === 'CORS_error') {
                    onError(new fp.errors.FPError(114));
                } else if (msg ==='not_found') {
                    onError(new fp.errors.FPError(115));
                } else if (msg === 'bad_params') {
                    onError(new fp.errors.FPError(400));
                } else if (msg === 'not_authorized') {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(118));
                }
            },
            progress: onProgress
        });
    };

    var readFromFile = function(file, options, onSuccess, onError, onProgress){
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            //Browser doesn't support reading from DOM file objects, so store the file and read from there
            onProgress(10);
            fp.files.storeFile(file, {}, function(fpfile){
                onProgress(50);
                fp.files.readFromFPUrl(fpfile.url, options, onSuccess, onError,
                    function(progress){
                        onProgress(50+progress/2);
                    });
            }, onError, function(progress){
                onProgress(progress/2);
            });

            //Lame way - error out
            //onError(new fp.errors.FPError(111));
            return;
        }

        var base64encode = !!options.base64encode;
        var asText = !!options.asText;

        var reader = new FileReader();

        reader.onprogress = function(evt) {
            if (evt.lengthComputable) {
                onProgress(Math.round((evt.loaded/evt.total) * 100));
            }
        };

        reader.onload = function(evt) {
            onProgress(100);
            if (base64encode) {
                //asText determines whether we utf8encode or not
                onSuccess(fp.base64.encode(evt.target.result, asText));
            } else {
                onSuccess(evt.target.result);
            }
        };

        reader.onerror = function(evt) {
            switch(evt.target.error.code) {
                case evt.target.error.NOT_FOUND_ERR:
                    onError(new fp.errors.FPError(115));
                    break;
                case evt.target.error.NOT_READABLE_ERR:
                    onError(new fp.errors.FPError(116));
                    break;
                case evt.target.error.ABORT_ERR:
                    onError(new fp.errors.FPError(117));
                    break; // noop
                default:
                    onError(new fp.errors.FPError(118));
                    break;
            }
        };

        //TODO: For IE10, use readAsArrayBuffer, handle result
        if (asText || !reader.readAsBinaryString) {
            reader.readAsText(file);
        } else {
            reader.readAsBinaryString(file);
        }
    };

    var writeDataToFPUrl = function(fp_url, input, options, onSuccess, onError, onProgress) {
        var mimetype = options.mimetype || 'text/plain';
        fp.ajax.post(fp.urls.constructWriteUrl(fp_url, options), {
            headers: {'Content-Type': mimetype},
            data: input,
            processData: false,
            json: true,
            success: function(json) {
                onSuccess(fp.util.standardizeFPFile(json));
            },
            error: function(msg, status, xhr) {
                if (msg === 'not_found') {
                    onError(new fp.errors.FPError(121));
                } else if (msg === 'bad_params') {
                    onError(new fp.errors.FPError(122));
                } else if (msg === 'not_authorized') {
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
            if (msg === 'not_found') {
                onError(new fp.errors.FPError(121));
            } else if (msg === 'bad_params') {
                onError(new fp.errors.FPError(122));
            } else if (msg === 'not_authorized') {
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
            if (msg === 'not_found') {
                onError(new fp.errors.FPError(121));
            } else if (msg === 'bad_params') {
                onError(new fp.errors.FPError(122));
            } else if (msg === 'not_authorized') {
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
            data: {'url': input},
            json: true,
            success: function(json) {
                onSuccess(fp.util.standardizeFPFile(json));
            },
            error: function(msg, status, xhr) {
                if (msg === 'not_found') {
                    onError(new fp.errors.FPError(121));
                } else if (msg === 'bad_params') {
                    onError(new fp.errors.FPError(122));
                } else if (msg === 'not_authorized') {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(123));
                }
            },
            progress: onProgress
        });
    };

    var storeFileInput = function(input, options, onSuccess, onError, onProgress) {
        //Not sure why we're here if we have a files object, just do that
        if (input.files) {
            if (input.files.length === 0) {
                onError(new fp.errors.FPError(115));
            } else {
                storeFile(input.files[0], options, onSuccess, onError, onProgress);
            }
            return;
        }

        fp.util.setDefault(options, 'location', 'S3');

        if (!options.filename) {
            options.filename = input.value.replace('C:\\fakepath\\','') || input.name;
        }

        var old_name = input.name;
        input.name = 'fileUpload';
        fp.iframeAjax.post(fp.urls.constructStoreUrl(options), {
            //data: {'fileUpload': input},
            data: input,
            processData: false,
            json: true,
            success: function(json) {
                input.name = old_name;
                //Massaging the response - we want a mimetype for fpfiles not a type
                onSuccess(fp.util.standardizeFPFile(json));
            },
            error: function(msg, status, xhr) {
                if (msg === 'not_found') {
                    onError(new fp.errors.FPError(121));
                } else if (msg === 'bad_params') {
                    onError(new fp.errors.FPError(122));
                } else if (msg === 'not_authorized') {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(123));
                }
            }
        });
    };
        
    //Takes a file and hands back a url
    var storeFile = function(input, options, onSuccess, onError, onProgress) {
        fp.util.setDefault(options, 'location', 'S3');

        var error = function(msg, status, xhr) {
            if (msg === 'not_found') {
                onError(new fp.errors.FPError(121));
            } else if (msg === 'bad_params') {
                onError(new fp.errors.FPError(122));
            } else if (msg === 'not_authorized') {
                onError(new fp.errors.FPError(403));
            } else {
                fp.util.console.error(msg);
                onError(new fp.errors.FPError(123));
            }
        };
        var success = function(json) {
            //Massaging the response - we want a mimetype for fpfiles not a type
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
            data.append('fileUpload',file);
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
        fp.util.setDefault(options, 'location', 'S3');
        fp.util.setDefault(options, 'mimetype', 'text/plain');
        
        fp.ajax.post(fp.urls.constructStoreUrl(options), {
            headers: {'Content-Type': options.mimetype},
            data: input,
            processData: false,
            json: true,
            success: function(json) {
                //Massaging the response - we want a mimetype for fpfiles not a type
                onSuccess(fp.util.standardizeFPFile(json));
            },
            error: function(msg, status, xhr) {
                if (msg === 'not_found') {
                    onError(new fp.errors.FPError(121));
                } else if (msg === 'bad_params') {
                    onError(new fp.errors.FPError(122));
                } else if (msg === 'not_authorized') {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(123));
                }
            },
            progress: onProgress
        });
    };

    var storeUrl = function(input, options, onSuccess, onError, onProgress) {
        fp.util.setDefault(options, 'location', 'S3');

        fp.ajax.post(fp.urls.constructStoreUrl(options), {
            data: {'url': input},
            json: true,
            success: function(json) {
                //Massaging the response - we want a mimetype for fpfiles not a type
                onSuccess(fp.util.standardizeFPFile(json));
            },
            error: function(msg, status, xhr) {
                if (msg === 'not_found') {
                    onError(new fp.errors.FPError(151));
                } else if (msg === 'bad_params') {
                    onError(new fp.errors.FPError(152));
                } else if (msg === 'not_authorized') {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(153));
                }
            },
            progress: onProgress
        });
    };

    var stat = function(fp_url, options, onSuccess, onError) {
        var dateparams = ['uploaded','modified','created'];

        if (options.cache !== true) {
            options._cacheBust = fp.util.getId();
        }

        fp.ajax.get(fp_url+'/metadata', {
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
                if (msg === 'not_found') {
                    onError(new fp.errors.FPError(161));
                } else if (msg === 'bad_params') {
                    onError(new fp.errors.FPError(400));
                } else if (msg === 'not_authorized') {
                    onError(new fp.errors.FPError(403));
                } else {
                    onError(new fp.errors.FPError(162));
                }
            }
        });
    };

    var remove = function(fp_url, options, onSuccess, onError) {
        options.key = fp.apikey;
        fp.ajax.post(fp_url+'/remove', {
            data: options,
            success: function(resp) {
                onSuccess();
            },
            error: function(msg, status, xhr) {
                if (msg === 'not_found') {
                    onError(new fp.errors.FPError(171));
                } else if (msg === 'bad_params') {
                    onError(new fp.errors.FPError(400));
                } else if (msg === 'not_authorized') {
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
