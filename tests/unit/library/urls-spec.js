describe("The urls module", function(){
    it("should export various base urls", function(){
    });

    it("should be able to construct pick urls", function(){
    });

    it("should be able to construct export urls", function(){
        var url = "http://amazon.com/def.png?secret=abc123&expires=no";
        var old_key = filepicker.apikey;
        filepicker.apikey = "abc123";
        var options = {
            'mimetype': 'image/png',
            'openTo': 3,
            'suggestedFilename': 'cool.png'
        };

        var id = '1234123';

        var output = filepicker.urls.constructExportUrl(url, options, id);
        var referrer = window.location.hostname;

        var expected_output = "https://dialog.filepicker.io/dialog/save/?key=abc123&id=1234123&referrer=localhost&iframe=true&version=v2modal&loc=3&language=en_us&plugin=js_lib&url=http%3A%2F%2Famazon.com%2Fdef.png%3Fsecret%3Dabc123%26expires%3Dno&m=image/png&defaultSaveasName=cool.png";
        expect(output).toEqual(expected_output);

        filepicker.apikey = old_key;
    });

    it("should be able to construct store urls", function(){
        var old_key = filepicker.apikey;
        filepicker.apikey = "abc123";

        var options = {
            location: "S3",
            mimetype: 'image/png',
            filename: 'cool.png',
            path: 'abcd/'
        };

        var output = filepicker.urls.constructStoreUrl(options);

        var expected_output = "https://www.filepicker.io/api/store/S3?key=abc123&mimetype=image/png&filename=cool.png&path=abcd/&plugin=js_lib";
        expect(output).toEqual(expected_output);

        filepicker.apikey = old_key;
    });

    it("should be able to construct write urls", function(){
        
    });
});
