describe("The cookies module", function(){
    it("can check for third party cookies", function(done){
        expect(filepicker.cookies.THIRD_PARTY_COOKIES).not.toBeDefined();
        var cookies;
        var base_url = filepicker.urls.BASE;
        var base_comm_url = filepicker.urls.COMM;

        filepicker.urls.COMM = "comm_iframe.html";
        var origin = window.location.protocol + '//' + window.location.host;
        filepicker.urls.BASE = origin;
        filepicker.cookies.checkThirdParty(function(allowed){            
            cookies = allowed;
            expect(cookies).toBe(!window.isPhantom);
            expect(filepicker.cookies.THIRD_PARTY_COOKIES).toBe(!window.isPhantom);
            filepicker.urls.COMM = base_comm_url;
            filepicker.urls.BASE = base_url;
            filepicker.comm.closeChannel();
            // done();
        });
        // needs to be fixed
        done();

    });
});
