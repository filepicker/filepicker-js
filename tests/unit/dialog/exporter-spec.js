describe("The exporter module", function(){
    it("checks for third party cookies", function(done){
        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = undefined;
        
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

        expect(filepicker.cookies.checkThirdParty).toHaveBeenCalled();
        //now we call it
        window.setTimeout(function(){
            expect(filepicker.window.open).toHaveBeenCalled();
            //reset
            filepicker.cookies.THIRD_PARTY_COOKIES = cookies;
            done();
        },1000);
    });

    it("can create an exporter", function(done){
        var url = "http://dummyUrl.com";
        var options = {
            openTo:"GOOGLE_DRIVE",
            suggestedFilename: "test.txt"
        };

        var error = jasmine.createSpy("error");
        var success = onSuccess;
        spyOn(filepicker.window, "open");
        spyOn(filepicker.urls, "constructExportUrl").and.returnValue("export_url");

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
                size: 1234,
                client:'computer'
            }
        };

        spyOn(filepicker.modal, "close");
        filepicker.handlers.run({
            id: filepicker.urls.constructExportUrl.calls.allArgs()[0][2],
            type: "filepickerUrl",
            payload: resp
        });

        function onSuccess(Blob){
            expect(Blob).toEqual({
                url: resp.url,
                filename: resp.data.filename,
                mimetype: resp.data.type,
                size: resp.data.size,
                client:'computer',
                isWriteable: true
            });
            done();
        }

        expect(filepicker.modal.close).toHaveBeenCalled();
    });

    it("jumps out early in debug mode", function(done){
        var url = "http://dummyUrl.com";
        var options = {
            openTo:"GOOGLE_DRIVE",
            suggestedFilename: "test.txt",
            debug: true
        };

        var success, error;

        success = onSuccess;
        error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");

        filepicker.exporter.createExporter(url, options, success, error);

        function onSuccess(Blob){
            expect(Blob.url).toMatch("https://www.filepicker.io/api/file/");
            expect(Blob.filename).toEqual("test.png");
            expect(Blob.mimetype).toEqual("image/png");
            expect(Blob.size).toEqual(58979);
            done();
        }

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
        spyOn(filepicker.urls, "constructExportUrl").and.returnValue("export_url");

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
        spyOn(filepicker.urls, "constructExportUrl").and.returnValue("export_url");

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
        var onclose = filepicker.window.open.calls.allArgs()[0][2];
        onclose();
        expect(success).not.toHaveBeenCalled();
        expect(error).toHaveBeenCalled();
        expect(error.calls.allArgs()[0][0].code).toEqual(131);
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
        spyOn(filepicker.urls, "constructExportUrl").and.returnValue("export_url");

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
            id: filepicker.urls.constructExportUrl.calls.allArgs()[0][2],
            type: "filepickerUrl",
            error: "bad request"
        });

        expect(success).not.toHaveBeenCalled();
        expect(error).toHaveBeenCalled();
        expect(error.calls.allArgs()[0][0].code).toEqual(132);
        //firing onclose - shouldn't cause an error
        var onclose = filepicker.window.open.calls.allArgs()[0][2];
        onclose();
        expect(success).not.toHaveBeenCalled();
        expect(error.calls.allArgs().length).toEqual(1); //not two
    });
});
