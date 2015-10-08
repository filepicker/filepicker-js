describe("The modal module", function(){
    it("can create a modal", function(){
        var shade, onclose;
        runs(function(){
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
            expect(iframe.style.height).toMatch(/\d+px/);
            var height = parseInt(iframe.style.height.replace("px",""), 0);
            expect(height).toBeLessThan(500);
            expect(iframe.style.borderStyle).toEqual("none");
            expect(iframe.style.position).toEqual("relative");
            expect(iframe.getAttribute("frameborder")).toEqual('0');
            expect(iframe.getAttribute("marginwidth")).toEqual('0');
            expect(iframe.getAttribute("marginheight")).toEqual('0');

            //shade params
            expect(shade.style.position).toEqual("fixed");
            expect(shade.style.top).toEqual('0px');
            expect(shade.style.bottom).toEqual('0px');
            expect(shade.style.left).toEqual('0px');
            expect(shade.style.right).toEqual('0px');
            var bkgd = shade.style.backgroundColor;
            expect(bkgd === 'rgb(0, 0, 0)' || bkgd === '#000000').toBe(true);
            expect(shade.style.opacity).toEqual('0.5');
            expect(shade.style.zIndex).toBeGreaterThan(100);
            expect(shade.onclick).toEqual(jasmine.any(Function));

            //container params
            expect(container.style.position).toEqual("fixed");
            expect(container.style.padding).toEqual('10px');
            expect(container.style.top).toEqual('10px');
            expect(container.style.bottom).toEqual('auto');
            expect(container.style.left).toMatch(/\d+px/);
            expect(container.style.height).toMatch(/\d+px/);
            expect(container.style.width).toMatch(/\d+px/);
            expect(container.style.right).toEqual('auto');
            expect(container.style.zIndex).toBeGreaterThan(shade.style.zIndex);
            
            expect(iframe.parentNode).toEqual(container);
            expect(container.parentNode).toEqual(document.body);
            expect(shade.parentNode).toEqual(document.body);

            //closing by clicking the shade - don't do it immediately,
            //phantomjs is unhappy with disposing iframes that haven't
            //finished loading
        });
        waitsFor(function(){
            return window.frames[filepicker.window.WINDOW_NAME].location.href !== "";
        }, "the iframe to load", 100);

        runs(function(){
            shade.onclick();
            expect(onclose).toHaveBeenCalled();
            filepicker.modal.close();
        });
    });

    it("can close the modal", function(){
        runs(function(){
            var url = "/library/modal/basic";
            filepicker.modal.generate(url);
            expect(document.getElementById("filepicker_shade")).not.toEqual(null);
            expect(document.getElementById("filepicker_dialog_container")).not.toEqual(null);
        });
        waitsFor(function(){
            return window.frames[filepicker.window.WINDOW_NAME].location.href !== "";
        }, "the iframe to load", 1000);

        runs(function(){
            filepicker.modal.close();
            expect(document.getElementById("filepicker_shade")).toEqual(null);
            expect(document.getElementById("filepicker_dialog_container")).toEqual(null);
        });
    });

    it("prompts the user if trying to close through an upload", function(){
        runs(function(){
            spyOn(window, "confirm").andReturn(false);

            var url = "/library/modal/basic";
            filepicker.modal.generate(url);
            var shade = document.getElementById("filepicker_shade");

            filepicker.uploading = true;
            shade.onclick();
            expect(window.confirm).toHaveBeenCalled();
            //doesn't close
            expect(document.getElementById("filepicker_shade")).not.toEqual(null);
            expect(document.getElementById("filepicker_dialog_container")).not.toEqual(null);
            window.confirm.reset();

            //still doesn't
            filepicker.modal.close();
            expect(window.confirm).toHaveBeenCalled();
            expect(document.getElementById("filepicker_shade")).not.toEqual(null);
            expect(document.getElementById("filepicker_dialog_container")).not.toEqual(null);
            window.confirm.reset();
            
            //but if the user says yes...
            window.confirm.andReturn(true);
        });
        waitsFor(function(){
            return window.frames[filepicker.window.WINDOW_NAME].location.href !== "";
        }, "the iframe to load", 1000);
        runs(function(){
            filepicker.modal.close();
            expect(window.confirm).toHaveBeenCalled();
            //no more
            expect(document.getElementById("filepicker_shade")).toEqual(null);
            expect(document.getElementById("filepicker_dialog_container")).toEqual(null);
            //no longer uploading
            expect(filepicker.uploading).toBe(false);
        });
    });
});
