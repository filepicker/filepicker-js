describe("The errors module", function(){
    it("has FPError objects", function(){
        var e = filepicker.errors.FPError(10);
        expect(e.code).toEqual(10);
        expect(e.toString()).toEqual("FPError 10. Include filepicker_debug.js for more info");
    });

    it("prints errors to console in debug mode", function(){
        //need to be on the globals
        window.filepicker.debug = true;
        window.filepicker.error_map = {
            11: {
                message: "test error",
                moreInfo: "error_url"
            }
        };

        var e = filepicker.errors.FPError(11);
        expect(e.code).toEqual(11);
        expect(e.toString()).toEqual("FPError 11: test error. For help, see error_url");

        window.filepicker.debug = false;
    });

    it("has a default error handler", function(){
        spyOn(window.console, "error");
        var e = filepicker.errors.FPError(12);

        window.filepicker.debug = true;
        filepicker.errors.handleError(e);
        expect(window.console.error).toHaveBeenCalledWith("FPError 12. Include filepicker_debug.js for more info");
        window.filepicker.debug = false;
    });
});
