'use strict';
// responsive_images.js

/*
    responsive image widget 
    TODO: security option
*/

filepicker.extend('responsiveImages', function(){
    var fp = this;

    var WINDOW_RESIZE_TIMEOUT = 200;

    var reloadWithDebounce = debounce(function () {
        constructAll();
    }, WINDOW_RESIZE_TIMEOUT);


    return {
        activate: activate,
        deactivate: deactivate,
        setResponsiveOptions: setResponsiveOptions,
        getResponsiveOptions: getResponsiveOptions,
        getElementDims: getElementDims,
        replaceSrc: replaceSrc,
        getCurrentResizeParams: getCurrentResizeParams,
        construct: construct,
        constructParams: constructParams,
        shouldConstruct: shouldConstruct,
        roundWithStep: roundWithStep,
        addWindowResizeEvent: addWindowResizeEvent,
        removeWindowResizeEvent:removeWindowResizeEvent
    };

    /**
    *   Module is activated in finalize.js file
    *
    *   @method activate
    */

    function activate(){
        constructAll();
        addWindowResizeEvent(reloadWithDebounce);
    }

    /**
    *   remove windowResized resize listener
    *
    *   @method deactivate
    */

    function deactivate(){
        removeWindowResizeEvent(reloadWithDebounce);
    }

    /**
    *   Search for all images with data-fp-src attribute 
    *   and rebuild its source url if needed
    *
    *   @method constructAll
    */

    function constructAll(){
        var responsiveImages = document.querySelectorAll('img[data-fp-src]'),
            element,
            i;

        for (i=0; i< responsiveImages.length; i++) {
            element = responsiveImages[i];
            if (shouldConstruct(element)) {
                construct(element);
            }
        }
    }


    /**
    *   Depend on responsive images options and current image size return true 
    *   if image url should be constructed or false if not
    *
    *   @method shouldConstruct
    *   @param {DOMElement} elem - Image element
    *   @returns {Boolean}
    */

    function shouldConstruct(image){
        var imageSrc = getSrcAttr(image),
        /*
            get image data-fp-on-resize attr
            OR global option
            OR 'all' by default
        */
            changeOnResize = getFpOnResizeAttr(image) || getResponsiveOptions().onResize || 'all';

        /*
            if there is not src attribute
            OR onResize = 'all'
            construct url immedialty
        */

        if (!imageSrc || changeOnResize === 'all') {
            return true;
        }

        if (changeOnResize === 'none') {
            return false;
        }

        var shouldBeEnlarged = getCurrentResizeParams(imageSrc).width < getElementDims(image).width;

        if ((shouldBeEnlarged && changeOnResize === 'up') || 
            (!shouldBeEnlarged && changeOnResize === 'down')) {
            return true;
        }

        return false;
    }

    /**
    *   Return image DOM element size ( or parent node size )
    *
    *   @method getElementDims
    *   @param {DOMElement} elem - Image element
    *   @returns {Object}
    *       width {Number}
    *       height {Number}
    */

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

        /*
            width cant be 0
        */
        if (!dims.width) {
            return getElementDims(elem.parentNode);
        }

        return dims;
    }

    /**
    *   Replace the image source of the element.
    *
    *   @method replaceSrc
    *   @param {DOMElement} elem - Image element
    *   @param {String} newSrc - new image source url
    */

    function replaceSrc(elem, newSrc) {
        var previousSrc = getSrcAttr(elem) || getFpSrcAttr(elem);

        if (previousSrc !== newSrc) {
            elem.src = newSrc;
            if (previousSrc){
                elem.onerror = function(){
                    elem.src = previousSrc;
                    elem.onerror = null;
                };
            }
        }
    }

    /**
    *   @method getFpOnResizeAttr
    *   @param {DOMElement} elem - Image element
    *   @returns {String} Return attribute value
    */

    function getFpOnResizeAttr(elem) {
        return elem.getAttribute('data-fp-on-resize');
    }

    /**
    *   @method getFpPixelRoundAttr
    *   @param {DOMElement} elem - Image element
    *   @returns {String} Return attribute value
    */

    function getFpPixelRoundAttr(elem) {
        return elem.getAttribute('data-fp-pixel-round');
    }

    /**
    *   @method getFpImageQualityAttr
    *   @param {DOMElement} elem - Image element
    *   @returns {String} Return attribute value
    */

    function getFpImageQualityAttr(elem) {
        return elem.getAttribute('fp-image-quality');
    }

    /**
    *   @method getSrcAttr
    *   @param {DOMElement} elem - Image element
    *   @returns {String} Return attribute value
    */

    function getSrcAttr(elem) {
        return elem.getAttribute('src');
    }

    /**
    *   @method getFpSrcAttr
    *   @param {DOMElement} elem - Image element
    *   @returns {String} Return attribute value
    */

    function getFpSrcAttr(elem){
        return elem.getAttribute('data-fp-src');
    }

    /**
    *   @method getFpKeyAttr
    *   @param {DOMElement} elem - DOM element
    *   @returns {String} Return attribute value
    */

    function getFpKeyAttr(elem){
        return elem.getAttribute('data-fp-apikey');
    }


    /**
    *   @method getFpSignatureAttr
    *   @param {DOMElement} elem - DOM element
    *   @returns {String} Return attribute value
    */

    function getFpSignatureAttr(elem){
        return elem.getAttribute('data-fp-signature');
    }


    /**
    *   @method getFpPlicyAttr
    *   @param {DOMElement} elem - DOM element
    *   @returns {String} Return attribute value
    */

    function getFpPolicyAttr(elem){
        return elem.getAttribute('data-fp-policy');
    }

    /**
    *   Parse url and return width & height values from url resize option
    *
    *   @method getCurrentResizeParams
    *   @param {String} url - Image url
    *   @returns {Object} 
    *       width {Number}
    *       height {Number}
    */

    function getCurrentResizeParams(url){
        return fp.conversionsUtil.parseUrl(url).optionsDict.resize || {};
    }


    /**
    *   Construct responsive image = set proper image source 
    *
    *   @method construct
    *   @param {DOMElement} elem - Image element
    */

    function construct(elem){
        var url = getFpSrcAttr(elem),
            apikey = getFpKeyAttr(elem) || fp.apikey,
            responsiveOptions = getResponsiveOptions();

        if (!fp.apikey) {
            /*
                do not overwrite apikey if not necessary
            */
            fp.setKey(apikey);
            fp.util.checkApiKey();
        }
        replaceSrc(elem, fp.conversionsUtil.buildUrl(url, constructParams(elem, responsiveOptions), apikey));
    }


    /**
    *   Construct elemenet params based on 
    *   element atributes and responsive options
    *
    *   @method construct
    *   @param {DOMElement} elem - Image element
    *   @param {Object} responsiveOptions
    *   @returns {Object} params 
    */

    function constructParams(elem, responsiveOptions){
        responsiveOptions = responsiveOptions|| {};
        var dims = getElementDims(elem),
            /*
                get image data-fp-pixel-round attr
                OR global pixelRound option
                OR 10 by default
            */
            pixelRound = getFpPixelRoundAttr(elem) || responsiveOptions.pixelRound || 10,
            params = {
                resize : {
                    /*
                        set only width for now
                        DOM element on init could has height=0
                    */
                    width : roundWithStep(dims.width, pixelRound)
                }
            },
            signature = responsiveOptions.signature || getFpSignatureAttr(elem);

        if (signature) {
            params.security = {
                signature: signature,
                policy: responsiveOptions.policy || getFpPolicyAttr(elem)
            };
        }

        return params;
    }

    /**
    *   Timeout function calls based on a period of time.
    *
    *   @method debounce
    *   @param {function} func - function to call
    *   @param {number} wait - time to wait in miliseconds
    *   @returns {function}
    */

    function debounce(func, wait) {
        var timeout;
        return function () {
            var context = this;
            var args = arguments;
            var later = function () {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }


    /**
    *   Add "resize" window event.
    *
    *   @method addWindowResizeEvent
    */
  
    function addWindowResizeEvent(onWindowResized) {
        if (window.addEventListener) {
            window.addEventListener('resize', onWindowResized, false);
        } else if (window.attachEvent) {
            window.attachEvent('onresize', onWindowResized);
        }
    }

    /**
    *   Remove "resize" window event.
    *
    *   @method removeWindowResizeEvent
    */
    
    function removeWindowResizeEvent(onWindowResized) {
        if (window.removeEventListener) {
            window.removeEventListener('resize', onWindowResized, false);
        } else if (window.detachEvent) {
            window.detachEvent('onresize', onWindowResized);
        }
    }

    /**
    *   Return global responsive options
    *
    *   @method getResponsiveOptions
    *   @returns {Object}
    *       onResize {String} optional, can be 'all', 'up', 'down', 'none'
    *       pixelRound {Number} optional
    *       imageQuality {Number} optional
    *       signature {String} optional
    *       policy {String} optional
    */

    function getResponsiveOptions(){
        return fp.responsiveOptions || {};
    }

    /**
    *   Set global responsive options
    *
    *   @method setResponsiveOptions
    *   @param {Object} options
    *       onResize {String} optional, can be 'all', 'up', 'down', 'none'
    *       pixelRound {Number} optional
    *       imageQuality {Number} optional
    *       signature {String} optional
    *       policy {String} optional
    */

    function setResponsiveOptions(options){
        options = options || {};

        if (typeof options !== 'object') {
            throw new fp.FilepickerException('Responsive options must be an object.');
        }

        fp.responsiveOptions = options;
        
    }


    /**
    *   Round the pixel size based on the pixel rounding parameter.
    *
    *   @method roundWithStep
    *   @param {Number} value - value to be rounded
    *   @param {Number} round - round step
    *   @returns {Number} rounded value
    */

    function roundWithStep(value, round) {
        var pixelRounding = round === 0 ? 1 : round;
        return Math.ceil(value / pixelRounding) * pixelRounding;
    }

});
