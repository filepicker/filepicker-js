//iframeAjax.js
'use strict';

filepicker.extend('iframeAjax', function(){
    var fp = this;

    var IFRAME_ID = 'ajax_iframe';

    //we can only have one out at a time
    var queue = [];
    var running = false;

    var get_request = function(url, options) {
        options.method = 'GET';
        make_request(url, options);
    };

    var post_request = function(url, options) {
        options.method = 'POST';
        url += (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheBust='+fp.util.getId();
        make_request(url, options);
    };

    var runQueue = function(){
        if (queue.length > 0) {
            var next = queue.shift();
            make_request(next.url, next.options);
        }
    };

    //Take the data, wrap it in an input and a form, submit that into an iframe, and get the response
    var make_request = function(url, options) {
        if (running) {
            queue.push({url: url, options: options});
            return;
        }

        url += (url.indexOf('?') >= 0 ? '&' : '?') + 'plugin=' + fp.urls.getPlugin() + '&_cacheBust=' + fp.util.getId();
        url += '&Content-Type=text%2Fhtml';

        fp.comm.openChannel();

        //Opening an iframe to make the request to
        var uploadIFrame;
        //IE makes us do rediculous things -
        //http://terminalapp.net/submitting-a-form-with-target-set-to-a-script-generated-iframe-on-ie/
        try {
          uploadIFrame = document.createElement('<iframe name="'+IFRAME_ID+'">');
        } catch (ex) {
          uploadIFrame = document.createElement('iframe');
        }
        uploadIFrame.id = uploadIFrame.name = IFRAME_ID;
        uploadIFrame.style.display = 'none';
        var release = function(){
            //so we don't lock ourselves
            running = false;
        };
        if (uploadIFrame.attachEvent) {
            uploadIFrame.attachEvent('onload', release);
            uploadIFrame.attachEvent('onerror', release);
        } else {
            uploadIFrame.onerror = uploadIFrame.onload = release;
        }

        uploadIFrame.id = IFRAME_ID;
        uploadIFrame.name = IFRAME_ID;
        uploadIFrame.style.display = 'none';
        uploadIFrame.onerror = uploadIFrame.onload = function(){
            //so we don't lock ourselves
            running = false;
        };
        document.body.appendChild(uploadIFrame);

        fp.handlers.attach('upload', getReceiveUploadMessage(options));
        var form = document.createElement('form');
        form.method = options.method || 'GET';
        form.action = url;
        form.target = IFRAME_ID;
        
        var data = options.data;
        if (fp.util.isFileInputElement(data) || fp.util.isFile(data)) {
            //For IE8 you need both. Obnoxious
            form.encoding = form.enctype = 'multipart/form-data';
        }

        document.body.appendChild(form);

        //For the data: if it's an input already, put that in the form
        //If it's a File object, we have to get tricky and find the input
        //otherwise we just create the input
        var input;

        if (fp.util.isFile(data)) {
            var file_input = getInputForFile(data);
            if (!file_input) {
                throw fp.FilepickerException('Couldn\'t find corresponding file input.');
            }
            //key: val
            data = {'fileUpload': file_input};
        } else if (fp.util.isFileInputElement(data)) {
            input = data;
            data = {};
            data.fileUpload = input;
        } else if (data && fp.util.isElement(data) && data.tagName === 'INPUT') {
            input = data;
            data = {};
            data[input.name] = input;
        } else if (options.processData !== false) {
            data = {'data': data};
        }

        data.format = 'iframe';

        var input_cache = {};
        for (var key in data) {
            var val = data[key];
            if (fp.util.isElement(val) && val.tagName === 'INPUT') {
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
                var input_val = document.createElement('input');
                input_val.name = key;
                input_val.value = val;
                form.appendChild(input_val);
            }
        }

        running = true;

        //pulling this into a different thread to prevent timing weirdness
        window.setTimeout(function(){
            form.submit();

            //Now we put everything back
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
        var success = options.success || function(){};
        var error = options.error || function(){};
        var handler = function(data) {            
            if (data.type !== 'Upload'){
                return;
            }
            running = false;
            var response = data.payload;
            if (response.error) {
                error(response.error);
            } else {
                success(response);
            } 
            //So we don't double-call in the future
            fp.handlers.detach('upload');
            runQueue();
        };
        return handler;
    };

    var getInputForFile = function(file) {
        //probably won't be _that_ slow because there aren't usually many inputs/page
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[0];
            if (input.type !== 'file' || !input.files || !input.files.length) {
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
