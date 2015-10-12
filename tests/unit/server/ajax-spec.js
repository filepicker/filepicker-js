describe("The Ajax library", function(){
    it("should be able to make GET requests", function(){
        var url = "/library/ajax/get/success";

        var success, error;

        success = jasmine.createSpy('success');
        error = jasmine.createSpy('error');
        filepicker.ajax.get(url, {
            success: success,
            error: error,
            json: true,
            data: {test123: 45}
        });

            expect(success).toHaveBeenCalled();
            expect(error).not.toHaveBeenCalled();

            expect(success).toHaveBeenCalledWith({hello:"world"}, 200, jasmine.any(Object));
    });

    it("should be able to make POST requests", function(){
        var url = "/library/ajax/post/success";

        var success, error, progress;
            success = jasmine.createSpy('success');
            error = jasmine.createSpy('error');
            progress = jasmine.createSpy('progress');

        filepicker.ajax.post(url, {
            success: success,
            error: error,
            json: true,
            data: {test123: 45},
            progress: progress
        });


        expect(success).toHaveBeenCalledWith({hello:"world"}, 200, jasmine.any(Object));
        expect(error).not.toHaveBeenCalled();
        if (window.test.features.progress) {
            expect(progress).toHaveBeenCalledWith(95);
        }
        expect(progress).toHaveBeenCalledWith(100);

    });

    it("should be able to make PUT requests", function(){
        var url = "/library/ajax/put/success";

        var success, error;

        success = jasmine.createSpy('success');
        error = jasmine.createSpy('error');
        filepicker.ajax.request(url, {
            method: "PUT",
            success: success,
            error: error,
            json: true,
            data: {test123: 45}
        });


        expect(success).toHaveBeenCalledWith({hello:"world"}, 200, jasmine.any(Object));
        expect(error).not.toHaveBeenCalled();
    });

    it("should be able to post complex data and headers", function(){
        var url = "/library/ajax/post/complex";

        var success  = jasmine.createSpy('success'), 
            error = jasmine.createSpy('error');

        filepicker.ajax.post(url, {
            success: success,
            error: error,
            json: true,
            headers: {'X-CUSTOM-HEADER':'fpio'},
            data: {test123: {a:[1,2,3, true]}, b: "abc"}
        });

        expect(success).toHaveBeenCalledWith({hello:"success"}, 200, jasmine.any(Object));
        expect(error).not.toHaveBeenCalled();
    });

    it("should fall back to using ActiveXObjects", function(){
        var url = "/library/ajax/get/success";

        if (!window.test.features.overwrite_xhr) {
            return;
        }

        spyOn(window, 'XMLHttpRequest').and.callFake(function(){
            throw "Doesn't exist";
        });

        window.ActiveXObject = jasmine.createSpy().and.callFake(function(){
            throw "Doesn't exist";
        });

        var success  = jasmine.createSpy('success'), 
            error = jasmine.createSpy('error');

        filepicker.ajax.get(url, {
            success: success,
            error: error,
            json: true,
            data: {test123: 45}
        });
        expect(window.XMLHttpRequest).toHaveBeenCalled();
        expect(window.ActiveXObject).toHaveBeenCalledWith("Msxml2.XMLHTTP");
        expect(window.ActiveXObject).toHaveBeenCalledWith("Microsoft.XMLHTTP");
        expect(success).not.toHaveBeenCalled();
        expect(error).toHaveBeenCalledWith("Ajax not allowed");
    });

    it("should be able to use passed in XHR's", function(){
        var url = "/library/ajax/get/success";

        var xhr = jasmine.createSpyObj('xhr', ['open', 'setRequestHeader', 'send']);

        var method = "PUT";
        var data = {1:["a",23]};

        filepicker.ajax.request(url, {
            xhr: xhr,
            method: method,
            data: data
        });

        expect(xhr.open).toHaveBeenCalledWith(method, url+'?plugin=js_lib', true);
        expect(xhr.setRequestHeader).toHaveBeenCalledWith("Content-Type","application/x-www-form-urlencoded; charset=utf-8");
        expect(xhr.setRequestHeader).toHaveBeenCalledWith("Accept","text/javascript, text/html, application/xml, text/xml, */*");
        
    });

    it("should handle errors gracefully", function(){
        var make_get = function(url, onDone) {
            var success  = jasmine.createSpy('success'), 
                error = jasmine.createSpy('error');
                
                success = jasmine.createSpy('success');
                error = jasmine.createSpy('error');
                filepicker.ajax.get(url, {
                    success: success,
                    error: error,
                    json: true,
                    data: {test123: 45}
                });

                onDone(success, error);
        };

        var url = "/library/ajax/get/invalid_json";
        make_get(url, function(success, error){
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("Invalid json: Hello world", 200, jasmine.any(Object));
        });

        url = "/library/ajax/get/bad_params";
        make_get(url, function(success, error){
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("bad_params", 400, jasmine.any(Object));
        });

        url = "/library/ajax/get/not_authed";
        make_get(url, function(success, error){
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("not_authorized", 403, jasmine.any(Object));
        });

        url = "/library/ajax/get/not_found";
        make_get(url, function(success, error){
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("not_found", 404, jasmine.any(Object));
        });

        url = "/library/ajax/get/error";
        make_get(url, function(success, error){
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("That's an error, Jim", 500, jasmine.any(Object));
        });

    });

    it("should be able to make CORS GET requests", function(){
        var url = test_server.cors+"/library/ajax/get/success";
        if (window.test.features.xdr_cors) {
            url = test_server.cors+"/library/ajax/get/success_xdr";
        }

        var success  = jasmine.createSpy('success'), 
        error = jasmine.createSpy('error');

        filepicker.ajax.get(url, {
            success: success,
            error: error,
            json: true,
            data: {test123: 45}
        });

        expect(success).toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();

        expect(success).toHaveBeenCalledWith({hello:"world"}, 200, jasmine.any(Object));
    });

    it("should be able to make CORS POST requests", function(){
        var url = test_server.cors+"/library/ajax/post/success";
        if (window.test.features.xdr_cors) {
            url = test_server.cors+"/library/ajax/post/success_xdr";
        }

        var success  = jasmine.createSpy('success'), 
            error = jasmine.createSpy('error'),
            progress = jasmine.createSpy('progress');

        filepicker.ajax.post(url, {
            success: success,
            error: error,
            json: true,
            data: {test123: 45},
            progress: progress
        });

        expect(success).toHaveBeenCalledWith({hello:"world"}, 200, jasmine.any(Object));
        expect(error).not.toHaveBeenCalled();
        if (window.test.features.progress) {
            expect(progress).toHaveBeenCalledWith(95);
        }
        expect(progress).toHaveBeenCalledWith(100);
    });
    
    it("should be able to set custom content type and data", function(){
        var url = "/library/ajax/post/xml_data";

        var success  = jasmine.createSpy('success'), 
            error = jasmine.createSpy('error');
        //synchronous, because why not
        //Note: synchronous still uses event listeners, so have to use jasmine async
        success = jasmine.createSpy('success');
        error = jasmine.createSpy('error');
        filepicker.ajax.post(url, {
            async: false,
            success: success,
            error: error,
            headers: {'Content-Type': 'text/xml'},
            data: "<data>Xml is ugly</data>",
            processData: false
        });
        expect(success).toHaveBeenCalledWith("<resp>Good xml</resp>", 200, jasmine.any(Object));
        expect(error).not.toHaveBeenCalled();
    });
});
