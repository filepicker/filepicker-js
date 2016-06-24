describe("The utils library", function(){
    it("can determine if an object is an array", function(){
    });

    it("can determine if an object is a file", function(){
        expect(filepicker.util.isFile(new File([], 'name.jpg'))).toEqual(true);
        expect(filepicker.util.isFile(new Blob())).toEqual(true);
        expect(filepicker.util.isFile()).toBeFalsy(); // returns undefined rather than false
        expect(filepicker.util.isFile(function() {})).toEqual(false);
    });

    it("can determine if an object is an element", function(){
    });

    it("can determine if an object is a file input element", function(){
    });

    it("can determine the type of an object", function(){
    });

    it("can generate random ids", function(){
    });

    it("can set dictionary defaults", function(){
    });

    it("can add onload functions", function(){
    });

    it("can determine a string is an fpurl", function(){
    });

    it("can clone an object", function(){
        var start = {
            a: 1,
            b: 2,
            c: "abc"
        };
        var end = filepicker.util.clone(start);
        expect(start.a).toEqual(end.a);
        expect(start.b).toEqual(end.b);
        expect(start.c).toEqual(end.c);
        start.c = "123";
        expect(start.c).not.toEqual(end.c);
    });

    it("can build api url from filestack cdn url", function(){
        var urls = [
            {
                input: 'https://cdn.filestackcontent.com/zEJ90dDpS2iPriLsKY9Y',
                output: filepicker.urls.BASE+'/api/file/zEJ90dDpS2iPriLsKY9Y'
            },
            {
                input: 'https://cdn.filestackcontent.com/zEJ90dDpS2iPriLsKY9Y/convert?foo=bar',
                output: filepicker.urls.BASE+'/api/file/zEJ90dDpS2iPriLsKY9Y/convert?foo=bar'
            },
            {
                input: 'https://cdn.filestackcontent.com/zEJ90dDpS2iPriLsKY9Y/remove',
                output: filepicker.urls.BASE+'/api/file/zEJ90dDpS2iPriLsKY9Y/remove'
            },
            {
                input: 'http://cdn.filestackcontent.com/zEJ90dDpS2iPriLsKY9Y/convert?foo=bar',
                output: filepicker.urls.BASE+'/api/file/zEJ90dDpS2iPriLsKY9Y/convert?foo=bar'
            },
            {
                input: 'http://www.filestackapi.com/api/file/zEJ90dDpS2iPriLsKY9Y',
                output: 'http://www.filestackapi.com/api/file/zEJ90dDpS2iPriLsKY9Y',
            },
            {
                input: 'https://api.filestackapi.com/api/file/zEJ90dDpS2iPriLsKY9Y',
                output: 'https://api.filestackapi.com/api/file/zEJ90dDpS2iPriLsKY9Y'
            },
        ];

        urls.forEach(function(item){
            expect(filepicker.util.getFPUrl(item.input)).toEqual(item.output);
        });
    });
});
