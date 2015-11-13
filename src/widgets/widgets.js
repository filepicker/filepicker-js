'use strict';
//widgets.js
filepicker.extend('widgets', function(){
    var fp = this;

    var setAttrIfExists = function(key, options, attrname, dom) {
        var val = dom.getAttribute(attrname);
        if (val) {
            options[key] = val;
        }
    };

    var fireOnChangeEvent = function(input, fpfiles){
        var e;
        if (document.createEvent) {
            e = document.createEvent('Event');
            e.initEvent('change', true, false);
            //When we clear, we fire onchange with undefined
            e.fpfile = fpfiles ? fpfiles[0] : undefined;
            e.fpfiles = fpfiles;
            input.dispatchEvent(e);
        } else if (document.createEventObject) {
            e = document.createEventObject('Event');
            e.eventPhase = 2;
            e.currentTarget = e.srcElement = e.target = input;
            //When we clear, we fire onchange with undefined
            e.fpfile = fpfiles ? fpfiles[0] : undefined;
            e.fpfiles = fpfiles;
            input.fireEvent('onchange', e);
        } else if (input.onchange) {
            input.onchange(fpfiles);
        }
    };

    var splitIfExist = function(key, options) {
        if (options[key]){
            options[key] = options[key].split(',');
        }
    };

    var setAttrIfExistsArray = function(fpoptions, domElement, optionsObj) {
        for (var option in optionsObj) {
            setAttrIfExists(optionsObj[option], fpoptions, option, domElement);
        }
    };

    var constructOptions = function(domElement, mode){
        mode = mode || 'pick';
        var fpoptions = {},
            generalOptionsMap = {
            'data-fp-container': 'container',
            'data-fp-mimetype': 'mimetype',
            'data-fp-extension': 'extension',
            'data-fp-openTo': 'openTo',
            'data-fp-debug': 'debug',
            'data-fp-signature': 'signature',
            'data-fp-policy': 'policy',
            'data-fp-language': 'language',
            // v2
            'data-fp-background-upload': 'backgroundUpload',
            'data-fp-hide': 'hide',
            'data-fp-custom-css': 'customCss',

            'data-fp-crop-force': 'cropForce',
            'data-fp-crop-ratio': 'cropRatio',
            'data-fp-crop-dim': 'cropDim',
            'data-fp-crop-max': 'cropMax',
            'data-fp-crop-min': 'cropMin',
            'data-fp-show-close': 'showClose',
            'data-fp-conversions': 'conversions',
            'data-fp-custom-text': 'customText'
        },
            pickOnlyOptionsMap = {
            'data-fp-mimetypes': 'mimetypes',
            'data-fp-extensions': 'extensions',
            'data-fp-maxSize': 'maxSize',
            'data-fp-maxFiles': 'maxFiles',
            'data-fp-store-location': 'storeLocation',
            'data-fp-store-path': 'storePath',
            'data-fp-store-container': 'storeContainer',
            'data-fp-store-access': 'storeAccess',
            // v2
            'data-fp-image-quality': 'imageQuality',
            'data-fp-image-dim': 'imageDim',
            'data-fp-image-max': 'imageMax',
            'data-fp-image-min': 'imageMin',
            'data-fp-webcam-dim': 'webcamDim'
        };

        setAttrIfExistsArray(fpoptions, domElement, generalOptionsMap);

        if (mode === 'export') {
            setAttrIfExists('suggestedFilename', fpoptions, 'data-fp-suggestedFilename', domElement);
        } else if (mode === 'pick') {
            setAttrIfExistsArray(fpoptions, domElement, pickOnlyOptionsMap);
        }

        var services = domElement.getAttribute('data-fp-services');
        if (services) {
            services = services.split(',');
            for (var j=0; j<services.length; j++) {
                /*
                    One of the mapped service or custom service name
                */
                services[j] = fp.services[services[j].replace(' ','')] || services[j];
            }
            fpoptions.services = services;
        }

        var service = domElement.getAttribute('data-fp-service');
        if (service) {
            fpoptions.service = fp.services[service.replace(' ','')] || service;
        }

        var arrayToSplit = [
            'extensions',
            'mimetypes',
            'imageDim',
            'imageMin',
            'imageMax',
            'cropDim',
            'cropMax',
            'cropMin',
            'webcamDim',
            'conversions'
        ];

        for (var key in arrayToSplit) {
            splitIfExist(arrayToSplit[key], fpoptions);
        }

        var apikey = domElement.getAttribute('data-fp-apikey');
        if (apikey) {
            fp.setKey(apikey);
        }
        fpoptions.folders = domElement.getAttribute('data-fp-folders') === 'true';
        return fpoptions;
    };

    var isMultiple = function(domElement){
        return domElement.getAttribute('data-fp-multiple') === 'true';
    };

    /**
     * Constructs the standard pick widget
     * Arguments:
     * domObject: @DOMElement. The element in the dom to build on. Should be an input type='filepicker'
     */
    var constructPickWidget = function(domElement) {
        var widget = document.createElement('button');
        //So it's not submit
        //widget.type = 'button' will break ie8
        widget.setAttribute('type', 'button');

        widget.innerHTML = domElement.getAttribute('data-fp-button-text') || 'Pick File';
        widget.className = domElement.getAttribute('data-fp-button-class') || domElement.className || 'fp__btn';

        domElement.style.display = 'none';

        var fpoptions = constructOptions(domElement);

        if (isMultiple(domElement)) {
            widget.onclick = function() {
                widget.blur();
                fp.pickMultiple(fpoptions, function(fpfiles){
                    var urls = [];
                    for (var j=0; j<fpfiles.length; j++) {
                        urls.push(fpfiles[j].url);
                    }
                    domElement.value = urls.join();
                    fireOnChangeEvent(domElement, fpfiles);
                });
                return false;
            };
        } else {
            widget.onclick = function(){
                widget.blur();
                fp.pick(fpoptions, function(fpfile){
                    domElement.value = fpfile.url;
                    fireOnChangeEvent(domElement, [fpfile]);
                });
                return false;
            };
        }
        // insert the filepicker button after the target domElement
        // it does this by inserting before the nextSibling of the target domElement - if nextSibling is null, insertBefore() acts like appendChild() and inserts the element at the end of the parent
        // http://stackoverflow.com/questions/4793604/how-to-do-insert-after-in-javascript-without-using-a-library
        domElement.parentNode.insertBefore(widget, domElement.nextSibling);
    };

    /**
     * Constructs the standard pick widget
     * Arguments:
     * domObject: @DOMElement. The element in the dom to build on. Should be an input type='filepicker'
     */
    var constructConvertWidget = function(domElement) {
        var url = domElement.getAttribute('data-fp-url');
        if (!url) {
            return true;
        }
        var widget = document.createElement('button');
        //So it's not submit
        //widget.type = 'button' will break ie8
        widget.setAttribute('type', 'button');

        widget.innerHTML = domElement.getAttribute('data-fp-button-text') || 'Convert File';
        widget.className = domElement.getAttribute('data-fp-button-class') || domElement.className || 'fp__btn';

        domElement.style.display = 'none';

        var fpoptions = constructOptions(domElement, 'convert');
        widget.onclick = function(){
            widget.blur();
            fp.processImage(url, fpoptions, function(fpfile){
                domElement.value = fpfile.url;
                fireOnChangeEvent(domElement, [fpfile]);
            });
            return false;
        };
        // insert the filepicker button after the target domElement
        // it does this by inserting before the nextSibling of the target domElement - if nextSibling is null, insertBefore() acts like appendChild() and inserts the element at the end of the parent
        // http://stackoverflow.com/questions/4793604/how-to-do-insert-after-in-javascript-without-using-a-library
        domElement.parentNode.insertBefore(widget, domElement.nextSibling);
    };

    /**
     * Constructs the pick widget along with a drag-drop pane along with a drag-drop pane along with a drag-drop pane along with a drag-drop pane
     * Arguments:
     * domObject: @DOMElement. The element in the dom to build on. Should be an input type='filepicker-dragdrop'
     */
    var constructDragWidget = function(domElement) {
        var pane = document.createElement('div');
        pane.className = domElement.getAttribute('data-fp-class') || domElement.className;
        pane.style.padding = '1px';
        //pane.style.display = 'inline-block';

        // inserts the pane after the target domElement
        domElement.style.display = 'none';
        domElement.parentNode.insertBefore(pane, domElement.nextSibling);

        var pickButton = document.createElement('button');
        //So it's not submit
        //pickButton.type = 'button' will break ie8
        pickButton.setAttribute('type', 'button');
        pickButton.innerHTML = domElement.getAttribute('data-fp-button-text') || 'Pick File';
        pickButton.className = domElement.getAttribute('data-fp-button-class')  || 'fp__btn';
        pane.appendChild(pickButton);

        var dragPane = document.createElement('div');
        setupDragContainer(dragPane);

        dragPane.innerHTML = domElement.getAttribute('data-fp-drag-text') || 'Or drop files here';
        dragPane.className = domElement.getAttribute('data-fp-drag-class') || '';

        pane.appendChild(dragPane);

        var fpoptions = constructOptions(domElement),
            multiple = isMultiple(domElement);

        if (fp.dragdrop.enabled()) {
            setupDropPane(dragPane, multiple, fpoptions, domElement);
        } else {
            dragPane.innerHTML = '&nbsp;';
        }

        if (multiple) {
            dragPane.onclick = pickButton.onclick = function(){
                pickButton.blur();
                fp.pickMultiple(fpoptions, function(fpfiles){
                    var urls = [];
                    var filenames = [];
                    for (var j=0; j<fpfiles.length; j++) {
                        urls.push(fpfiles[j].url);
                        filenames.push(fpfiles[j].filename);
                    }
                    domElement.value = urls.join();
                    onFilesUploaded(domElement, dragPane, filenames.join(', '));
                    fireOnChangeEvent(domElement, fpfiles);
                });
                return false;
            };
        } else {
            dragPane.onclick = pickButton.onclick = function(){
                pickButton.blur();
                fp.pick(fpoptions, function(fpfile){
                    domElement.value = fpfile.url;
                    onFilesUploaded(domElement, dragPane, fpfile.filename);
                    fireOnChangeEvent(domElement, [fpfile]);
                });
                return false;
            };
        }
    };

    var onFilesUploaded = function(input, odrag, text) {
        odrag.innerHTML = text;
        odrag.style.padding = '2px 4px';
        odrag.style.cursor = 'default';
        odrag.style.width = '';

        var cancel = document.createElement('span');
        cancel.innerHTML = 'X';
        cancel.style.borderRadius = '8px';
        cancel.style.fontSize = '14px';
        cancel.style.cssFloat = 'right';
        cancel.style.padding = '0 3px';
        cancel.style.color = '#600';
        cancel.style.cursor = 'pointer';

        var clickFn = function(e) {
            if (!e) {
                e = window.event;
            }
            e.cancelBubble = true;
            if (e.stopPropagation) {
                e.stopPropagation();
            }

            //reset
            setupDragContainer(odrag);
            if (!fp.dragdrop.enabled) {
                odrag.innerHTML = '&nbsp;';
            } else {
                odrag.innerHTML = input.getAttribute('data-fp-drag-text') || 'Or drop files here';
            }

            input.value = '';
            fireOnChangeEvent(input);
            return false;
        };

        if (cancel.addEventListener) {
            cancel.addEventListener('click', clickFn, false);
        } else if (cancel.attachEvent) {
            cancel.attachEvent('onclick', clickFn);
        }

        odrag.appendChild(cancel);
    };

    var setupDragContainer = function(dragPane) {
        dragPane.style.border = '1px dashed #AAA';
        dragPane.style.display = 'inline-block';
        dragPane.style.margin = '0 0 0 4px';
        dragPane.style.borderRadius = '3px';
        dragPane.style.backgroundColor = '#F3F3F3';
        dragPane.style.color = '#333';
        dragPane.style.fontSize = '14px';
        dragPane.style.lineHeight = '22px';
        dragPane.style.padding = '2px 4px';
        dragPane.style.verticalAlign = 'middle';
        dragPane.style.cursor = 'pointer';
        dragPane.style.overflow = 'hidden';
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
            /*Storing config*/
            location: fpoptions.storeLocation,
            path: fpoptions.storePath,
            container: fpoptions.storeContainer,
            access: fpoptions.storeAccess,
            policy: fpoptions.policy,
            signature: fpoptions.signature,
            /*events*/
            dragEnter: function() {
                odrag.innerHTML = 'Drop to upload';
                odrag.style.backgroundColor = '#E0E0E0';
                odrag.style.border = '1px solid #000';
            },
            dragLeave: function() {
                odrag.innerHTML = text;
                odrag.style.backgroundColor = '#F3F3F3';
                odrag.style.border = '1px dashed #AAA';
            },
            onError: function(type, msg) {
                if (type === 'TooManyFiles') {
                    odrag.innerHTML = msg;
                } else if (type === 'WrongType') {
                    odrag.innerHTML = msg;
                } else if (type === 'NoFilesFound') {
                    odrag.innerHTML = msg;
                } else if (type === 'UploadError') {
                    odrag.innerHTML = 'Oops! Had trouble uploading.';
                }
            },
            onStart: function(files) {
                pbar = setupProgress(odrag);
            },
            onProgress: function(percentage) {
                if (pbar) {
                    pbar.style.width = percentage+'%';
                }
            },
            onSuccess: function(fpfiles) {
                var vals = [];
                var filenames = [];
                for (var i = 0; i < fpfiles.length; i++){
                    vals.push(fpfiles[i].url);
                    filenames.push(fpfiles[i].filename);
                }
                input.value = vals.join();
                onFilesUploaded(input, odrag, filenames.join(', '));
                fireOnChangeEvent(input, fpfiles);
            }
        });
    };

    var setupProgress = function(odrag) {
        var pbar = document.createElement('div');
        var height = odrag.offsetHeight - 2;
        pbar.style.height = height + 'px';
        pbar.style.backgroundColor = '#0E90D2';
        pbar.style.width = '2%';
        pbar.style.borderRadius = '3px';

        odrag.style.width = odrag.offsetWidth + 'px';
        odrag.style.padding = '0';
        odrag.style.border = '1px solid #AAA';
        odrag.style.backgroundColor = '#F3F3F3';
        odrag.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.1)';
        odrag.innerHTML = '';
        odrag.appendChild(pbar);
        return pbar;
    };

    /**
     * Constructs the standard export widget
     * Arguments:
     * domObject: @DOMElement. The element in the dom to build on. Should be an element with data-fp-url set
     */
    var constructExportWidget = function(domElement) {
        //Most likely they will want to set things like data-fp-url on the fly, so
        //we get the properties dynamically
        domElement.onclick = function(){
            var url = domElement.getAttribute('data-fp-url');
            if (!url) {
                return true;
            }

            var fpoptions = constructOptions(domElement, 'export');

            fp.exportFile(url, fpoptions);

            return false;
        };
    };


    /**
     * Builds all the widgets, searching through the current DOM
     */
    var buildWidgets = function(){
        if (document.querySelectorAll) {
            //Pick Widgets
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
            var tmp = document.querySelectorAll('button[data-fp-url]');
            for (i=0; i< tmp.length; i++) {
                export_base.push(tmp[i]);
            }
            tmp = document.querySelectorAll('a[data-fp-url]');
            for (i=0; i< tmp.length; i++) {
                export_base.push(tmp[i]);
            }
            tmp = document.querySelectorAll('input[type="button"][data-fp-url]');
            for (i=0; i< tmp.length; i++) {
                export_base.push(tmp[i]);
            }
            for (i=0; i < export_base.length; i++) {
                constructExportWidget(export_base[i]);
            }
            var previews = document.querySelectorAll('[type="filepicker-preview"][data-fp-url]');
            for (i=0; i< previews.length; i++) {
                constructPreview(previews[i]);
            }
            appendStyle();
        }
    };

    var constructWidget = function(base) {
        if (base.jquery) {
            base = base[0];
        }
        var base_type = base.getAttribute('type');
        if (base_type === 'filepicker'){
            constructPickWidget(base);
        } else if (base_type === 'filepicker-dragdrop'){
            constructDragWidget(base);
        } else if (base_type === 'filepicker-preview'){
            constructPreview(base);
        // responsive image widget 
        } else if (base.getAttribute('data-fp-src')){
            fp.responsiveImages.construct(base);
        } else {
            constructExportWidget(base);
        }
    };


    var constructPreview = function(domElement) {
        var url = domElement.getAttribute('data-fp-url'),
            css = domElement.getAttribute('data-fp-custom-css');

        if (!url || !fp.util.isFPUrl(url)) {    
            return true;
        } else {
            url = url.replace('api/file/', 'api/preview/');
        }

        var iframe = document.createElement('iframe');
        if (css){
            url = fp.util.appendQueryToUrl(url, 'css', css);
        }
        iframe.src = url;

        /* Set full size so it gets size from parrent element  */

        iframe.width = '100%';
        iframe.height = '100%';
        
        domElement.appendChild(iframe);
    };


    function appendStyle(){
        try {
            var css = '.fp__btn{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:inline-block;height:34px;padding:4px 20px 5px 40px;margin-bottom:0;vertical-align:middle;-ms-touch-action:manipulation;touch-action:manipulation;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;font-family:"Open Sans", sans-serif;font-size:12px;font-weight:600;line-height:1.42857143;color:#fff;text-align:center;white-space:nowrap;background:#3ac7ed;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkMTI4ZDMwOC1iNjY2LTQyNzgtOTU1MC04NDk5YzViMzBhMmYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTJCRDQ1RUEwQzIxMTFFNThEOTU4QzAyNzQ4QUU2NzUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTJCRDQ1RTkwQzIxMTFFNThEOTU4QzAyNzQ4QUU2NzUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxZDgzZTQ5ZS0zYzE1LTQ3MTgtOTFkZi1iNTc0N2EyMjI5M2MiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ZDEyOGQzMDgtYjY2Ni00Mjc4LTk1NTAtODQ5OWM1YjMwYTJmIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+SmKrTgAAAOxJREFUeNqE0bFqQjEYhuFooSjUUhBEujsVXdtJwdFRvBBx1ntwEPdS8Ao6OpU6qbg4ilKRglooqDhV0jf4HTgcYht4SEL+LwlJzFp7b4zpoogE1lhghrl8YosNvg2hvj23IcbY2b/byoV+FDRyhTxeVXSIhF5c0QpfyISCzkJFD5rfIuXGbtIIjkUOMVRCO98hietgw2DXGpq4QSlynaP652goqqPCE0YYoPxfqKXQ0rceN/6WUj/3LYZDT3jUOKt+6t1SR1Z1nTfNJ5pXfNcLBnUVuU8u6AHe9fwXQ+4P2vjAHj2kLzyS+RVgAJKfyOcTLuk9AAAAAElFTkSuQmCC");background-repeat:no-repeat;background-position:17px 9px;border:1px solid transparent;border-radius:17px}.fp__btn:hover{background-color:#12a2c8}.fp__btn:active,.fp__btn:focus{outline:none}@media only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2 / 1), only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2){.fp__btn{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAaCAYAAABCfffNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkMTI4ZDMwOC1iNjY2LTQyNzgtOTU1MC04NDk5YzViMzBhMmYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTJCRDQ1RTYwQzIxMTFFNThEOTU4QzAyNzQ4QUU2NzUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTJCRDQ1RTUwQzIxMTFFNThEOTU4QzAyNzQ4QUU2NzUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyYTg3Yjk2MS1lYjk5LTRhODAtYWZjZi0wZjA2MTBlNzA5ZDYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ZDEyOGQzMDgtYjY2Ni00Mjc4LTk1NTAtODQ5OWM1YjMwYTJmIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+yaecmgAAAftJREFUeNq0ls8rRFEUx9+MSUKR8mPKr4YtxUJJykZkY6HIUlmglKUSFmwssZB/wI+FstGUBcWUBRZWyI8I0+RX2AjxfI/O5Di9Z+7z49Rnuvfcc+Z73733nft8tm1bbDWgF9SCHPAE7sAZOAH7zAE4BreWoflYZACMUN8yNxI5Ys5BDFwx1L7k9jOJ1KOxbP2fzZNIGI1GdjyDOXABAqAAVIHQL0QeLYjc25/WTcvnQB5oAeNgz/Zma/QHb8JR5yIiWRDxryAKHl0ENkEJJcWEcyyBQA54EfHrYiwVZIMQKOf2xxj9hEUSzaj6G5EONdMpgye3/NiYCbFJKWAV9Lkc5wbVjxltPatNO6xnk5hNEWgDNyqmn8eTQC4vlU8/iSWCBsEDJ2+BDBF47LKxJHqlfF1uInGS+bhqv5djO5RIxA1ahiUDgSdQofN9okAmslYqEcq3Am7AC9evGbCjEwMeykOag28YRBIl+j2IpDv4TkwS/b94Erpvon8tkqX6dHG9/bVIturvmiY6ibSDWTAJ8oW/WMVtG09PnekRde6bxdi1Gqs0fMe+iGTwyyStkMdKlX/XVCBeheMWBMmi/8pfKpa4nuM26ukCFopUJA/VjDtBUBXIRadKa7pcRBk4/aY2RVR1/pEIkcmVdJM/Mu7ABugBAa8CxLsAAwAX4ouMwjfqEwAAAABJRU5ErkJggg==");background-size:13px 13px}}';
            var head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            if (style.styleSheet){
              style.styleSheet.cssText = css;
            } else {
              style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
        } catch(err){
            // pass
        }
    }

    return {
        constructPickWidget: constructPickWidget,
        constructDragWidget: constructDragWidget,
        constructExportWidget: constructExportWidget,
        buildWidgets: buildWidgets,
        constructWidget: constructWidget
    };
});
