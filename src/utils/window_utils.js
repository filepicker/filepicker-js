'use strict';
// responsive_images.js
filepicker.extend('windowUtils', function(){

    return {
        getWidth:getWidth,
        getHeight:getHeight
    };

    /**
        * Get the window width.
        * @returns {number}
    */
    function getWidth() {
        return document.documentElement.clientWidth || (document.body && document.body.clientWidth) || 1024;
    }


    /**
        * Get the window height.
        * @returns {number}
    */
    function getHeight() {
        return document.documentElement.clientHeight || (document.body && document.body.clientHeight) || 768;
    }

});
