//urls.js
'use strict';

filepicker.extend('urls', function(){
    var fp = this;

    var base = 'https://www.filepicker.io';
    if (window.filepicker.hostname) {
        base = window.filepicker.hostname;
    }
    var dialog_base = base.replace('www', 'dialog'),
        pick_url = dialog_base + '/dialog/open/',
        export_url = dialog_base + '/dialog/save/',
        convert_url = dialog_base + '/dialog/process/',
        pick_folder_url = dialog_base + '/dialog/folder/',
        store_url = base + '/api/store/';

    var allowedConversions = ['crop', 'rotate', 'filter'];

    var constructPickUrl = function(options, id, multiple) {
        return pick_url+ constructModalQuery(options, id)+
            (multiple ? '&multi='+!!multiple : '')+
            (options.mimetypes !== undefined ? '&m='+options.mimetypes.join(',') : '')+
            (options.extensions !== undefined ? '&ext='+options.extensions.join(',') : '')+
            (options.maxSize ? '&maxSize='+options.maxSize: '')+
            (options.maxFiles ? '&maxFiles='+options.maxFiles: '')+
            (options.folders !== undefined ? '&folders='+options.folders : '')+
            (options.storeLocation ? '&storeLocation='+options.storeLocation : '')+
            (options.storePath ? '&storePath='+options.storePath : '')+
            (options.storeContainer ? '&storeContainer='+options.storeContainer : '')+
            (options.storeAccess ? '&storeAccess='+options.storeAccess : '')+
            (options.webcamDim ? '&wdim='+options.webcamDim.join(',') : '')+
            constructConversionsQuery(options.conversions);
    };

    var constructConvertUrl = function(options, id) {
        var url = options.convertUrl;
        if (url.indexOf('&') >= 0 || url.indexOf('?') >= 0) {
            url = encodeURIComponent(url);
        }
        return convert_url+ constructModalQuery(options, id)+
        '&curl='+url+
        constructConversionsQuery(options.conversions);
    };



    var constructPickFolderUrl = function(options, id) {
        return pick_folder_url + constructModalQuery(options, id);
    };

    var constructExportUrl = function(url, options, id) {
        if (url.indexOf('&') >= 0 || url.indexOf('?') >= 0) {
            url = encodeURIComponent(url);
        }
        return export_url+ constructModalQuery(options, id)+
            '&url='+url+
            (options.mimetype !== undefined ? '&m='+options.mimetype : '')+
            (options.extension !== undefined ? '&ext='+options.extension : '')+
            (options.suggestedFilename ? '&defaultSaveasName='+options.suggestedFilename : '');
    };

    var constructStoreUrl = function(options) {
        return store_url + options.location +
            '?key='+fp.apikey+
            (options.base64decode ? '&base64decode=true' : '')+
            (options.mimetype ? '&mimetype='+options.mimetype : '')+
            (options.filename ? '&filename='+encodeURIComponent(options.filename) : '')+
            (options.path ? '&path='+options.path : '')+
            (options.container ? '&container='+options.container : '')+
            (options.access ? '&access='+options.access : '')+
            constructSecurityQuery(options)+
            '&plugin='+getPlugin();
    };

    var constructWriteUrl = function(fp_url, options) {
        //to make sure that fp_url already has a ?
        return fp_url +
            '?nonce=fp'+
            (!!options.base64decode ? '&base64decode=true' : '')+
            (options.mimetype ? '&mimetype='+options.mimetype : '')+
            constructSecurityQuery(options)+
            '&plugin='+getPlugin();
    };

    var constructHostCommFallback = function(){
        var parts = fp.util.parseUrl(window.location.href);
        return parts.origin+'/404';
    };

    function constructModalQuery(options, id) {
        return '?key='+fp.apikey+
            '&id='+id+
            '&referrer='+window.location.hostname+
            '&iframe='+(options.container !== 'window')+
            '&version='+fp.API_VERSION+
            (options.services ? '&s='+options.services.join(',') : '')+
            (options.container !== undefined ? '&container='+ options.container : 'modal')+
            (options.openTo ? '&loc='+options.openTo : '')+
            '&language='+(options.language || fp.browser.getLanguage())+
            (options.mobile !== undefined ? '&mobile='+options.mobile : '')+
            // v2
            (options.backgroundUpload !== undefined ? '&bu='+options.backgroundUpload : '')+
            (options.cropRatio ? '&cratio='+options.cropRatio : '')+
            (options.cropDim ? '&cdim='+options.cropDim.join(',') : '')+
            (options.cropMax ? '&cmax='+options.cropMax.join(',') : '')+
            (options.cropMin ? '&cmin='+options.cropMin.join(',') : '')+
            (options.cropForce !== undefined ? '&cforce='+options.cropForce : '')+
            (options.hide !== undefined ? '&hide='+options.hide : '')+
            (options.customCss ? '&css='+encodeURIComponent(options.customCss) : '')+
            (options.customText ? '&text='+encodeURIComponent(options.customText) : '')+
            (options.imageMin ? '&imin='+options.imageMin.join(',') : '')+
            (options.imageMax ? '&imax='+options.imageMax.join(',') : '')+
            (options.imageDim ? '&idim='+options.imageDim.join(',') : '')+
            (options.imageQuality ? '&iq='+options.imageQuality : '')+
            (fp.util.isCanvasSupported() ? '' : '&canvas=false')+
            (options.redirectUrl ? '&redirect_url='+options.redirectUrl : '')+
            /*
                prevent from showing close button twice
            */
            ((options.showClose && options.container !== 'modal') ? '&showClose='+options.showClose : '')+
            constructSecurityQuery(options)+
            '&plugin='+getPlugin();
    }

    function constructSecurityQuery(options) {
        return (options.signature ? '&signature='+options.signature : '')+
            (options.policy ? '&policy='+options.policy : '');
    }

    function getPlugin(){
        return filepicker.plugin || 'js_lib';
    }


    function constructConversionsQuery(conversions){
        conversions = conversions || [];
        var allowed = [], 
            i , 
            j;

        /*
            Use for in loop. 
            Array.filter && Array.indexOf not supported in IE8
        */

        for (i in conversions) {
            for (j in allowedConversions) {
                if (conversions[i] === allowedConversions[j] && conversions.hasOwnProperty(i)) {
                    allowed.push(conversions[i]);
                }
            }
        }
        
        /*
            Only crop by default
        */
        if (!allowed.length) {
            allowed.push('crop');
        }
        return '&co='+allowed.join(',');
    }


    return {
        BASE: base,
        DIALOG_BASE: dialog_base,
        API_COMM: base + '/dialog/comm_iframe/',
        COMM: dialog_base + '/dialog/comm_iframe/',
        FP_COMM_FALLBACK: dialog_base + '/dialog/comm_hash_iframe/',
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