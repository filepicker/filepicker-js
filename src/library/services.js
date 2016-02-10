'use strict';

filepicker.extend('services', function(){
    /**
     * @ServiceEnum: the services we support
     * Don't use 0 as it might be confused with false
     */
    return {
        COMPUTER: 1,
        DROPBOX: 2,
        FACEBOOK: 3,
        GITHUB: 4,
        GMAIL: 5,
        IMAGE_SEARCH: 6,
        URL: 7,
        WEBCAM: 8,
        GOOGLE_DRIVE: 9,
        SEND_EMAIL: 10,
        INSTAGRAM: 11,
        FLICKR: 12,
        VIDEO: 13,
        EVERNOTE: 14,
        PICASA: 15,
        WEBDAV: 16,
        FTP: 17,
        ALFRESCO: 18,
        BOX: 19,
        SKYDRIVE: 20,
        GDRIVE: 21,
        CUSTOMSOURCE: 22,
        CLOUDDRIVE: 23,
        GENERIC: 24,
        CONVERT: 25,
        AUDIO: 26
    };
}, true);
