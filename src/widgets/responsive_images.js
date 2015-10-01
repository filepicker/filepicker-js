'use strict';
// responsive_images.js
filepicker.extend('responsiveImages', function(){
    var fp = this;

    var WINDOW_RESIZE_TIMEOUT = 200;






    return {
        getElementDims: getElementDims,
        construct: construct
    };

    function getElementDims(elem){
        var dims = {};
        if (elem.parentNode === null) {
            dims.width = fp.window.getWidth();
            dims.height = fp.window.getWidth();
            return dims;
        }

        /*
           Hack for images with an alt and no src tag.
           Example: <img data-src="img.jpg" alt="An Image"/>
           Since the image has no parsable src yet, the browser actually 
           reports the width of the alt construct.
           We return the parent nodes sizes instead.
        */

        if (elem.alt && !elem.fpAltCheck) {
            elem.parentNode.fpAltCheck = true;
            return getElementDims(elem.parentNode);
        }

        dims.width = elem.offsetWidth;
        dims.height = elem.offsetHeight;

        if (!dims.width && !dims.height) {
            return getElementDims(elem.parentNode);
        }

        return dims;
    }

    /*
        Replace the image source of the element.
        @param elem
    */

    function replaceSrc(elem, newSrc) {
        
        var previousSrc = getSrcAttr(elem);

        elem.src = newSrc;

        if (previousSrc){
            elem.onerror = function(){
                elem.src = previousSrc;
                elem.onerror = null;
            };
        }
    }

    /*
        Get the elements image src.
        @param elem
        @returns {string}
    */


    function getSrcAttr(elem) {
        return elem.getAttribute('data-fp-src') || elem.getAttribute('src');
    }


    function getCurrentConvertParams(url){
        var restConvertOptions = fp.util.parseUrl(url).params || {};

        return {
            width: restConvertOptions.w,
            height: restConvertOptions.h
        };
    }

    function buildUrl(originalUrl, params) {
        if (Object.keys(params).length) {
            originalUrl += '/convert?' + fp.util.toQuery(params);
        }
        return originalUrl;
    };

    function construct(elem){
        var url = getSrcAttr(elem),
            dims = getElementDims(elem),
            parsed = fp.util.parseUrl(url),
            params = fp.util.extend(
                {
                    w:dims.width
                },
                parsed.params
            );

        replaceSrc(elem, buildUrl(parsed.rawUrl, params));
    }
    

});
