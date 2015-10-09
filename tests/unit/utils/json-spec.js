describe("The JSON library", function(){
    it("should be able to encode json", function(){
        var input = {hello: "world"};
        var output = '{"hello":"world"}';
        
        expect(filepicker.json.encode(input)).toEqual(output);
        expect(filepicker.json.stringify(input)).toEqual(output);

        input = {hello: ["world", 1, 3, {2:4}]};
        output = '{"hello":["world",1,3,{"2":4}]}';
        
        expect(filepicker.json.encode(input)).toEqual(output);
        expect(filepicker.json.stringify(input)).toEqual(output);
    });

    it("should be able to decode json", function(){
        var output = {hello: "world"};
        var input = '{"hello":"world"}';
        
        expect(filepicker.json.decode(input)).toEqual(output);
        expect(filepicker.json.parse(input)).toEqual(output);

        output = {hello: ["world", 1, 3, {2:4}]};
        input = '{"hello":["world",1,3,{"2":4}]}';
        
        expect(filepicker.json.parse(input)).toEqual(output);
    });

    it("should use the default JSON library if available", function(){
        var input = {hello: "world"};
        var output = '{"hello":"world"}';

        spyOn(JSON, 'stringify').and.callThrough();
        expect(filepicker.json.encode(input)).toEqual(output);
        expect(JSON.stringify).toHaveBeenCalledWith(input);
    });

    it("should still encode without the default JSON library", function(){
        var input = {hello: "world"};
        var output = '{"hello":"world"}';

        spyOn(JSON, 'stringify');
        JSON.stringify = undefined;
        expect(filepicker.json.encode(input)).toEqual(output);

        input = {hello: ["world\t", 1, 3, {2:4, a: true}, {b: [undefined, null]}]};
        output = '{"hello":["world\\t",1,3,{"2":4,"a":true},{"b":[null,null]}]}';
        expect(filepicker.json.encode(input)).toEqual(output);
    });

    it("should still decode without the default JSON library", function(){
        var input = '{"hello":"world"}';
        var output = {hello: "world"};

        spyOn(JSON, 'parse');
        JSON.parse = undefined;
        expect(filepicker.json.decode(input)).toEqual(output);

        input = '{"hello":["world\\t",1,3,{"2":4,"a":true},{"b":[null,null]}]}';
        output = {hello: ["world\t", 1, 3, {2:4, a: true}, {b: [null, null]}]};
        expect(filepicker.json.decode(input, true)).toEqual(output);
    });

    it("should catch insecure input", function(){
        var test = function(){
            var input = 'console.log("hello world")';
            filepicker.json.decode(input, true);
        };
        expect(test).toThrow();

        //even without default parse
        spyOn(JSON, 'parse');
        JSON.parse = undefined;
        expect(test).toThrow();
    });
});
