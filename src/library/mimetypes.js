'use strict';

filepicker.extend('mimetypes', function(){
    var fp = this;

    /*We have a mimetype map to make up for the fact that browsers
     * don't yet recognize all the mimetypes we need to support*/
    var mimetype_extension_map = {
        '.stl':'application/sla',
        '.hbs':'text/html',
        '.pdf':'application/pdf',
        '.jpg':'image/jpeg',
        '.jpeg':'image/jpeg',
        '.jpe':'image/jpeg',
        '.imp':'application/x-impressionist',
        '.vob': 'video/dvd'
    };

    var mimetype_bad_array = [ 'application/octet-stream',
                                'application/download',
                                'application/force-download',
                                'octet/stream',
                                'application/unknown',
                                'application/x-download',
                                'application/x-msdownload',
                                'application/x-secure-download'];

    var getMimetype = function(file) {
        if (file.type) {
            var type = file.type;
            type = type.toLowerCase();
            var bad_type = false;
            for (var n = 0; n < mimetype_bad_array.length; n++){
                bad_type = bad_type || type === mimetype_bad_array[n];
            }
            if (!bad_type){
                return file.type;
            }
        }
        var filename = file.name || file.fileName;
        var extension = filename.match(/\.\w*$/);
        if (extension) {
            return mimetype_extension_map[extension[0].toLowerCase()] || '';
        } else {
            if (file.type){
                //Might be a bad type, but better then nothing
                return file.type;
            } else {
                return '';
            }
        }
    };

    var matchesMimetype = function(test, against) {
        if (!test) {return against === '*/*';}

        test = fp.util.trim(test).toLowerCase();
        against = fp.util.trim(against).toLowerCase();

        // Firefox has some oddities as it allows the user to overwrite mimetypes.
        // These are some of the silly mimetypes that have no meaning at all
        for (var n = 0; n < mimetype_bad_array.length; n++){
            if (test === mimetype_bad_array[n]){
                return true;
            }
        }

        var test_parts = test.split('/'),
            against_parts = against.split('/');

        //comparing types
        if (against_parts[0] === '*') {return true;}
        if (against_parts[0] !== test_parts[0]) {return false;}
        //comparing subtypes
        if (against_parts[1] === '*') {return true;}
        return against_parts[1] === test_parts[1];
    };

    return {
        getMimetype: getMimetype,
        matchesMimetype: matchesMimetype
    };
});
