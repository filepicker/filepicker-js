describe("The exporter module", function(){
    it("checks for third party cookies", function(){
        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = undefined;
        
        runs(function(){
            spyOn(filepicker.cookies, "checkThirdParty").and.callFake(function(callback){
                setTimeout(function(){
                    filepicker.cookies.THIRD_PARTY_COOKIES = true;
                    callback();
                }, 10);
            });
            //to prevent modal
            spyOn(filepicker.window, "open");
            spyOn(filepicker.urls, "constructExportUrl");

            var url = "http://dummyUrl.com";
            var options = {};
            var success = jasmine.createSpy("success");
            var error = jasmine.createSpy("error");

            filepicker.exporter.createExporter(url, options, success, error);
            //not called on this run
            expect(filepicker.window.open).not.toHaveBeenCalled();
        });

        waitsFor(function(){
            return filepicker.cookies.THIRD_PARTY_COOKIES !== undefined;
        }, "third party cookies to be set", 100);

        runs(function(){
            expect(filepicker.cookies.checkThirdParty).toHaveBeenCalled();
            //now we call it
            expect(filepicker.window.open).toHaveBeenCalled();
            //reset
            filepicker.cookies.THIRD_PARTY_COOKIES = cookies;
        });
    });

    it("can create an exporter", function(){
        var url = "http://dummyUrl.com";
        var options = {
            openTo:"GOOGLE_DRIVE",
            suggestedFilename: "test.txt"
        };
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        spyOn(filepicker.urls, "constructExportUrl").andReturn("export_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.exporter.createExporter(url, options, success, error);
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;

        expect(filepicker.urls.constructExportUrl).toHaveBeenCalledWith(
            url, options, jasmine.any(String));
        var container = window.isPhantom ? "window" : "modal";
        expect(filepicker.window.open).toHaveBeenCalledWith(
            container, "export_url", jasmine.any(Function));

        //firing callbacks
        var resp = {
            url: "http://www.filepicker.io/api/file/blah5",
            data: {
                filename: "test.txt",
                type: "text/plain",
                size: 1234
            }
        };

        spyOn(filepicker.modal, "close");
        filepicker.handlers.run({
            id: filepicker.urls.constructExportUrl.calls[0].args[2],
            type: "filepickerUrl",
            payload: resp
        });
        expect(success).toHaveBeenCalledWith({
            url: resp.url,
            filename: resp.data.filename,
            mimetype: resp.data.type,
            size: resp.data.size,
            isWriteable: true
        });
        expect(filepicker.modal.close).toHaveBeenCalled();
    });

    it("jumps out early in debug mode", function(){
        var url = "http://dummyUrl.com";
        var options = {
            openTo:"GOOGLE_DRIVE",
            suggestedFilename: "test.txt",
            debug: true
        };

        var success, error;
        runs(function(){
            success = jasmine.createSpy("success");
            error = jasmine.createSpy("error");

            spyOn(filepicker.window, "open");

            filepicker.exporter.createExporter(url, options, success, error);
        });
        waitsFor(function(){
            return success.wasCalled;
        }, "the success callback to occur", 50); //should be fast

        runs(function(){
            expect(success).toHaveBeenCalled();
            var resp = success.calls[0].args[0];
            expect(resp.url).toMatch("https://www.filepicker.io/api/file/");
            expect(resp.filename).toEqual("test.png");
            expect(resp.mimetype).toEqual("image/png");
            expect(resp.size).toEqual(58979);
        });
    });

    it("normalizes options", function(){
        var url = "http://dummyUrl.com";
        var options = {
            openTo:"GOOGLE_DRIVE",
            service: 'BOX',
            suggestedFilename: "test.txt"
        };
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        spyOn(filepicker.urls, "constructExportUrl").andReturn("export_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.exporter.createExporter(url, options, success, error);
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;

        //options is modified directly
        var container = window.isPhantom ? "window" : "modal";
        expect(options.container).toEqual(container);
        expect(options.openTo).toEqual(filepicker.services["GOOGLE_DRIVE"]);
        expect(options.services).toEqual([filepicker.services["BOX"]]);

        //can't have both extension and mimetype
        options.mimetype = "image/png";
        options.extension = ".jpg";

        var test = function(){
            filepicker.exporter.createExporter(url, options, success, error);
        };

        cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        expect(test).toThrow();
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;
    });

    it("fires an error on close", function(){
        var url = "http://dummyUrl.com";
        var options = {
            openTo:"GOOGLE_DRIVE",
            suggestedFilename: "test.txt"
        };
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        spyOn(filepicker.urls, "constructExportUrl").andReturn("export_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.exporter.createExporter(url, options, success, error);
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;

        expect(filepicker.urls.constructExportUrl).toHaveBeenCalledWith(
            url, options, jasmine.any(String));
        var container = window.isPhantom ? "window" : "modal";
        expect(filepicker.window.open).toHaveBeenCalledWith(
            container, "export_url", jasmine.any(Function));

        //firing onclose
        var onclose = filepicker.window.open.calls[0].args[2];
        onclose();
        expect(success).not.toHaveBeenCalled();
        expect(error).toHaveBeenCalled();
        expect(error.calls[0].args[0].code).toEqual(131);
    });

    it("won't fire multiple callbacks", function(){
        var url = "http://dummyUrl.com";
        var options = {
            openTo:"GOOGLE_DRIVE",
            suggestedFilename: "test.txt"
        };
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        spyOn(filepicker.urls, "constructExportUrl").andReturn("export_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.exporter.createExporter(url, options, success, error);
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;

        expect(filepicker.urls.constructExportUrl).toHaveBeenCalledWith(
            url, options, jasmine.any(String));
        var container = window.isPhantom ? "window" : "modal";
        expect(filepicker.window.open).toHaveBeenCalledWith(
            container, "export_url", jasmine.any(Function));

        filepicker.handlers.run({
            id: filepicker.urls.constructExportUrl.calls[0].args[2],
            type: "filepickerUrl",
            error: "bad request"
        });

        expect(success).not.toHaveBeenCalled();
        expect(error).toHaveBeenCalled();
        expect(error.calls[0].args[0].code).toEqual(132);
        //firing onclose - shouldn't cause an error
        var onclose = filepicker.window.open.calls[0].args[2];
        onclose();
        expect(success).not.toHaveBeenCalled();
        expect(error.calls.length).toEqual(1); //not two
    });

    it("will open in a window if needed", function(){
        var url = "http://dummyUrl.com";
        var options = {
            container: "modal"
        };
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        //force a window, not modal
        spyOn(filepicker.window, "shouldForce").andReturn(true);
        spyOn(filepicker.urls, "constructExportUrl").andReturn("export_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.exporter.createExporter(url, options, success, error);
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;

        expect(filepicker.window.open).toHaveBeenCalledWith(
            "window", "export_url", jasmine.any(Function));
    });
});
