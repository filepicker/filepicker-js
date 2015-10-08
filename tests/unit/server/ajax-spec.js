describe("The Ajax library", function(){
    it("should be able to make GET requests", function(){
        var url = "/library/ajax/get/success";

        var success, error;
        runs(function(){
            success = jasmine.createSpy('success');
            error = jasmine.createSpy('error');
            filepicker.ajax.get(url, {
                success: success,
                error: error,
                json: true,
                data: {test123: 45}
            });
        });

        waitsFor(function(){
            return success.wasCalled || error.wasCalled;
        }, "the ajax call to occur", 2000);

        runs(function(){
            expect(success).toHaveBeenCalled();
            expect(error).not.toHaveBeenCalled();

            expect(success).toHaveBeenCalledWith({hello:"world"}, 200, jasmine.any(Object));
        });
    });

    it("should be able to make POST requests", function(){
        var url = "/library/ajax/post/success";

        var success, error, progress;
        runs(function(){
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
        });

        waitsFor(function(){
            return success.wasCalled || error.wasCalled;
        }, "the ajax call to occur", 2000);

        runs(function(){
            expect(success).toHaveBeenCalledWith({hello:"world"}, 200, jasmine.any(Object));
            expect(error).not.toHaveBeenCalled();
            if (window.test.features.progress) {
                expect(progress).toHaveBeenCalledWith(95);
            }
            expect(progress).toHaveBeenCalledWith(100);
        });
    });

    it("should be able to make PUT requests", function(){
        var url = "/library/ajax/put/success";

        var success, error;
        runs(function(){
            success = jasmine.createSpy('success');
            error = jasmine.createSpy('error');
            filepicker.ajax.request(url, {
                method: "PUT",
                success: success,
                error: error,
                json: true,
                data: {test123: 45}
            });
        });

        waitsFor(function(){
            return success.wasCalled || error.wasCalled;
        }, "the ajax call to occur", 2000);

        runs(function(){
            expect(success).toHaveBeenCalledWith({hello:"world"}, 200, jasmine.any(Object));
            expect(error).not.toHaveBeenCalled();
        });
    });

    it("should be able to post complex data and headers", function(){
        var url = "/library/ajax/post/complex";

        var success, error;
        runs(function(){
            success = jasmine.createSpy('success');
            error = jasmine.createSpy('error');
            filepicker.ajax.post(url, {
                success: success,
                error: error,
                json: true,
                headers: {'X-CUSTOM-HEADER':'fpio'},
                data: {test123: {a:[1,2,3, true]}, b: "abc"}
            });
        });

        waitsFor(function(){
            return success.wasCalled || error.wasCalled;
        }, "the ajax call to occur", 2000);

        runs(function(){
            expect(success).toHaveBeenCalledWith({hello:"success"}, 200, jasmine.any(Object));
            expect(error).not.toHaveBeenCalled();
        });
    });

    it("should fall back to using ActiveXObjects", function(){
        var url = "/library/ajax/get/success";

        if (!window.test.features.overwrite_xhr) {
            return;
        }

        spyOn(window, 'XMLHttpRequest').andCallFake(function(){
            throw "Doesn't exist";
        });
        window.ActiveXObject = jasmine.createSpy().andCallFake(function(){
            throw "Doesn't exist";
        });
        success = jasmine.createSpy('success');
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

        expect(xhr.open).toHaveBeenCalledWith(method, url, true);
        expect(xhr.setRequestHeader).toHaveBeenCalledWith("Content-Type","application/x-www-form-urlencoded; charset=utf-8");
        expect(xhr.setRequestHeader).toHaveBeenCalledWith("Accept","text/javascript, text/html, application/xml, text/xml, */*");
        expect(xhr.send).toHaveBeenCalledWith("1[0]=a&1[1]=23");
    });

    it("should handle errors gracefully", function(){
        var make_get = function(url, onDone) {
            var success, error;
            runs(function(){
                success = jasmine.createSpy('success');
                error = jasmine.createSpy('error');
                filepicker.ajax.get(url, {
                    success: success,
                    error: error,
                    json: true,
                    data: {test123: 45}
                });
            });

            waitsFor(function(){
                return success.wasCalled || error.wasCalled;
            }, "the ajax call to occur", 10000);

            runs(function(){
                onDone(success, error);
            });
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

        if (window.test.features.xdr_cors) {
            url = test_server.cors+"/library/ajax/get/xdr_no_crossdomain";
            make_get(url, function(success, error){
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalledWith("CORS_error", 500, jasmine.any(Object));
            });
        } else {
            url = test_server.cors+"/library/ajax/get/no_crossdomain";
            make_get(url, function(success, error){
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalledWith("CORS_not_allowed", 0, jasmine.any(Object));
            });
        }
    });

    it("should be able to make CORS GET requests", function(){
        var url = test_server.cors+"/library/ajax/get/success";
        if (window.test.features.xdr_cors) {
            url = test_server.cors+"/library/ajax/get/success_xdr";
        }

        var success, error;
        runs(function(){
            success = jasmine.createSpy('success');
            error = jasmine.createSpy('error');
            filepicker.ajax.get(url, {
                success: success,
                error: error,
                json: true,
                data: {test123: 45}
            });
        });

        waitsFor(function(){
            return success.wasCalled || error.wasCalled;
        }, "the ajax call to occur", 10000);

        runs(function(){
            expect(success).toHaveBeenCalled();
            expect(error).not.toHaveBeenCalled();

            expect(success).toHaveBeenCalledWith({hello:"world"}, 200, jasmine.any(Object));
        });
    });

    it("should be able to make CORS POST requests", function(){
        var url = test_server.cors+"/library/ajax/post/success";
        if (window.test.features.xdr_cors) {
            url = test_server.cors+"/library/ajax/post/success_xdr";
        }

        var success, error, progress;
        runs(function(){
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
        });

        waitsFor(function(){
            return success.wasCalled || error.wasCalled;
        }, "the ajax call to occur", 10000);

        runs(function(){
            expect(success).toHaveBeenCalledWith({hello:"world"}, 200, jasmine.any(Object));
            expect(error).not.toHaveBeenCalled();
            if (window.test.features.progress) {
                expect(progress).toHaveBeenCalledWith(95);
            }
            expect(progress).toHaveBeenCalledWith(100);
        });
    });
    
    it("should be able to set custom content type and data", function(){
        var url = "/library/ajax/post/xml_data";

        var success, error;
        runs(function(){
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
        });

        waitsFor(function(){
            return success.wasCalled || error.wasCalled;
        }, "the ajax call to occur", 2000);

        runs(function(){
            expect(success).toHaveBeenCalledWith("<resp>Good xml</resp>", 200, jasmine.any(Object));
            expect(error).not.toHaveBeenCalled();
        });
    });

    //If we use xdr, no need to mock, in fact the mocking breaks IE
    if (!window.test.features.xdr_cors) {
        describe("uses XDomainRequests that", function(){
            it("can perform GETs", function(){
                var url = test_server.cors+"/library/ajax/get/success";

                var xdr = jasmine.createSpyObj('xdr', ['open', 'setRequestHeader', 'send']);
                window.XDomainRequest = function(){return xdr;};

                //to block the withCredentials check
                var xhr = jasmine.createSpy('dummy_xhr');

                var success = jasmine.createSpy('success');
                var error = jasmine.createSpy('error');

                filepicker.ajax.get(url, {
                    xhr: xhr,
                    success: success,
                    error: error,
                    data: {hello:"test"},
                    json: true
                });

                expect(xdr.open).toHaveBeenCalled();
                //tweaks url
                expect(xdr.open.calls[0].args[0]).toEqual("GET");
                expect(xdr.open.calls[0].args[1]).toMatch(url);
                expect(xdr.open.calls[0].args[1]).toMatch(/_xdr=true/);
                expect(xdr.open.calls[0].args[1]).toMatch(/_cacheBust=.+/);
                expect(xdr.open.calls[0].args[1]).toMatch('hello=test');
                expect(xdr.open.calls[0].args[2]).toEqual(true);
                //can't set headers
                expect(xdr.setRequestHeader).not.toHaveBeenCalled();
                expect(xdr.send).toHaveBeenCalledWith(null);
                
                //Triggering handlers
                xdr.status = 200;
                xdr.responseText = '{"hello":"world"}';
                xdr.onload();
                expect(success).toHaveBeenCalledWith({hello:"world"}, 200, xdr);

                xdr.status = 500;
                xdr.responseText = "bad";
                xdr.onerror();
                expect(error).toHaveBeenCalledWith("bad", 500, xdr);
            });
            it("can perform POSTs", function(){
                var url = test_server.cors+"/library/ajax/post/success";

                var xdr = jasmine.createSpyObj('xdr', ['open', 'setRequestHeader', 'send']);
                window.XDomainRequest = function(){return xdr;};

                //to block the withCredentials check
                var xhr = jasmine.createSpy('dummy_xhr');

                var success = jasmine.createSpy('success');
                var error = jasmine.createSpy('error');

                filepicker.ajax.post(url, {
                    xhr: xhr,
                    success: success,
                    error: error,
                    data: {1:["a",23]}
                });

                expect(xdr.open).toHaveBeenCalled();
                //tweaks url
                expect(xdr.open.calls[0].args[0]).toEqual("POST");
                expect(xdr.open.calls[0].args[1]).toMatch(url);
                expect(xdr.open.calls[0].args[1]).toMatch(/_xdr=true/);
                expect(xdr.open.calls[0].args[1]).toMatch(/_cacheBust=.+/);
                expect(xdr.open.calls[0].args[2]).toEqual(true);
                //can't set headers
                expect(xdr.setRequestHeader).not.toHaveBeenCalled();
                expect(xdr.send).toHaveBeenCalledWith("1[0]=a&1[1]=23");
                
                //Triggering handlers
                xdr.status = 200;
                xdr.responseText = "winning";
                xdr.onload();
                expect(success).toHaveBeenCalledWith("winning", 200, xdr);

                xdr.status = 500;
                xdr.responseText = "bad";
                xdr.onerror();
                expect(error).toHaveBeenCalledWith("bad", 500, xdr);
            });

            it("forces the protocol to match", function(){
                var url = (test_server.cors).replace("http:","https:")+"/library/ajax/post/success";

                var xdr = jasmine.createSpyObj('xdr', ['open', 'setRequestHeader', 'send']);
                window.XDomainRequest = function(){return xdr;};

                //to block the withCredentials check
                var xhr = jasmine.createSpy('dummy_xhr');

                var success = jasmine.createSpy('success');
                var error = jasmine.createSpy('error');

                filepicker.ajax.post(url, {
                    xhr: xhr,
                    success: success,
                    error: error,
                    data: {1:["a",23]}
                });

                expect(xdr.open).toHaveBeenCalled();
                //makes url http
                expect(xdr.open.calls[0].args[0]).toEqual("POST");
                expect(xdr.open.calls[0].args[1]).toMatch('http://');
            });

            it("maps other http commands to POST", function(){
                var url = test_server.cors+"/library/ajax/delete/success";

                var xdr = jasmine.createSpyObj('xdr', ['open', 'setRequestHeader', 'send']);
                window.XDomainRequest = function(){return xdr;};

                //to block the withCredentials check
                var xhr = jasmine.createSpy('dummy_xhr');

                var success = jasmine.createSpy('success');
                var error = jasmine.createSpy('error');

                filepicker.ajax.request(url, {
                    method: "DELETE",
                    xhr: xhr,
                    success: success,
                    error: error,
                    data: {1:["a",23]}
                });

                expect(xdr.open).toHaveBeenCalled();
                //makes method POST and sends method in POST
                expect(xdr.open.calls[0].args[0]).toEqual("POST");
                expect(xdr.open.calls[0].args[1]).toMatch(url);
                expect(xdr.send).toHaveBeenCalledWith("1[0]=a&1[1]=23&_method=DELETE");
            });
        });
    }
});
