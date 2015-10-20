describe("Conversions util", function(){
    var scenarios = [
        {
            url: 'http://process.filepickercdn.com/l5uQ3k7FQ5GoYCHyTdZV/resize=width:615,height:100/other=test:testValue/https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
            apikey: 'l5uQ3k7FQ5GoYCHyTdZV',
            response: {
                url: 'https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
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
            url: 'http://process.filepickercdn.com/l5uQ3k7FQ5GoYCHyTdZV/resize=width:2222/security=policy:yyy,signature:xxx/https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
            apikey: 'l5uQ3k7FQ5GoYCHyTdZV',
            response: {
                url: 'https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
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
                    scenario.apikey
                )
            ).toEqual(scenario.url);
        });
    });

});

