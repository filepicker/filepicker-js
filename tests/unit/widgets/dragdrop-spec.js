describe("The Drag-Drop library", function(){
    it("can determine if dragdrop is enabled", function(){
        expect(filepicker.dragdrop.enabled()).toBe(window.test.features.dragdrop);
        
        //we check that draggable is in document.createElement("span"), so fake that out
        spyOn(document, "createElement").and.returnValue({});
        expect(filepicker.dragdrop.enabled()).toBe(false);
    });

    it("will fail if dragdrop is not enabled", function(){
        //we check that draggable is in document.createElement("span"), so fake that out
        spyOn(document, "createElement").and.returnValue({});
        spyOn(console, "error");
        expect(filepicker.dragdrop.makeDropPane({}, {})).toBe(false);
        expect(console.error).toHaveBeenCalledWith("Your browser doesn't support drag-drop functionality");
    });

    it("will fail if an invalid div is passed in", function(){
        var test1 = function(){
            filepicker.dragdrop.makeDropPane();
        };

        var test2 = function(){
            //not in document
            filepicker.dragdrop.makeDropPane(document.getElementById("blah1234"));
        };
        expect(test1).toThrow();
        expect(test2).toThrow();
    });
    
    if (window.test.features.dragdrop) {

        function getTestDiv(){
            var pane = document.createElement("div");
            pane.appendChild(document.createTextNode("Test"));
            document.getElementsByTagName('body')[0].appendChild(pane);
            return pane;
        };

        it("fails on empty uploads", function(){
            var pane = getTestDiv();
            var success = jasmine.createSpy("success");
            var error = jasmine.createSpy("error");
            var progress = jasmine.createSpy("progress");
            var onstart = jasmine.createSpy("onstart");

            filepicker.dragdrop.makeDropPane(pane, {
                onStart: onstart,
                onSuccess: success,
                onError: error,
                onProgress: progress
            });

            var e = document.createEvent('Event');
            e.initEvent("drop", true, false);
            e.dataTransfer = {files: []};
            pane.dispatchEvent(e);
            expect(onstart).not.toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("NoFilesFound", "No files uploaded");
            pane.remove();
        });

        it("fails on uploading folders", function(){
            var pane = getTestDiv();
            var success = jasmine.createSpy("success");
            var error = jasmine.createSpy("error");
            var progress = jasmine.createSpy("progress");
            var onstart = jasmine.createSpy("onstart");

            filepicker.dragdrop.makeDropPane(pane, {
                onStart: onstart,
                onSuccess: success,
                onError: error,
                onProgress: progress
            });

            var e = document.createEvent('Event');
            e.initEvent("drop", true, false);
            var item = {};
            item.webkitGetAsEntry = jasmine.createSpy("getAsEntry").and.returnValue({isDirectory: true});
            e.dataTransfer = {items: [item]};
            pane.dispatchEvent(e);
            expect(onstart).not.toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("WrongType", "Uploading a folder is not allowed");
            pane.remove();
        });
        it("can process single uploads", function(){
            var pane = getTestDiv();
            var success = jasmine.createSpy("success");
            var error = jasmine.createSpy("error");
            var progress = jasmine.createSpy("progress");
            var onstart = jasmine.createSpy("onstart");

            filepicker.dragdrop.makeDropPane(pane, {
                onStart: onstart,
                onSuccess: success,
                onError: error,
                onProgress: progress,
                multiple: false
            });

            var e = document.createEvent('Event');
            e.initEvent("drop", true, false);
            var file = {
                name: "test.txt",
                size: 234,
                type: "text/plain"
            };

            e.dataTransfer = {files: [file]};
            var result = {
                url: "http://www.filepicker.io/api/file/blah2",
                type: file.type,
                name: file.name,
                size: file.size
            };

            spyOn(filepicker, "store").and.callFake(function(file, options, success, error, progress){
                progress(100);
                success(result);
            });

            pane.dispatchEvent(e);
            expect(error).not.toHaveBeenCalled();
            expect(progress).toHaveBeenCalledWith(100);
            expect(success).toHaveBeenCalledWith([result]);
            pane.remove();
        });

        it("will error if multiple are dropped on a single", function(){
            var pane = getTestDiv();
            var success = jasmine.createSpy("success");
            var error = jasmine.createSpy("error");
            var progress = jasmine.createSpy("progress");
            var onstart = jasmine.createSpy("onstart");

            filepicker.dragdrop.makeDropPane(pane, {
                onStart: onstart,
                onSuccess: success,
                onError: error,
                onProgress: progress,
                multiple: false
            });

            var e = document.createEvent('Event');
            e.initEvent("drop", true, false);
            var file = {
                name: "test.txt",
                size: 234,
                type: "text/plain"
            };

            //Sending 3
            e.dataTransfer = {files: [file, file, file]};

            pane.dispatchEvent(e);
            expect(error).toHaveBeenCalledWith("TooManyFiles","Only one file at a time");
            expect(progress).not.toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
            pane.remove();
        });

        it("can process multiple uploads", function(){
            var pane = getTestDiv();
            var success = jasmine.createSpy("success");
            var error = jasmine.createSpy("error");
            var progress = jasmine.createSpy("progress");
            var onstart = jasmine.createSpy("onstart");

            filepicker.dragdrop.makeDropPane(pane, {
                onStart: onstart,
                onSuccess: success,
                onError: error,
                onProgress: progress,
                multiple: true
            });

            var e = document.createEvent('Event');
            e.initEvent("drop", true, false);
            var file1 = {
                name: "test.txt",
                size: 234,
                type: "text/plain"
            };
            var file2 = {
                name: "test2.csv",
                size: 456,
                type: "text/csv"
            };

            e.dataTransfer = {files: [file1, file2]};
            var result1 = {
                url: "http://www.filepicker.io/api/file/blah3",
                type: file1.type,
                name: file1.name,
                size: file1.size
            };
            var result2 = {
                url: "http://www.filepicker.io/api/file/blah4",
                type: file2.type,
                name: file2.name,
                size: file2.size
            };

            spyOn(filepicker, "store").and.callFake(function(file, options, success, error, progress){
                progress(100);
                if (file == file1) {
                    success(result1);
                } else if (file == file2) {
                    success(result2);
                } else {
                    error();
                }
            });
            pane.dispatchEvent(e);
            expect(error).not.toHaveBeenCalled();
            expect(progress).toHaveBeenCalledWith(50);
            expect(progress).toHaveBeenCalledWith(100);
            expect(success).toHaveBeenCalledWith([result1, result2]);
            pane.remove();
        });

        it("can handle drag enter and leave events", function(){

            var pane = getTestDiv();
            var dragEnter = jasmine.createSpy("dragEnter");
            var dragLeave = jasmine.createSpy("dragLeave");

            filepicker.dragdrop.makeDropPane(pane, {
                dragEnter: dragEnter,
                dragLeave: dragLeave
            });
            var e = document.createEvent('Event');
            e.initEvent("dragenter", true, false);
            pane.dispatchEvent(e);

            expect(dragEnter).toHaveBeenCalled();
            expect(dragLeave).not.toHaveBeenCalled();
            //Next, fire dragleave
            dragEnter.calls.reset();
            e = document.createEvent('Event');
            e.initEvent("dragleave", true, false);
            pane.dispatchEvent(e);
            expect(dragEnter).not.toHaveBeenCalled();
            expect(dragLeave).toHaveBeenCalled();
            dragLeave.calls.reset();

            //Next, fire dragover
            e = document.createEvent('Event');
            Object.defineProperty(e, "dataTransfer", {
                configurable: true,
                writable: true,
                value : {}
            });
            e.initEvent("dragover", true, false);
            pane.dispatchEvent(e);
            expect(dragEnter).not.toHaveBeenCalled();
            expect(dragLeave).not.toHaveBeenCalled();
            pane.remove();
        });

        it("can filter on mimetypes", function(){
            var pane = getTestDiv();
            var success = jasmine.createSpy("success");
            var error = jasmine.createSpy("error");
            var progress = jasmine.createSpy("progress");
            var onstart = jasmine.createSpy("onstart");

            filepicker.dragdrop.makeDropPane(pane, {
                onStart: onstart,
                onSuccess: success,
                onError: error,
                onProgress: progress,
                mimetypes: "image/*,text/csv"
            });

            var e = document.createEvent('Event');
            e.initEvent("drop", true, false);
            var file = {
                name: 'test.txt',
                type: 'text/plain',
                size: 432
            };
            e.dataTransfer = {files: [file]};
            pane.dispatchEvent(e);

            expect(onstart).not.toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("WrongType", "test.txt isn't the right type of file");
            pane.remove();
        });

        it("can filter on extensions", function(){
            var pane = getTestDiv();
            var success = jasmine.createSpy("success");
            var error = jasmine.createSpy("error");
            var progress = jasmine.createSpy("progress");
            var onstart = jasmine.createSpy("onstart");

            filepicker.dragdrop.makeDropPane(pane, {
                onStart: onstart,
                onSuccess: success,
                onError: error,
                onProgress: progress,
                extensions: ".png,.csv"
            });

            var e = document.createEvent('Event');
            e.initEvent("drop", true, false);
            var file = {
                name: 'test.txt',
                type: 'text/plain',
                size: 432
            };
            e.dataTransfer = {files: [file]};

            pane.dispatchEvent(e);
            expect(onstart).not.toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("WrongType", "test.txt isn't the right type of file");
            pane.remove();
        });

        it("can filter on size", function(){
            var pane = getTestDiv();
            var success = jasmine.createSpy("success");
            var error = jasmine.createSpy("error");
            var progress = jasmine.createSpy("progress");
            var onstart = jasmine.createSpy("onstart");

            filepicker.dragdrop.makeDropPane(pane, {
                onStart: onstart,
                onSuccess: success,
                onError: error,
                onProgress: progress,
                maxSize: 400
            });

            var e = document.createEvent('Event');
            e.initEvent("drop", true, false);
            var file = {
                name: 'test.txt',
                type: 'text/plain',
                size: 432
            };
            e.dataTransfer = {files: [file]};
            pane.dispatchEvent(e);
           
            expect(onstart).not.toHaveBeenCalled();
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("WrongSize", "test.txt is too large (432 Bytes)");
            pane.remove();
        });

        it("handles upload errors gracefully", function(){
            var pane = getTestDiv();
            var success = jasmine.createSpy("success");
            var error = jasmine.createSpy("error");
            var progress = jasmine.createSpy("progress");
            var onstart = jasmine.createSpy("onstart");

            filepicker.dragdrop.makeDropPane(pane, {
                onStart: onstart,
                onSuccess: success,
                onError: error,
                onProgress: progress,
                multiple: false
            });

            var e = document.createEvent('Event');
            e.initEvent("drop", true, false);
            var file = {
                name: "test.txt",
                size: 234,
                type: "text/plain"
            };

            e.dataTransfer = {files: [file]};
            spyOn(filepicker, "store").and.callFake(function(file, options, success, error, progress){
                error("Internal server error (ish)");
            });
            pane.dispatchEvent(e);
            expect(error).toHaveBeenCalledWith("UploadError", "Internal server error (ish)");
            expect(success).not.toHaveBeenCalled();
            pane.remove();
        });
    }
});
