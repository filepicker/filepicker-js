describe("The utils library", function(){
    it("can determine if an object is an array", function(){
    });

    it("can determine if an object is a file", function(){
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
});
