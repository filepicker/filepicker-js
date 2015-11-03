'use strict';
describe('Conversions util', function(){
    var scenarios = [
        {
            url: filepicker.conversionsUtil.CONVERSION_DOMAIN + 'l5uQ3k7FQ5GoYCHyTdZV/resize=width:615,height:100/other=test:testValue/https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
            response: {
                url: 'https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
                apikey: 'l5uQ3k7FQ5GoYCHyTdZV',
                optionsDict: {
                    resize: {
                        width: '615',
                        height: '100'
                    },
                    other: {
                        test: 'testValue'
                    }
                }
            }
        },
        {
            url: filepicker.conversionsUtil.CONVERSION_DOMAIN + 'l5uQ3k7FQ5GoYCHyTdZV/resize=width:2222/security=policy:yyy,signature:xxx/https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
            response: {
                url: 'https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
                apikey: 'l5uQ3k7FQ5GoYCHyTdZV',
                optionsDict: {
                    resize: {
                        width: '2222'
                    },
                    security: {
                        policy: 'yyy',
                        signature: 'xxx'
                    }
                }
            }
        },
        {
            url: filepicker.conversionsUtil.CONVERSION_DOMAIN + 'l5uQ3k7FQ5GoYCHyTdZV/resize=width:1000000,height:100/conversion_with_no_value/http://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
            response: {
                url: 'http://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
                apikey: 'l5uQ3k7FQ5GoYCHyTdZV',
                optionsDict: {
                    resize: {
                        width: '1000000',
                        height: '100'
                    },
                    conversion_with_no_value:null
                }
            }
        }
    ];

    it('should parse conersion 2.0 url', function(){
        scenarios.forEach(function(scenario){
            expect(filepicker.conversionsUtil.parseUrl(scenario.url)).toEqual(scenario.response);
        });
    });

    it('should build conersion 2.0 url', function(){
        scenarios.forEach(function(scenario){
            expect(
                filepicker.conversionsUtil.buildUrl(
                    scenario.response.url, 
                    scenario.response.optionsDict,
                    scenario.response.apikey
                )
            ).toEqual(scenario.url);
        });
    });

});

