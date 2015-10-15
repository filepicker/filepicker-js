describe("The Browser library", function(){
    it("correctly identifies that we're not on iOS or Android", function(){
        expect(filepicker.browser.isIOS()).toBe(false);
        expect(filepicker.browser.isAndroid()).toBe(false);
    });

    it("identifies when we are on android", function(){
        navigator.__defineGetter__('userAgent', function(){
            return "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";
        });
        expect(filepicker.browser.isAndroid()).toBe(true);
        expect(filepicker.browser.isIOS()).toBe(false);
    });

    it("identifies when we are on iOS", function(){

        navigator.__defineGetter__('userAgent', function(){
            return "Mozilla/5.0 (iPhone; CPU iPhone OS 5_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A406 Safari/7534.48.3";
        });

        expect(filepicker.browser.isIOS()).toBe(true);
        expect(filepicker.browser.isAndroid()).toBe(false);

        navigator.__defineGetter__('userAgent', function(){
            return "Mozilla/5.0 (iPad; CPU OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B176 Safari/7534.48.3";
        });

        expect(filepicker.browser.isIOS()).toBe(true);
        expect(filepicker.browser.isAndroid()).toBe(false);

        navigator.__defineGetter__('userAgent', function(){
            return "Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5";
        });
        expect(filepicker.browser.isIOS()).toBe(true);
        expect(filepicker.browser.isAndroid()).toBe(false);
    });
});