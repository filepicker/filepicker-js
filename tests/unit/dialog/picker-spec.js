describe("The picker module", function(){
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
        spyOn(filepicker.urls, "constructPickUrl");

        var options = {};
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        filepicker.picker.createPicker(options, success, error, false);
        //not called on this run
        expect(filepicker.window.open).not.toHaveBeenCalled();

        expect(filepicker.cookies.checkThirdParty).toHaveBeenCalled();
        
        //now we call it

        window.setTimeout(function(){
            expect(filepicker.window.open).toHaveBeenCalled();
            //reset
            filepicker.cookies.THIRD_PARTY_COOKIES = cookies;
            done();
        },100);
    });

    it("can create a picker", function(done){
        var options = {
            openTo:"GOOGLE_DRIVE",
            mimetype: "image/*"
        };
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        
        spyOn(filepicker.urls, "constructPickUrl").and.returnValue("pick_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.picker.createPicker(options, onSuccess, error, false);
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;

        expect(filepicker.urls.constructPickUrl).toHaveBeenCalledWith(
            options, jasmine.any(String), false);
        var container = window.isPhantom ? "window" : "modal";

        expect(filepicker.window.open).toHaveBeenCalledWith(
            container, "pick_url", jasmine.any(Function));

        //firing callbacks
        var resp = {
            url: "http://www.filepicker.io/api/file/blah6",
            data: {
                filename: "test.txt",
                type: "text/plain",
                size: 1234,
                key: "8904ksdf3_test.txt"
            }
        };
        filepicker.handlers.run({
            id: filepicker.urls.constructPickUrl.calls.allArgs()[0][1],
            type: "filepickerUrl",
            payload: resp
        });
        function onSuccess(Blob){
            expect(Blob).toEqual({
                url: resp.url,
                filename: resp.data.filename,
                mimetype: resp.data.type,
                size: resp.data.size,
                key: resp.data.key,
                isWriteable: true
            });
            done();
        }
    });

    it("can create a multi-picker", function(){
        var options = {
            openTo:"GOOGLE_DRIVE",
            mimetype: "image/*"
        };
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        spyOn(filepicker.urls, "constructPickUrl").and.returnValue("pick_multi_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.picker.createPicker(options, success, error, true);
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;

        expect(filepicker.urls.constructPickUrl).toHaveBeenCalledWith(
            options, jasmine.any(String), true);
        var container = window.isPhantom ? "window" : "modal";
        expect(filepicker.window.open).toHaveBeenCalledWith(
            container, "pick_multi_url", jasmine.any(Function));

        //firing callbacks
        var resp = {
            url: "http://www.filepicker.io/api/file/blah5",
            data: {
                filename: "test.txt",
                type: "text/plain",
                size: 1234,
                key: "8904ksdf3_test.txt"
            }
        };

        spyOn(filepicker.modal, "close");
        filepicker.handlers.run({
            id: filepicker.urls.constructPickUrl.calls.allArgs()[0][1],
            type: "filepickerUrl",
            payload: resp
        });
        expect(success).toHaveBeenCalledWith([{
            url: resp.url,
            filename: resp.data.filename,
            mimetype: resp.data.type,
            size: resp.data.size,
            key: resp.data.key,
            isWriteable: true
        }]);
        expect(filepicker.modal.close).toHaveBeenCalled();
    });

    it("jumps out early in debug mode", function(){
        var options = {
            debug: true
        };

        var success, error;

        success = onSuccess;
        error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");

        filepicker.picker.createPicker(options, success, error, false);

        function onSuccess(resp){
            expect(resp.url).toMatch("https://www.filepicker.io/api/file/");
            expect(resp.filename).toEqual("test.png");
            expect(resp.mimetype).toEqual("image/png");
            expect(resp.size).toEqual(58979);
        }

    });

    it("normalizes options", function(){
        var options = {
            openTo:"GOOGLE_DRIVE",
            service: 'BOX',
            extension: ".png"
        };
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        spyOn(filepicker.urls, "constructPickUrl").and.returnValue("pick_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.picker.createPicker(options, success, error, false);
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
            filepicker.picker.createPicker(options, success, error, false);
        };

        cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        expect(test).toThrow();
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;
    });

    it("fires an error on close", function(){
        var options = {};
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        spyOn(filepicker.urls, "constructPickUrl").and.returnValue("pick_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.picker.createPicker(options, success, error, false);
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;

        expect(filepicker.urls.constructPickUrl).toHaveBeenCalledWith(
            options, jasmine.any(String), false);
        var container = window.isPhantom ? "window" : "modal";
        expect(filepicker.window.open).toHaveBeenCalledWith(
            container, "pick_url", jasmine.any(Function));

        //firing onclose
        var onclose = filepicker.window.open.calls.allArgs()[0][2];
        onclose();
        expect(success).not.toHaveBeenCalled();
        expect(error).toHaveBeenCalled();
        expect(error.calls.allArgs()[0][0].code).toEqual(101);
    });

    it("keeps track of whether uploading is occurring", function(){
        var options = {};
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        spyOn(filepicker.urls, "constructPickUrl").and.returnValue("pick_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.picker.createPicker(options, success, error, false);
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;

        expect(filepicker.urls.constructPickUrl).toHaveBeenCalledWith(
            options, jasmine.any(String), false);
        var container = window.isPhantom ? "window" : "modal";
        expect(filepicker.window.open).toHaveBeenCalledWith(
            container, "pick_url", jasmine.any(Function));

        //firing the "upload" event
        var id = filepicker.urls.constructPickUrl.calls.allArgs()[0][1];
        filepicker.handlers.run({
            id: id+"-upload",
            type: "uploading",
            payload: true
        });
        expect(success).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
        expect(filepicker.uploading).toBe(true);

        //firing success
        var resp = {
            url: "http://www.filepicker.io/api/file/blah5",
            data: {
                filename: "test.txt",
                type: "text/plain",
                size: 1234,
                key: "8904ksdf3_test.txt"
            }
        };

        spyOn(filepicker.modal, "close");
        filepicker.handlers.run({
            id: id,
            type: "filepickerUrl",
            payload: resp
        });
        expect(success).toHaveBeenCalled();
        expect(filepicker.modal.close).toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
        expect(filepicker.uploading).toBe(false);
    });

    it("can fire multiple callbacks, but not onclose", function(){
        var options = {
            openTo:"GOOGLE_DRIVE",
            mimetype: "image/*"
        };
        var success = jasmine.createSpy("success");
        var error = jasmine.createSpy("error");

        spyOn(filepicker.window, "open");
        spyOn(filepicker.urls, "constructPickUrl").and.returnValue("pick_url");

        var cookies = filepicker.cookies.THIRD_PARTY_COOKIES;
        filepicker.cookies.THIRD_PARTY_COOKIES = true;
        filepicker.picker.createPicker(options, success, error, false);
        filepicker.cookies.THIRD_PARTY_COOKIES = cookies;

        expect(filepicker.urls.constructPickUrl).toHaveBeenCalledWith(
            options, jasmine.any(String), false);
        var container = window.isPhantom ? "window" : "modal";
        expect(filepicker.window.open).toHaveBeenCalledWith(
            container, "pick_url", jasmine.any(Function));

        //simulate multiple picks
        //firing success
        var resp = {
            url: "http://www.filepicker.io/api/file/blah5",
            data: {
                filename: "test.txt",
                type: "text/plain",
                size: 1234,
                key: "8904ksdf3_test.txt"
            }
        };

        var id = filepicker.urls.constructPickUrl.calls.allArgs()[0][1];
        filepicker.handlers.run({
            id: id,
            type: "filepickerUrl",
            payload: resp
        });
        filepicker.handlers.run({
            id: id,
            type: "filepickerUrl",
            payload: resp
        });
        filepicker.handlers.run({
            id: id,
            type: "filepickerUrl",
            error: "bad request"
        });

        expect(success).toHaveBeenCalled();
        expect(success.calls.allArgs().length).toEqual(2);
        expect(error).toHaveBeenCalled();
        expect(error.calls.allArgs().length).toEqual(1);
        expect(error.calls.allArgs()[0][0].code).toEqual(102);
        //firing onclose - shouldn't cause an error
        var onclose = filepicker.window.open.calls.allArgs()[0][2];
        onclose();
        expect(success.calls.allArgs().length).toEqual(2); //not 3
        expect(error.calls.allArgs().length).toEqual(1); //not two
    });
});
