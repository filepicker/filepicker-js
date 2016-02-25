//lib.js
'use strict';

filepicker.extend(function(){
    var fp = this,
        VERSION = '2.4.5';
    fp.API_VERSION = 'v2';

    var setKey = function(key) {
        fp.apikey = key;
    };

    var FilepickerException = function(text){
        this.text = text;
        this.toString = function(){return 'FilepickerException: '+this.text;};
        return this;
    };
    //Telling router how to call us
    FilepickerException.isClass = true;

    /**
     * Pops open the filepicker.io picker dialog to select a single file.
     * Arguments:
     * options: @Object. Optional. Key-value pairs to tweak how the dialog looks and behaves. Valid options:
     *   service: @ServiceEnum: the service to pick from
     *   services: @Array[@ServiceEnum]: the services to pick from
     *   openTo: @ServiceEnum: the service to start on
     *   container: @String: either 'window', 'modal', or the id of the iframe to open in
     *   mimetype: @String: only allow picking files of the specified mimetype
     *   mimetypes: @Array[@String]: only allow picking files of the specified mimetypes
     *   extension: @String: only allow picking files of the specified extension
     *   extensions: @Array[@String]: only allow picking files of the specified extensions
     *   maxSize: @Number: only allow picking files below the specified size
     *   debug: @Boolean: If true, returns immediately with dummy data
     *   language: @String: Language code, all avaliable codes are listed in docs
     *   hide: @Boolean: If set to true dialog will be hiddne when user click 'upload' button. Default to false.
     *   custom_css: @String: Url for custom css
     * onSuccess: @Function(@FPFile). Function called when a file is picked successfully
     * onError: @Function(@FPError). Function called when there is an error picking a file. Errors:
     *   101: The user closed the picker without choosing a file
     *   102: Unknown error in picking file
     * onProgress: @Function(@Object). Function called when there is progress event
     */
    var pick = function(options, onSuccess, onError, onProgress) {
        fp.util.checkApiKey();

        if (typeof options === 'function') {
            //Shift left
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;

        return fp.picker.createPicker(options, onSuccess, onError, false, false, onProgress);
    };

    /**
     * Pops open the filepicker.io picker dialog to select multiple files.
     * Arguments:
     * options: @Object. Optional. Key-value pairs to tweak how the dialog looks and behaves. Valid options:
     *   service: @ServiceEnum: the service to pick from
     *   services: @Array[@ServiceEnum]: the services to pick from
     *   openTo: @ServiceEnum: the service to start on
     *   container: @String: either 'window', 'modal', or the id of the iframe to open in
     *   mimetype: @String: only allow picking files of the specified mimetype
     *   mimetypes: @Array[@String]: only allow picking files of the specified mimetypes
     *   extension: @String: only allow picking files of the specified extension
     *   extensions: @Array[@String]: only allow picking files of the specified extensions
     *   maxSize: @Number: only allow picking files below the specified size
     *   maxFiles: @Number: only allowing picking a max of N files at a time
     *   folders: @Boolean: allow entire folders to be uploaded
     *   debug: @Boolean: If true, returns immediately with dummy data
     *   language: @String: Language code, all avaliable codes are listed in docs
     *   backgroundUpload: @Boolean: If set to true uploading will start immedialty after user add file. Default to true
     *   hide: @Boolean: If set to true dialog will be hiddne when user click 'upload' button. Default to false.
     *   custom_css: @String: Url for custom css
     * onSuccess: @Function(@Array[@FPFile]). Function called when one or more files is picked successfully
     * onError: @Function(@FPError). Function called when there is an error picking files. Errors:
     *   101: The user closed the picker without choosing any file
     *   102: Unknown error in picking file
     * onProgress: @Function(@Object). Function called when there is progress event
     */
    var pickMultiple = function(options, onSuccess, onError, onProgress) {
        fp.util.checkApiKey();

        if (typeof options === 'function') {
            //Shift left
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;

        return fp.picker.createPicker(options, onSuccess, onError, true, false, onProgress);
    };

    /**
     * Pops open the filepicker.io picker dialog to select files and store them.
     * Arguments:
     * picker_options: @Object. Key-value pairs to tweak how the dialog looks and behaves. Valid options:
     *   multiple: @Boolean: whether to allow multiple files
     *   service: @ServiceEnum: the service to pick from
     *   services: @Array[@ServiceEnum]: the services to pick from
     *   openTo: @ServiceEnum: the service to start on
     *   container: @String: either 'window', 'modal', or the id of the iframe to open in
     *   mimetype: @String: only allow picking files of the specified mimetype
     *   mimetypes: @Array[@String]: only allow picking files of the specified mimetypes
     *   extension: @String: only allow picking files of the specified extension
     *   extensions: @Array[@String]: only allow picking files of the specified extensions
     *   maxSize: @Number: only allow picking files below the specified size
     *   debug: @Boolean: If true, returns immediately with dummy data
     *   language: @String: Language code, all avaliable codes are listed in docs
     *   backgroundUpload: @Boolean: If set to true uploading will start immedialty after user add file. Default to true
     *   hide: @Boolean: If set to true dialog will be hiddne when user click 'upload' button. Default to false.
     *   custom_css: @String: Url for custom css
     * store_options: @Object. Key-value pairs to tweak how the file is stored. Valid options:
     *   location: @LocationEnum: the location to store the data in.
     *   path: @String: the path to store the data in.
     *   container: @String: the container to store the data in.
     * onSuccess: @Function(@Array[@FPFile]). Function called when one or more files is picked successfully
     * onError: @Function(@FPError). Function called when there is an error picking files. Errors:
     *   101: The user closed the picker without choosing any file
     *   102: Unknown error in picking file
     *   151: The content store cannot be reached
     * onProgress: @Function(@Object). Function called when there is progress event
     */
    var pickAndStore = function(picker_options, store_options, onSuccess, onError, onProgress) {
        fp.util.checkApiKey();
        if (!picker_options || !store_options ||
                typeof picker_options === 'function' || typeof picker_options === 'function') {
            throw new fp.FilepickerException('Not all required parameters given, missing picker or store options');
        }

        onError = onError || fp.errors.handleError;

        var multiple = !!(picker_options.multiple);
        //copying over options so as to not mutate them
        var options = !!picker_options ? fp.util.clone(picker_options) : {};

        options.storeLocation = store_options.location || 'S3';
        options.storePath = store_options.path;
        options.storeContainer = store_options.storeContainer || store_options.container;
        options.storeRegion = store_options.storeRegion;
        options.storeAccess = store_options.access || 'private';

        //If multiple, path must end in /
        if (multiple && options.storePath) {
            if (options.storePath.charAt(options.storePath.length - 1) !== '/') {
                throw new fp.FilepickerException('pickAndStore with multiple files requires a path that ends in '/'');
            }
        }

        //to have a consistent array
        var success = onSuccess;
        if (!multiple) {
            success = function(resp){onSuccess([resp]);};
        }

        return fp.picker.createPicker(options, success, onError, multiple, false, onProgress);
    };

    /**
     * Pops open the filepicker.io picker dialog to select a single folder.
     * Arguments:
     * options: @Object. Optional. Key-value pairs to tweak how the dialog looks and behaves. Valid options:
     *   service: @ServiceEnum: the service to pick from
     *   services: @Array[@ServiceEnum]: the services to pick from
     *   openTo: @ServiceEnum: the service to start on
     *   container: @String: either 'window', 'modal', or the id of the iframe to open in
     * onSuccess: @Function(@FPFile). Function called when a folder is picked successfully
     * onError: @Function(@FPError). Function called when there is an error picking a folder. Errors:
     *   101: The user closed the picker without choosing a folder
     *   102: Unknown error in picking folder
     */
    var pickFolder = function(options, onSuccess, onError, onProgress) {
        fp.util.checkApiKey();

        if (typeof options === 'function') {
            //Shift left
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;

        return fp.picker.createPicker(options, onSuccess, onError, false, true, onProgress);
    };

    /**
     * Reads the contents of the inputted url, file input type, DOM file, or fpfile
     * Arguments:
     * input: @FPFile|@URL|@File|@Input<type=file>: The object to read from.
     * options: @Object. Optional. Key-value pairs to determine how to read the object. Valid options:
     *   base64encode: @Boolean. Default False. Whether the data should be converted to base64
     *   asText: @Boolean. Default False. Whether the data should be converted to text or left as binary
     *   cache: @Boolean. Default False. Whether the data should be pulled from the browser's cache if possible
     * onSuccess: @Function(@String). Function called when the data is read successfully
     * onError: @Function(@FPError). Function called when there is an error reading the file. Errors:
     *   111: Your browser doesn't support reading from DOM File objects
     *   112: Your browser doesn't support reading from different domains
     *   113: The website of the URL you provided does not allow other domains to read data
     *   114: The website of the URL you provided had an error
     *   115: File not found
     *   118: General read error
     * onProgress: @Function(Number). Function called on progress events
     */
    var read = function(input, options, onSuccess, onError, onProgress){
        fp.util.checkApiKey();
        if (!input) {
            throw new fp.FilepickerException('No input given - nothing to read!');
        }

        if (typeof options === 'function') {
            //Shift left
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function(){};
        if (typeof input === 'string') {
            if (fp.util.isFPUrl(input)) {
                fp.files.readFromFPUrl(input, options, onSuccess, onError, onProgress);
             } else {
                fp.files.readFromUrl(input, options, onSuccess, onError, onProgress);
             }
        } else if (fp.util.isFileInputElement(input)) {
            if (!input.files) {
                storeThenRead(input, options, onSuccess, onError, onProgress);
            } else if (input.files.length === 0) {
                onError(new fp.errors.FPError(115));
            } else {
                fp.files.readFromFile(input.files[0], options, onSuccess, onError, onProgress);
            }
        } else if (fp.util.isFile(input)) {
            fp.files.readFromFile(input, options, onSuccess, onError, onProgress);
        } else if (input.url) {
            //FPFile
            fp.files.readFromFPUrl(input.url, options, onSuccess, onError, onProgress);
        } else {
            throw new fp.FilepickerException('Cannot read given input: '+input+'. Not a url, file input, DOM File, or FPFile object.');
        }
    };

    //Never surrender!
    var storeThenRead = function(input, readOptions, onSuccess, onError, onProgress) {
        onProgress(10);
        fp.store(input, function(fpfile){
            onProgress(50);
            fp.read(fpfile, readOptions, onSuccess, onError, function(progress){onProgress(50+progress/2);});
        }, onError);
    };

    /**
     * Writes the contents of the inputted data, file input type, DOM file, or fpfile to the given fpfile
     * Arguments:
     * fpfile: @FPFile|@FPUrl: The object to write to.
     * input: @Data|@FPFile|@File|@Input<type=file>: The object to read from.
     * options: @Object. Optional. Key-value pairs to determine how to read the object. Valid options:
     *   base64decode: @Boolean. Default False. Whether the data to write should be converted from base64
     * onSuccess: @Function(@FPFile). Function called when the data is read successfully
     * onError: @Function(@FPError). Function called when there is an error reading the file. Errors:
     *   111: Your browser doesn't support reading from DOM File objects
     *   115: Input file not found
     *   118: General read error
     *   121: The fpfile provided could not be found
     * onProgress: @Function(Number). Function called on progress events
     */
    var write = function(fpfile, input, options, onSuccess, onError, onProgress){
        fp.util.checkApiKey();
        if (!fpfile) {
            throw new fp.FilepickerException('No fpfile given - nothing to write to!');
        }
        if (input === undefined || input === null) {
            throw new fp.FilepickerException('No input given - nothing to write!');
        }

        if (typeof options === 'function') {
            //Shift left
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function(){};

        var fp_url;
        if (fp.util.isFPUrl(fp.util.getFPUrl(fpfile))) {
            fp_url = fpfile;
        } else if (fpfile.url) {
            fp_url = fpfile.url;
        } else {
            throw new fp.FilepickerException('Invalid file to write to: '+fpfile+'. Not a filepicker url or FPFile object.');
        }
        fp_url = fp.util.trimConvert(fp.util.getFPUrl(fp_url));

        if (typeof input === 'string') {
            fp.files.writeDataToFPUrl(fp_url, input, options, onSuccess, onError, onProgress);
        } else {
            if (fp.util.isFileInputElement(input)) {
                if (!input.files) {
                    fp.files.writeFileInputToFPUrl(fp_url, input, options, onSuccess, onError, onProgress);
                } else if (input.files.length === 0) {
                    onError(new fp.errors.FPError(115));
                } else {
                    fp.files.writeFileToFPUrl(fp_url, input.files[0], options, onSuccess, onError, onProgress);
                }
            } else if (fp.util.isFile(input)) {
                fp.files.writeFileToFPUrl(fp_url, input, options, onSuccess, onError, onProgress);
            } else if (input.url) {
                fp.files.writeUrlToFPUrl(fp_url, input.url, options, onSuccess, onError, onProgress);
            } else {
                throw new fp.FilepickerException('Cannot read from given input: '+input+'. Not a string, file input, DOM File, or FPFile object.');
            }
        }
    };

    /**
     * Writes the contents of the inputted url to the given fpfile
     * Arguments:
     * fpfile: @FPFile|@FPUrl: The object to write to.
     * input: @URL: The url to read from.
     * options: @Object. Optional. Key-value pairs to determine how to read the object. Valid options:
     *   base64decode: @Boolean. Default False. Whether the data to write should be converted from base64
     * onSuccess: @Function(@String). Function called when the data is read successfully
     * onError: @Function(@FPError). Function called when there is an error reading the file. Errors:
     *   121: The fpfile provided could not be found
     *   122: The remote server had an error
     * onProgress: @Function(Number). Function called on progress events
     */
    var writeUrl = function(fpfile, input, options, onSuccess, onError, onProgress){
        fp.util.checkApiKey();
        if (!fpfile) {
            throw new fp.FilepickerException('No fpfile given - nothing to write to!');
        }
        if (input === undefined || input === null) {
            throw new fp.FilepickerException('No input given - nothing to write!');
        }

        if (typeof options === 'function') {
            //Shift left
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function(){};

        var fp_url;
        if (fp.util.isFPUrl(fp.util.getFPUrl(fpfile))) {
            fp_url = fpfile;
        } else if (fpfile.url) {
            fp_url = fpfile.url;
        } else {
            throw new fp.FilepickerException('Invalid file to write to: '+fpfile+'. Not a filepicker url or FPFile object.');
        }
        fp_url = fp.util.getFPUrl(fp_url);

        fp.files.writeUrlToFPUrl(fp.util.trimConvert(fp_url), input, options, onSuccess, onError, onProgress);
    };

    /**
     * Pops open the filepicker.io picker dialog to export a single file.
     * Arguments:
     * input: @FPFile|@URL: The url of the object to read from.
     * options: @Object. Optional. Key-value pairs to tweak how the dialog looks and behaves. Valid options:
     *   service: @ServiceEnum: the service to allow the user to export to
     *   services: @Array[@ServiceEnum]: the services to allow the user to export to
     *   openTo: @ServiceEnum: the service to start on
     *   container: @String: either 'window', 'modal', or the id of the iframe to open in
     *   mimetype: @String: The mimetype of the file to export
     *   extension: @String: The extension of the file to export
     *   suggestedFilename: @String: The suggested filename to use
     *   debug: @Boolean: If true, returns immediately with dummy data
     * onSuccess: @Function(@FPFile). Function called when a file is exported successfully
     * onError: @Function(@FPError). Function called when there is an error exporting a file. Errors:
     *   131: The user closed the exporter without saving a file
     *   132: Error in exporting
     */
    var exportFn = function(input, options, onSuccess, onError) {
        fp.util.checkApiKey();

        if (typeof options === 'function') {
            //Shift left
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = !!options ? fp.util.clone(options) : {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;

        var fp_url;
        if (typeof input === 'string' && fp.util.isUrl(input)) {
            fp_url = input;
        } else if (input.url) {
            fp_url = input.url;
            //make use of what we know
            if (!options.mimetype && !options.extension) {
                options.mimetype = input.mimetype;
            }
            if (!options.suggestedFilename) {
                options.suggestedFilename = input.filename;
            }
        } else {
            throw new fp.FilepickerException('Invalid file to export: '+input+'. Not a valid url or FPFile object. You may want to use filepicker.store() to get an FPFile to export');
        }

        if (options.suggestedFilename) {
            options.suggestedFilename = encodeURI(options.suggestedFilename);
        }
        return fp.exporter.createExporter(fp_url, options, onSuccess, onError);
    };


    var processImage = function(input, options, onSuccess, onError, onProgress) {
        var convertUrl;
        fp.util.checkApiKey();

        if (typeof options === 'function') {
            //Shift left
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;

        if (typeof input === 'string') {
            convertUrl = input;
        } else if (input.url) {
            convertUrl = input.url;
            //make use of what we know
            if (!options.filename) {
                options.filename = input.filename;
            }
        } else {
            throw new fp.FilepickerException('Invalid file to convert: '+input+'. Not a valid url or FPFile object or not filepicker url. You can convert only filepicker url images.');
        }

        options.convertUrl = convertUrl;
        options.multiple = false;
        options.services = ['CONVERT', 'COMPUTER'];
        options.backgroundUpload = true;
        options.hide = false;

        return fp.picker.createPicker(options, onSuccess, onError, false, false, onProgress, true);
    };

    /**
     * Stores the inputted file or data
     * Arguments:
     * input: @FPFile|@Data|@File|@Input<type=file>: The object to store.
     * options: @Object. Optional. Key-value pairs to tweak how the file is stored. Valid options:
     *   base64decode: @Boolean: whether the data should be base64decoded before storing
     *   location: @LocationEnum: the location to store the data in.
     *   path: @String: the path to save the file at in the data store
     *   container: @String: the container to save the file at in the data store
     *   filename: @String: the name of the file to save
     * onSuccess: @Function(@FPFile). Function called when a file is stored successfully
     * onError: @Function(@FPError). Function called when there is an error storing a file. Errors:
     *   151: The content store cannot be reached
     * onProgress: @Function(Number). Function called on progress events
     */
    var store = function(input, options, onSuccess, onError, onProgress) {
        fp.util.checkApiKey();

        if (typeof options === 'function') {
            //Shift left
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = !!options ? fp.util.clone(options) : {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function(){};

        if (typeof input === 'string') {
            fp.files.storeData(input, options, onSuccess, onError, onProgress);
        } else {
            if (fp.util.isFileInputElement(input)) {
                if (!input.files) {
                    fp.files.storeFileInput(input, options, onSuccess, onError, onProgress);
                } else if (input.files.length === 0) {
                    onError(new fp.errors.FPError(115));
                } else {
                    fp.files.storeFile(input.files[0], options, onSuccess, onError, onProgress);
                }
            } else if (fp.util.isFile(input)) {
                fp.files.storeFile(input, options, onSuccess, onError, onProgress);
            } else if (input.url) {
                //Guess filename if needed
                if (!options.filename) {
                    options.filename = input.filename;
                }
                fp.files.storeUrl(input.url, options, onSuccess, onError, onProgress);
            } else {
                throw new fp.FilepickerException('Cannot store given input: '+input+'. Not a string, file input, DOM File, or FPFile object.');
            }
        }
    };

    /**
     * Stores the inputed url
     * Arguments:
     * input: @URL: The url to store.
     * options: @Object. Optional. Key-value pairs to tweak how the file is stored. Valid options:
     *   base64decode: @Boolean: whether the data should be base64decoded before storing
     *   location: @LocationEnum: the location to store the data in.
     *   path: @String: the path to save the file at in the data store
     *   container: @String: the container to save the file at in the data store
     *   filename: @String: the name of the file to save
     * onSuccess: @Function(@FPFile). Function called when a file is stored successfully
     * onError: @Function(@FPError). Function called when there is an error storing a file. Errors:
     *   151: The content store cannot be reached
     * onProgress: @Function(Number). Function called on progress events
     */
    var storeUrl = function(input, options, onSuccess, onError, onProgress) {
        fp.util.checkApiKey();

        if (typeof options === 'function') {
            //Shift left
            onProgress = onError;
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function(){};

        fp.files.storeUrl(input, options, onSuccess, onError, onProgress);
    };


    /**
     * Gets metadata about the given fpfile
     * Arguments:
     * input: @FPFile: The fpfile to get metadata about.
     * options: @Object. Optional. Key-value pairs about what values to return. By default gives what info is easily available
     *    size: @Number: size of the file
     *    mimetype: @String: mimetype of the file
     *    filename: @String: given name of the file
     *    width: @Number: for images, the width of the image
     *    height: @Number: for images, the height of the image
     *    uploaded: @Date: when the file was uploaded to filepicker, in UTC
     *    writeable: @Boolean: whether the file is writeable
     * onSuccess: @Function(@Dict). Function called when the data is returned
     * onError: @Function(@FPError). Function called when there is an error fetching metadata for the a file. Errors:
     *   161: The file cannot be found
     *   162: Error fetching metadata
     */
    var stat = function(fpfile, options, onSuccess, onError) {
        fp.util.checkApiKey();

        if (typeof options === 'function') {
            //Shift left
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;

        var fp_url;
        if (fp.util.isFPUrl(fp.util.getFPUrl(fpfile))) {
            fp_url = fpfile;
        } else if (fpfile.url) {
            fp_url = fpfile.url;
        } else {
            throw new fp.FilepickerException('Invalid file to get metadata for: '+fpfile+'. Not a filepicker url or FPFile object.');
        }
        fp_url = fp.util.getFPUrl(fp_url);
        fp.files.stat(fp.util.trimConvert(fp_url), options, onSuccess, onError);
    };

    /**
     * Removes the given file
     * Arguments:
     * input: @FPFile: The fpfile to remove
     * options: @Object. Optional. Key-value pairs about how to remove the file. No values yet.
     * onSuccess: @Function(). Function called when the remove is successful
     * onError: @Function(@FPError). Function called when there is an error removing the file. Errors:
     *   171: The file cannot be found, and may have already been deleted
     *   172: The underlying content store cannot be reached
     */
    var remove = function(fpfile, options, onSuccess, onError) {
        fp.util.checkApiKey();

        if (typeof options === 'function') {
            //Shift left
            onError = onSuccess;
            onSuccess = options;
            options = {};
        }

        options = options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;

        var fp_url;
        if (fp.util.isFPUrl(fp.util.getFPUrl(fpfile))) {
            fp_url = fpfile;
        } else if (fpfile.url) {
            fp_url = fpfile.url;
        } else {
            throw new fp.FilepickerException('Invalid file to remove: '+fpfile+'. Not a filepicker url or FPFile object.');
        }
        fp_url = fp.util.getFPUrl(fp_url);
        fp.files.remove(fp.util.trimConvert(fp_url), options, onSuccess, onError);
    };

    /**
     * Creates a converted version of the inputted fpfile. Only works with images currently.
     * Arguments:
     * input: @FPFile: The fpfile to convert
     * conversion_options: @Object. Key-value pairs about how to convert the file.
     *    width: @Number: width to resize to.
     *    height: @Number: height to resize to.
     *    fit: @String: how to fit the resize. Values: 'crop', 'clip', 'scale', 'max'. Default: 'clip'
     *    align: @String: how to align the fit. Values: 'top', 'bottom', 'left', 'right', 'faces'. Default: center
     *    crop: [@Number,@Number,@Number,@Number] ||@String: crop the image to the specified rectangle
     *    format: @String: convert to the specified format. Values: 'jpg', 'png'
     *    quality: @Number: quality of the jpeg conversion, between 1-100
     *    watermark: @URL: url to use as a watermark
     *    watermark_size: @Number: scale the watermark to the given size as a % of the base image
     *    watermark_position: @String: align the watermark to the given position. Values are 'top','middle','bottom','left','center','right', or a combination thereof
     * store_options: @Object. Optional. Key-value pairs to tweak how the file is stored. Valid options:
     *   location: @LocationEnum: the location to store the data in.
     * onSuccess: @Function(@FPFile). Function called when the conversion is successful. Passes in the new FPFile
     * onError: @Function(@FPError). Function called when there is an error removing the file. Errors:
     *   141: The file cannot be found.
     *   142: The file cannot be converted with the specified parameters.
     *   143: Unknown error when converting the file.
     * onProgress: @Function(Number). Function called on progress events
     */
    var convert = function(fpfile, convert_options, store_options, onSuccess, onError, onProgress) {
        fp.util.checkApiKey();
        if (!fpfile) {
            throw new fp.FilepickerException('No fpfile given - nothing to convert!');
        }

        if (typeof store_options === 'function') {
            //Shift left
            onProgress = onError;
            onError = onSuccess;
            onSuccess = store_options;
            store_options = {};
        }

        var options = !!convert_options ? fp.util.clone(convert_options) : {};
        store_options = store_options || {};
        onSuccess = onSuccess || function(){};
        onError = onError || fp.errors.handleError;
        onProgress = onProgress || function(){};

        if (store_options.location) {
            options.storeLocation = store_options.location;
        }
        if (store_options.path) {
            options.storePath = store_options.path;
        }
        if (store_options.container) {
            options.storeContainer = store_options.container;
        }
        options.storeAccess = store_options.access || 'private';

        var fp_url;
        if (fp.util.isFPUrl(fp.util.getFPUrl(fpfile))) {
            fp_url = fpfile;
        } else if (fpfile.url) {
            fp_url = fpfile.url;

            if (!fp.mimetypes.matchesMimetype(fpfile.mimetype, 'image/*') && !fp.mimetypes.matchesMimetype(fpfile.mimetype, 'application/pdf')) {
                onError(new fp.errors.FPError(142));
                return;
            }
        } else {
            throw new fp.FilepickerException('Invalid file to convert: '+fpfile+'. Not a filepicker url or FPFile object.');
        }
        fp_url = fp.util.getFPUrl(fp_url);

        if (fp_url.indexOf('/convert') > -1) {
            var restConvertOptions = fp.util.parseUrl(fp_url).params;
            restConvertOptions = fp.conversions.mapRestParams(restConvertOptions);
            if (restConvertOptions.crop) {
                // set crop_first to true only if undefineed
                fp.util.setDefault(restConvertOptions, 'crop_first', true);
            }

            // join options and rest options
            for (var attr in restConvertOptions) {
                // options has higher importance
                fp.util.setDefault(options, attr, restConvertOptions[attr]);
            }
        }
        fp.conversions.convert(fp.util.trimConvert(fp_url), options, onSuccess, onError, onProgress);
    };

    //Have to alias because of module loading ordering
    var constructWidget = function(base) {
        return fp.widgets.constructWidget(base);
    };

    var makeDropPane = function(div, options) {
        return fp.dragdrop.makeDropPane(div, options);
    };

    var setResponsiveOptions = function(options){
        return fp.responsiveImages.setResponsiveOptions(options);
    };

    var responsive = function(){
        fp.responsiveImages.update.apply(null, arguments);
    };

    return {
        setKey: setKey,
        setResponsiveOptions: setResponsiveOptions,
        pick: pick,
        pickFolder: pickFolder,
        pickMultiple: pickMultiple,
        pickAndStore: pickAndStore,
        read: read,
        write: write,
        writeUrl: writeUrl,
        'export': exportFn,
        exportFile: exportFn,
        processImage: processImage,
        store: store,
        storeUrl: storeUrl,
        stat: stat,
        metadata: stat,
        remove: remove,
        convert: convert,
        constructWidget: constructWidget,
        makeDropPane: makeDropPane,
        FilepickerException: FilepickerException,
        responsive: responsive,
        version: VERSION
    };
}, true);
