//conversions_util.js
'use strict';

/*
    conversions 2.0 support module
    TODO: conversion options validation ?
*/

filepicker.extend('conversionsUtil', function(){
    var fp = this,
        CONVERSION_DOMAIN = (window.location.protocol || 'https') + '//process.filepicker.io/';

    /**
    *   Return parsed conversion 2.0 url
    *
    *   @method parseProcessUrl
    *   @param {string} processUrl - conversion url
    *   @returns {String}
    *       url {String} Orignal image url
    *       optionsDict {Object} -  conversionName : value
    */

    var parseConversionUrl = function(processUrl){
        if (!processUrl) {
            return {
                url: null,
                optionsDict: {}
            };
        }
        /*
            - strip off process domain
        */
        processUrl = processUrl.replace(CONVERSION_DOMAIN, '');
        var originalUrl = processUrl.substring(processUrl.indexOf('/http') + 1);
        /*
            - strip off original Url
            - strip of apikey ( to first slash )
        */
        processUrl = processUrl.replace('/' + originalUrl, '').replace(processUrl.indexOf('/'), '');
        
        var segments = processUrl.split('/'),
            optionsDict = {},
            majorOption,
            minorOptions,
            minorOption,
            i,
            j;

        for (i in segments) {
            /*
                eg majorOption= ['resize', 'width:100,height:200']
            */
            majorOption = segments[i].split('=');
            if (majorOption.length > 1) {
                optionsDict[majorOption[0]] = {};
                minorOptions = majorOption[1].split(',');
                /*
                   eg minorOptions= ['width:100', 'height:200']
                */
                for (j in minorOptions) {
                    minorOption = minorOptions[j].split(':');
                    /*
                        eg minorOption =['width', '100']
                    */
                    if (minorOption.length > 1) {
                        optionsDict[majorOption[0]][minorOption[0]] = minorOption[1];
                    }
                }
            }
        }

        return {
            url: originalUrl,
            optionsDict: optionsDict
        };
    };

    /**
    *   Build conersion 2.0 url based on original url and appended
    *
    *   @method buildUrl
    *   @param {String} originalUrl
    *   @param {Object} optionsDict
    *   @param {String} apikey
    *   @returns {String} Return conversion 2.0 url
    */

    var buildConversionUrl = function (originalUrl, optionsDict, apikey) {
        var conversionUrl = CONVERSION_DOMAIN + apikey,
            majorOption,
            minorOption,
            length;

        optionsDict = optionsDict || {};
        
        for (majorOption in optionsDict) {
            conversionUrl += '/' + majorOption +'=';
            length = fp.util.objectKeys(optionsDict[majorOption] || {}).length;
            for (minorOption in optionsDict[majorOption]) {
                conversionUrl += minorOption + ':' + optionsDict[majorOption][minorOption];
                /*
                    append comma if not last one
                */
                if (--length !== 0) {
                    conversionUrl+=',';
                }
            }
        }
        conversionUrl += '/' + originalUrl;
        return conversionUrl;
    };

    return {
        CONVERSION_DOMAIN: CONVERSION_DOMAIN,
        parseUrl: parseConversionUrl,
        buildUrl: buildConversionUrl
    };
});
