'use strict';

filepicker.extend('mimetypes', function(){
    var fp = this;

    /*We have a mimetype map to make up for the fact that browsers
     * don't yet recognize all the mimetypes we need to support*/
    var mimetype_extension_map = {
        '.stl':'application/sla',
        '.hbs':'text/html',
        '.imp':'application/x-impressionist',
        '.obj':'application/octet-stream',
        '.ra':'audio/x-pn-realaudio',
        '.wsdl':'application/xml',
        '.dll':'application/octet-stream',
        '.ras':'image/x-cmu-raster',
        '.ram':'application/x-pn-realaudio',
        '.bcpio':'application/x-bcpio',
        '.sh':'application/x-sh',
        '.m1v':'video/mpeg',
        '.xwd':'image/x-xwindowdump',
        '.doc':'application/msword',
        '.bmp':'image/x-ms-bmp',
        '.shar':'application/x-shar',
        '.js':'application/x-javascript',
        '.src':'application/x-wais-source',
        '.dvi':'application/x-dvi',
        '.aif':'audio/x-aiff',
        '.ksh':'text/plain',
        '.csv':'text/csv',
        '.dot':'application/msword',
        '.mht':'message/rfc822',
        '.p12':'application/x-pkcs12',
        '.css':'text/css',
        '.csh':'application/x-csh',
        '.pwz':'application/vnd.ms-powerpoint',
        '.pdf':'application/pdf',
        '.cdf':'application/x-netcdf',
        '.pl':'text/plain',
        '.ai':'application/postscript',
        '.jpe':'image/jpeg',
        '.jpg':'image/jpeg',
        '.py':'text/x-python',
        '.xml':'text/xml',
        '.jpeg':'image/jpeg',
        '.ps':'application/postscript',
        '.gtar':'application/x-gtar',
        '.xpm':'image/x-xpixmap',
        '.hdf':'application/x-hdf',
        '.nws':'message/rfc822',
        '.tsv':'text/tab-separated-values',
        '.xpdl':'application/xml',
        '.p7c':'application/pkcs7-mime',
        '.eps':'application/postscript',
        '.ief':'image/ief',
        '.so':'application/octet-stream',
        '.xlb':'application/vnd.ms-excel',
        '.pbm':'image/x-portable-bitmap',
        '.texinfo':'application/x-texinfo',
        '.xls':'application/vnd.ms-excel',
        '.tex':'application/x-tex',
        '.rtx':'text/richtext',
        '.rtf':'application/rtf',
        '.html':'text/html',
        '.aiff':'audio/x-aiff',
        '.aifc':'audio/x-aiff',
        '.exe':'application/octet-stream',
        '.sgm':'text/x-sgml',
        '.tif':'image/tiff',
        '.mpeg':'video/mpeg',
        '.ustar':'application/x-ustar',
        '.gif':'image/gif',
        '.ppt':'application/vnd.ms-powerpoint',
        '.pps':'application/vnd.ms-powerpoint',
        '.sgml':'text/x-sgml',
        '.ppm':'image/x-portable-pixmap',
        '.latex':'application/x-latex',
        '.bat':'text/plain',
        '.mov':'video/quicktime',
        '.ppa':'application/vnd.ms-powerpoint',
        '.tr':'application/x-troff',
        '.rdf':'application/xml',
        '.xsl':'application/xml',
        '.eml':'message/rfc822',
        '.nc':'application/x-netcdf',
        '.sv4cpio':'application/x-sv4cpio',
        '.bin':'application/octet-stream',
        '.h':'text/plain',
        '.tcl':'application/x-tcl',
        '.wiz':'application/msword',
        '.o':'application/octet-stream',
        '.a':'application/octet-stream',
        '.c':'text/plain',
        '.wav':'audio/x-wav',
        '.vcf':'text/x-vcard',
        '.xbm':'image/x-xbitmap',
        '.txt':'text/plain',
        '.au':'audio/basic',
        '.t':'application/x-troff',
        '.tiff':'image/tiff',
        '.texi':'application/x-texinfo',
        '.oda':'application/oda',
        '.ms':'application/x-troff-ms',
        '.rgb':'image/x-rgb',
        '.me':'application/x-troff-me',
        '.sv4crc':'application/x-sv4crc',
        '.qt':'video/quicktime',
        '.mpa':'video/mpeg',
        '.mpg':'video/mpeg',
        '.mpe':'video/mpeg',
        '.avi':'video/x-msvideo',
        '.pgm':'image/x-portable-graymap',
        '.pot':'application/vnd.ms-powerpoint',
        '.mif':'application/x-mif',
        '.roff':'application/x-troff',
        '.htm':'text/html',
        '.man':'application/x-troff-man',
        '.etx':'text/x-setext',
        '.zip':'application/zip',
        '.movie':'video/x-sgi-movie',
        '.pyc':'application/x-python-code',
        '.png':'image/png',
        '.pfx':'application/x-pkcs12',
        '.mhtml':'message/rfc822',
        '.tar':'application/x-tar',
        '.pnm':'image/x-portable-anymap',
        '.pyo':'application/x-python-code',
        '.snd':'audio/basic',
        '.cpio':'application/x-cpio',
        '.swf':'application/x-shockwave-flash',
        '.mp3':'audio/mpeg',
        '.mp2':'audio/mpeg',
        '.mp4':'video/mp4',
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
            return getMimetypeByExtension(extension[0]);
        } else {
            if (file.type){
                //Might be a bad type, but better then nothing
                return file.type;
            } else {
                return '';
            }
        }
    };

    var getMimetypeByExtension = function(extension){
        return mimetype_extension_map[extension.toLowerCase()] || '';
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
