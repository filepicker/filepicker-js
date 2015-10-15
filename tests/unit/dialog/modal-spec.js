describe("The modal module", function(){
    it("can create a modal", function(){
        var shade, onclose;
        var url = "/library/modal/basic";
        onclose = jasmine.createSpy("onClose");
        filepicker.modal.generate(url, onclose);
        
        shade = document.getElementById("filepicker_shade");
        var container = document.getElementById("filepicker_dialog_container");
        var iframe = document.getElementById(filepicker.window.WINDOW_NAME);
        
        //iframe params
        var origin = window.location.protocol + '//' + window.location.host;
        expect(iframe.src).toEqual(origin+url);
        expect(iframe.name).toEqual(filepicker.window.WINDOW_NAME);
        expect(iframe.style.width).toEqual("100%");
        expect(iframe.style.height).toEqual("100%");

        expect(iframe.style.borderStyle).toEqual("none");
        expect(iframe.style.position).toEqual("relative");
        expect(iframe.getAttribute("frameborder")).toEqual('0');
        expect(iframe.getAttribute("marginwidth")).toEqual('0');
        expect(iframe.getAttribute("marginheight")).toEqual('0');
        
        expect(iframe.parentNode).toEqual(container);
        expect(container.parentNode).toEqual(shade);
        expect(shade.parentNode).toEqual(document.body);

        //closing by clicking the shade - don't do it immediately,
        //phantomjs is unhappy with disposing iframes that haven't
        //finished loading

        window.frames[filepicker.window.WINDOW_NAME].location.href !== "";

        shade.onclick();
        expect(onclose).toHaveBeenCalled();
        filepicker.modal.close();
    });

    it("can close the modal", function(){
        var url = "/library/modal/basic";
        filepicker.modal.generate(url);
        expect(document.getElementById("filepicker_shade")).not.toEqual(null);
        expect(document.getElementById("filepicker_dialog_container")).not.toEqual(null);
        
        filepicker.modal.close();

        expect(document.getElementById("filepicker_shade")).toEqual(null);
        expect(document.getElementById("filepicker_dialog_container")).toEqual(null);
    });

    it("prompts the user if trying to close through an upload", function(){
        spyOn(window, "confirm").and.returnValue(false);

        var url = "/library/modal/basic";
        filepicker.modal.generate(url);
        var shade = document.getElementById("filepicker_shade");

        filepicker.uploading = true;
        shade.onclick();
        expect(window.confirm).toHaveBeenCalled();
        //doesn't close
        expect(document.getElementById("filepicker_shade")).not.toEqual(null);
        expect(document.getElementById("filepicker_dialog_container")).not.toEqual(null);
        window.confirm.calls.reset();

        //still doesn't
        filepicker.modal.close();
        expect(window.confirm).toHaveBeenCalled();
        expect(document.getElementById("filepicker_shade")).not.toEqual(null);
        expect(document.getElementById("filepicker_dialog_container")).not.toEqual(null);
        window.confirm.calls.reset();
        
        //but if the user says yes...
        window.confirm.and.returnValue(true);

        filepicker.modal.close();
        expect(window.confirm).toHaveBeenCalled();
        //no more
        expect(document.getElementById("filepicker_shade")).toEqual(null);
        expect(document.getElementById("filepicker_dialog_container")).toEqual(null);
        //no longer uploading
        expect(filepicker.uploading).toBe(false);
    });
});
