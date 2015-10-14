describe("The string utils library", function(){
    it("can trim strings", function(){
    });

    it("can validate URLs", function(){
    });

    it("can parse urls", function(){
        var test = "http://fabricio.us:5001/_static/library/index.html?spec=The%20Ajax%20library#test";
        var ret = filepicker.util.parseUrl(test);
        expect(ret.file).toEqual("index.html");
        expect(ret.hash).toEqual("test");
        expect(ret.host).toEqual("fabricio.us");
        expect(ret.origin).toEqual("http://fabricio.us:5001");
        expect(ret.path).toEqual("/_static/library/index.html");
        expect(ret.port).toEqual("5001");
        expect(ret.protocol).toEqual("http");
        expect(ret.query).toEqual("?spec=The%20Ajax%20library");
        expect(ret.relative).toEqual("/_static/library/index.html?spec=The%20Ajax%20library#test");
        expect(ret.source).toEqual(test);
    });

    it("can parse local urls", function(){
        var test = "/_static/library/index.html?spec=The%20Ajax%20library#test";
        var ret = filepicker.util.parseUrl(test);
        expect(ret.file).toEqual("index.html");
        expect(ret.hash).toEqual("test");
        expect(ret.host).toEqual(window.location.hostname);
        expect(ret.origin).toEqual(window.location.protocol+"//"+window.location.host);
        expect(ret.path).toEqual("/_static/library/index.html");
        expect(ret.port).toEqual(window.location.port);
        expect(ret.protocol).toEqual(window.location.protocol.replace(":",""));
        expect(ret.query).toEqual("?spec=The%20Ajax%20library");
        expect(ret.relative).toEqual("/_static/library/index.html?spec=The%20Ajax%20library#test");
        expect(ret.source).toEqual(ret.origin+test);
    });

    it("can determine if a strings end with another", function(){
    });
});
