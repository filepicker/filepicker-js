'use strict';
//dragdrop.js
filepicker.extend('dragdrop', function(){
    var fp = this;
    var listeners = [];

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

        if (extensions) {
            for (var i = 0; i < extensions.length; i++) {
                extensions[i] = extensions[i].toLowerCase();
            }
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
        function dragEnterListener(e){
            if (enabled()) {
                dragEnter();
            }

            e.stopPropagation();
            e.preventDefault();
            return false;
        };
        div.addEventListener('dragenter', dragEnterListener, false);
        listeners.push({ element: div, event: 'dragenter', listener: dragEnterListener });

        function dragLeaveListener(e){
            if (enabled()) {
                dragLeave();
            }

            e.stopPropagation();
            e.preventDefault();
            return false;
        };
        div.addEventListener('dragleave', dragLeaveListener, false);
        listeners.push({ element: div, event: 'dragleave', listener: dragLeaveListener });

        function dragOverListener(e) {
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
            return false;
        };
        div.addEventListener('dragover', dragOverListener, false);
        listeners.push({ element: div, event: 'dragover', listener: dragOverListener });

        function dropListener(e) {
            e.stopPropagation();
            e.preventDefault();

            if (!enabled()) { return false; }

            if (isFolderDropped(e)){ return false; }

            var files = e.dataTransfer.files,
                imageSrc = getImageSrcDrop(e.dataTransfer);

            if (files.length) {
                uploadDroppedFiles(files);
            } else if (imageSrc) {
                uploadImageSrc(imageSrc);
            } else {
                onError('NoFilesFound', 'No files uploaded');
            }
            return false;
        };
        div.addEventListener('drop', dropListener);
        listeners.push({ element: div, event: 'drop', listener: dropListener });

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


        var getImageSrcDrop = function(dataTransfer){
            var url, matched;

            if (dataTransfer && typeof dataTransfer.getData === 'function') {
                url = dataTransfer.getData('text');

                try {
                    // invalid 'text/html' arg on IE10
                    url = url || dataTransfer.getData('text/html');
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

        function onSuccessSrcUpload(blob){
            var successHandlerForOneFile = getSuccessHandler(0, 1);
            var blobToCheck = fp.util.clone(blob);
            blobToCheck.name = blobToCheck.filename;

            if (verifyUpload([blobToCheck])){
                successHandlerForOneFile(blob);
            } else {
                fp.files.remove(blob.url, store_options, function(){}, function(){});
            }
        }

        function uploadDroppedFiles(files){
            var total = files.length,
                i;

            if (verifyUpload(files)) {
                onStart(files);
                //disabling
                div.setAttribute('disabled', 'disabled');
                for (i = 0; i < files.length; i++) {
                    fp.store(files[i], store_options, getSuccessHandler(i, total), errorHandler, getProgressHandler(i, total));
                }
            }
        }

        function uploadImageSrc(imageSrc){
            var progressHandlerForOneFile = getProgressHandler(0, 1);
            fp.storeUrl(
                imageSrc,
                onSuccessSrcUpload,
                errorHandler,
                progressHandlerForOneFile
            );
        }

        function isFolderDropped(event){
            //check for folders
            var entry,
                items,
                i;

            if (event.dataTransfer.items) {
                items = event.dataTransfer.items;
                for (i = 0; i < items.length; i++) {
                    entry = items[i] && items[i].webkitGetAsEntry ? items[i].webkitGetAsEntry() : undefined;

                    if (entry && !!entry.isDirectory) {
                        onError('WrongType', 'Uploading a folder is not allowed');
                        return true;
                    }
                }
            }
            return false;
        }
    };

    var clearDropPaneEventListeners = function() {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].element.removeEventListener(listeners[i].event, listeners[i].listener);
        }
    };

    return {
        enabled: canDragDrop,
        makeDropPane: makeDropPane,
        clearDropPaneEventListeners: clearDropPaneEventListeners
    };
});
