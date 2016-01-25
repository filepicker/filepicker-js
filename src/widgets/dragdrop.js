'use strict';
//dragdrop.js
filepicker.extend('dragdrop', function(){
    var fp = this;

    var canDragDrop = function(){
        return (!!window.FileReader || navigator.userAgent.indexOf('Safari') >= 0) &&
        ('draggable' in document.createElement('span'));
    };

    //Takes the passed in div and makes it into a drop pane
    //options: multiple, mimetype, extension, maxSize
    //dragEnter, dragLeave
    //onStart, onSuccess, onError, onProgress
    var makeDropPane = function(div, options) {
        var err = 'No DOM element found to create drop pane';
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
            fp.util.console.error('Your browser doesn\'t support drag-drop functionality');
            return false;
        }

        options = options || {};
        //setting up defaults
        var dragEnter = options.dragEnter || function(){};
        var dragLeave = options.dragLeave || function(){};
        var onStart = options.onStart || function(){};
        var onSuccess = options.onSuccess || function(){};
        var onError = options.onError || function(){};
        var onProgress = options.onProgress || function(){};

        var mimetypes = options.mimetypes;
        if (!mimetypes) {
            if (options.mimetype) {
                mimetypes = [options.mimetype];
            } else {
                mimetypes = ['*/*'];
            }
        }

        if (fp.util.typeOf(mimetypes) === 'string'){
            mimetypes = mimetypes.split(',');
        }

        var extensions = options.extensions;
        if (!extensions) {
            if (options.extension) {
                extensions = [options.extension];
            }
        }

        if (fp.util.typeOf(extensions) === 'string'){
            extensions = extensions.replace(/ /g,'').split(',');
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
            return div && (div.getAttribute('disabled') || 'enabled') !== 'disabled';
        };

        //event listeners
        div.addEventListener('dragenter', function(e){
            if (enabled()) {
                dragEnter();
            }

            e.stopPropagation();
            e.preventDefault();
            return false;
        }, false);

        div.addEventListener('dragleave', function(e){
            if (enabled()) {
                dragLeave();
            }

            e.stopPropagation();
            e.preventDefault();
            return false;
        }, false);

        div.addEventListener('dragover', function(e) {
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
            return false;
        }, false);

        div.addEventListener('drop', function(e) {
            e.stopPropagation();
                e.preventDefault();

            if (!enabled()) { return false; }
            //check for folders
            var i; var items; var entry;
            if (e.dataTransfer.items) {
                items = e.dataTransfer.items;
                for (i = 0; i < items.length; i++) {
                    entry = items[i] && items[i].webkitGetAsEntry ? items[i].webkitGetAsEntry() : undefined;

                    if (entry && !!entry.isDirectory) {
                        onError('WrongType', 'Uploading a folder is not allowed');
                        return false;
                    }
                }
            }

            var files = e.dataTransfer.files,
                total = files.length,
                url = getImageSrcDrop(e);

            if (files.length) {
                if (verifyUpload(files)) {
                    onStart(files);
                    //disabling
                    div.setAttribute('disabled', 'disabled');
                    for (i = 0; i < files.length; i++) {
                        fp.store(files[i], store_options, getSuccessHandler(i, total), errorHandler, getProgressHandler(i, total));
                    }
                }
            } else if (url) {
                fp.storeUrl(
                    url,
                    function(blob){
                        var successHandlerForOneFile = getSuccessHandler(0, 1);
                        var blobToCheck = fp.util.clone(blob);
                        blobToCheck.name = blobToCheck.filename;

                        if (verifyUpload([blobToCheck])){
                            successHandlerForOneFile(blob);
                        } else {
                            fp.files.remove(blob.url, store_options, function(){}, function(){});
                        }
                    },
                    errorHandler,
                    getProgressHandler(0, 1)
                );
            } else {
                onError('NoFilesFound', 'No files uploaded');
            }
            return false;
        });

        var reenablePane = function(){
            // Re-enabling
            div.setAttribute('disabled', 'enabled');

            // For IE
            if (window.$) {
                window.$(div).prop('disabled', false);
            }
            // TODO find way to upgrade it in IE without jQuery
        };

        var progresses = {};
        var response = [];
        var getSuccessHandler = function(i, total) {
            return function(fpfile) {
                if (!options.multiple) {
                    onSuccess([fpfile]);
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
            onError('UploadError', err.toString());
            reenablePane();
        };

        var getProgressHandler = function(i, total) {
            return function(percent) {
                progresses[i] = percent;
                updateProgress(total);
            };
        };

        var updateProgress = function(totalCount){
            var totalProgress = 0;
            for (var i in progresses) {
                totalProgress += progresses[i];
            }
            var percentage = totalProgress / totalCount;
            onProgress(percentage);
        };

        var verifyUpload = function(files) {
            if (files.length > 0 ) {
                //Verify number
                if (files.length > 1 && !options.multiple) {
                    onError('TooManyFiles', 'Only one file at a time');
                    return false;
                }
                if (options.maxFiles > 0 && files.length > options.maxFiles) {
                    onError('TooManyFiles', 'Only ' + options.maxFiles + ' files at a time');
                    return false;
                }
                //Verify against extension, mimetypes, size
                var found; var file; var filename;
                for (var i = 0; i < files.length; i++) {
                    found = false;
                    file = files[i];
                    filename = file.name || file.fileName || 'Unknown file';

                    for (var j = 0; j < mimetypes.length; j++) {
                        var mimetype = fp.mimetypes.getMimetype(file);
                        found = found || fp.mimetypes.matchesMimetype(mimetype, mimetypes[j]);
                    }

                    if (!found) {
                        onError('WrongType', filename + ' isn\'t the right type of file');
                        return false;
                    }

                    if (extensions) {
                        found = false;
                        for (j = 0; j < extensions.length; j++) {
                            found = found || fp.util.endsWith(filename, extensions[j]);
                        }

                        if (!found) {
                            onError('WrongType', filename + ' isn\'t the right type of file');
                            return false;
                        }
                    }

                    if (file.size && !!options.maxSize && file.size > options.maxSize) {
                        onError('WrongSize', filename + ' is too large ('+file.size+' Bytes)');
                        return false;
                    }
                }
                //we're all good
                return true;
            } else {
                onError('NoFilesFound', 'No files uploaded');
            }
            return false;
        };


        var getImageSrcDrop = function(event){
            var url, matched;

            if (event.dataTransfer && typeof event.dataTransfer.getData === 'function') {
                url = event.dataTransfer.getData('text');

                try {
                    // invalid 'text/html' arg on IE10
                    url = url || event.dataTransfer.getData('text/html');
                } catch(e) {
                    fp.util.console.error(e);
                }

                if (url && !fp.util.isUrl(url)){
                    matched = url.match(/<img.*?src="(.*?)"/i);
                    url = matched && matched.length > 1 ? matched[1] : null;
                }

            }
            return url;
        };

        return true;
    };

    return {
        enabled: canDragDrop,
        makeDropPane: makeDropPane
    };
});
