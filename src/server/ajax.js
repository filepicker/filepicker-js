//ajax.js
'use strict';
/*jshint eqeqeq:false */

filepicker.extend('ajax', function(){
    var fp = this;

    var get_request = function(url, options) {
        options.method = 'GET';
        make_request(url, options);
    };

    var post_request = function(url, options) {
        options.method = 'POST';
        url += (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheBust='+fp.util.getId();
        make_request(url, options);
    };

    var toQueryString = function(object, base) {
        var queryString = [];
        for (var key in object) {
            var value = object[key];
            if (base){
                key = base + '. + key + ';
            }
            var result;
            switch (fp.util.typeOf(value)){
                case 'object': result = toQueryString(value, key); break;
                case 'array':
                    var qs = {};
                    for (var i = 0; i < value.length; i++) {
                        qs[i] = value[i];
                    }
                    result = toQueryString(qs, key);
                break;
                default: result = key + '=' + encodeURIComponent(value); break;
            }
            if (value !== null){
                queryString.push(result);
            }
        }

        return queryString.join('&');
    };

    var getXhr = function() {
        try{
            // Modern browsers
            return new window.XMLHttpRequest();
        } catch (e){
            // IE
            try{
                return new window.ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
                try{
                    return new window.ActiveXObject('Microsoft.XMLHTTP');
                } catch (e){
                    // Something went wrong
                    return null;
                }
            }
        }
    };

    var make_request = function(url, options) {
        //setting defaults
        url = url || '';
        var method = options.method ? options.method.toUpperCase() : 'POST';
        var success = options.success || function(){};
        var error = options.error || function(){};
        var async = options.async === undefined ? true : options.async;
        var data = options.data || null;
        var processData = options.processData === undefined ? true : options.processData;
        var headers = options.headers || {};

        var urlParts = fp.util.parseUrl(url);
        var origin = window.location.protocol + '//' + window.location.host;
        var crossdomain = origin !== urlParts.origin;
        var finished = false;
        url += (url.indexOf('?') >= 0 ? '&' : '?') + 'plugin=' + fp.urls.getPlugin();
        //var crossdomain = window.location
        if (data && processData) {
            data = toQueryString(options.data);
        }

        //creating the request
        var xhr;
        if (options.xhr) {
            xhr = options.xhr;
        } else {
            xhr = getXhr();
            if (!xhr) {
                options.error('Ajax not allowed');
                return xhr;
            }
        }

        if (crossdomain && window.XDomainRequest && !('withCredentials' in xhr)) {
            return new XDomainAjax(url, options);
        }

        if (options.progress && xhr.upload) {
            xhr.upload.addEventListener('progress', function(e){
                if (e.lengthComputable) {
                    options.progress(Math.round((e.loaded * 95) / e.total));
                }
            }, false);
        }

        //Handlers
        var onStateChange = function(){
            if(xhr.readyState == 4 && !finished){
                if (options.progress) {options.progress(100);}
                if (xhr.status >= 200 && xhr.status < 300) {
                    //TODO - look into using xhr.responseType and xhr.response for binary blobs. Not sure what to return
                    var resp = xhr.responseText;
                    if (options.json) {
                        try {
                            resp = fp.json.decode(resp);
                        } catch (e) {
                            onerror.call(xhr, 'Invalid json: '+resp);
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
            //already handled
            if (finished) {return;}

            if (options.progress) {options.progress(100);}

            finished = true;
            if (this.status == 400) {
                error('bad_params', this.status, this);
                return;
            } else if (this.status == 403) {
                error('not_authorized', this.status, this);
                return;
            } else if (this.status == 404) {
                error('not_found', this.status, this);
                return;
            }
            if (crossdomain) {
                if (this.readyState == 4 && this.status === 0) {
                    error('CORS_not_allowed', this.status, this);
                    return;
                } else {
                    error('CORS_error', this.status, this);
                    return;
                }
            }

            //if we're here, we don't know what happened
            error(err, this.status, this);
        };

        xhr.onerror = onerror;

        //Executing the request
        if (data && method == 'GET') {
            url += (url.indexOf('?') !== -1 ? '&' : '?') + data;
            data = null;
        }

        xhr.withCredentials = true;

        xhr.open(method, url, async);
        if (options.json) {
            xhr.setRequestHeader('Accept', 'application/json, text/javascript');
        } else {
            xhr.setRequestHeader('Accept', 'text/javascript, text/html, application/xml, text/xml, */*');
        }

        var contentType = headers['Content-Type'] || headers['content-type'];
        if (data && processData && (method == 'POST' || method == 'PUT') && contentType === undefined) {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
        }

        if (headers) {
            for (var key in headers) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }

        xhr.send(data);

        return xhr;
    };

    //Ajax using XDomainRequest - different enough from normal xhr that we do it separately
    var XDomainAjax = function(url, options) {
        if (!window.XDomainRequest) {return null;}

        var method = options.method ? options.method.toUpperCase() : 'POST';
        var success = options.success || function(){};
        var error = options.error || function(){};
        var data = options.data || {};

        //protocol of the url must match our protocol
        if (window.location.protocol == 'http:') {
            url = url.replace('https:','http:');
        } else if (window.location.protocol == 'https:') {
            url = url.replace('http:','https:');
        }

        /*
        if (options.headers['Content-Type']) {
            //custom content type, so we smush the data into a {data: data}
            data = {'data': data};
            data.mimetype = options.headers['Content-Type'];
        }
        */

        if (options.async) {
            throw new fp.FilepickerException('Asyncronous Cross-domain requests are not supported');
        }

        //Only supports get and post
        if (method !== 'GET' && method !== 'POST') {
            data._method = method;
            method = 'POST';
        }

        if (options.processData !== false) {
            data = data ? toQueryString(data) : null;
        }

        //Executing the request
        if (data && method == 'GET') {
            url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
            data = null;
        }

        //so we know it's an xdr and can handle appropriately
        url += (url.indexOf('?') >= 0 ? '&' : '?') + '_xdr=true&_cacheBust='+fp.util.getId();

        var xdr = new window.XDomainRequest();
        xdr.onload = function() {
            var resp = xdr.responseText;
            if (options.progress) {options.progress(100);}
            if (options.json) {
                try {
                    resp = fp.json.decode(resp);
                } catch (e) {
                    error('Invalid json: ' + resp, 200, xdr);
                    return;
                }
            }
            //assume status == 200, since we can't get it for real
            success(resp, 200, xdr);
        };
        xdr.onerror = function() {
            if (options.progress) {options.progress(100);}
            error(xdr.responseText || 'CORS_error', this.status || 500, this);
        };
        //Must have an onprogress or ie will abort
        xdr.onprogress = function(){};
        xdr.ontimeout = function(){};
        xdr.timeout = 30000;
        //we can't set any headers
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
