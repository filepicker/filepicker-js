//conversions.js
'use strict';

filepicker.extend('conversions', function(){
    var fp = this;

    var valid_parameters = {
        align:'string',
        blurAmount:'number',
        crop:'string or array',
        crop_first:'boolean',
        compress:'boolean',
        exif:'string or boolean',
        filter:'string',
        fit:'string',
        format:'string',
        height:'number',
        policy:'string',
        quality:'number',
        page:'number',
        rotate:'string or number',
        secure:'boolean',
        sharpenAmount:'number',
        signature:'string',
        storeAccess:'string',
        storeContainer:'string',
        storeRegion:'string',
        storeLocation:'string',
        storePath:'string',
        text:'string',
        cloudinaryUploadPreset: 'string',
        text_align:'string',
        text_color:'string',
        text_font:'string',
        text_padding:'number',
        text_size:'number',
        watermark:'string',
        watermark_position:'string',
        watermark_size:'number',
        width:'number'
    };

    // Only for params that differ
    var rest_map = {
        w: 'width',
        h: 'height'
    };

    var mapRestParams = function(options){
        var obj = {};
        for (var key in options) {
            obj[rest_map[key] || key] = options[key];
            // need to convert string to number
            if (valid_parameters[rest_map[key] || key] === 'number') {
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
                        throw new fp.FilepickerException('Conversion parameter '+key+' is not the right type: '+options[key]+'. Should be a '+valid_parameters[test]);
                    }
                }
            }
            if (!found) {
                throw new fp.FilepickerException('Conversion parameter '+key+' is not a valid parameter.');
            }
        }
    };

    var convert = function(fp_url, options, onSuccess, onError, onProgress){
        checkParameters(options);

        if (options.crop && fp.util.isArray(options.crop)) {
            options.crop = options.crop.join(',');
        }
        fp.ajax.post(fp_url+'/convert', {
            data: options,
            json: true,
            success: function(fpfile) {
                onSuccess(fp.util.standardizeFPFile(fpfile));
            },
            error: function(msg, status, xhr) {
                if (msg === 'not_found') {
                    onError(new fp.errors.FPError(141));
                } else if (msg === 'bad_params') {
                    onError(new fp.errors.FPError(142));
                } else if (msg === 'not_authorized') {
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
