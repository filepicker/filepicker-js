describe("The Conversions library", function(){


    // beforeEach(function() {
    //     jasmine.Ajax.install();
    // });

    // afterEach(function() {
    //   jasmine.Ajax.uninstall();
    // });


    it("can perform basic conversions", function(){
        var fpurl = "/library/convert/success",
            success, error, progress;

        var request = window.CONVERSION_RESPONSES[fpurl];

        success = jasmine.createSpy('success');
        error = jasmine.createSpy('error');
        progress = jasmine.createSpy('progress');

        // jasmine.Ajax.stubRequest(request.regex).and.returnValue(request.response);

        filepicker.conversions.convert(fpurl, {width: 64, height: 128}, success, error, progress);

        expect(success).toHaveBeenCalledWith({
            url: "https://www.filepicker.io/api/file/blah",
            filename:"test.png",
            mimetype:"image/jpeg",
            size: 9344,
            key: undefined,
            isWriteable: false
        });

        expect(error).not.toHaveBeenCalled();
        expect(progress).toHaveBeenCalledWith(100);

    });


    it("validates conversion parameters", function(){
        var fpurl = "/library/convert/success";

        var valid_params = {
            width: 30,
            height: 29,
            fit: 'clip',
            format: 'jpg',
            watermark: 'http://www.google.com',
            watermark_size: 20,
            watermark_position: 'top',
            align: 'top',
            crop: [1,2,50,28],
            quality: 84,
            text: 'cool',
            text_font: 'impact',
            text_size: 20,
            text_color: 'red',
            text_align: 'top',
            text_padding: 10,
            policy: '3jkdsj834j',
            signature: '39kj83abc8',
            storeLocation: 'S3'
        };

        var invalid_params = {
            invalid: "param",
            dwidth: "20",
            height: "balh",
            fit: 20,
            format: [],
            watermark: 5,
            watermark_size: "big",
            watermark_position: 0,
            align: [0,0],
            crop: 2,
            quality: "84",
            text: {MOAR:"text"},
            text_font: 200,
            text_size: "big",
            text_color: [128,100,54],
            text_align: 0,
            text_padding: "10px",
            policy: {12:34},
            signature: 23,
            storeLocation: 3
        };


        var testFn;
        for (param in valid_params) {
            testFn = function(){
                var options = {};
                options[param] = valid_params[param];
                filepicker.conversions.convert(fpurl, options, function(){});
            };

            expect(testFn).not.toThrow();
        }

        for (param in invalid_params) {
            testFn = function(){
                var options = {};
                options[param] = invalid_params[param];
                filepicker.conversions.convert(fpurl, options, function(){});
            };

            expect(testFn).toThrow();

        }
    });

    it("handles errors gracefully", function(){

        var do_convert = function(fpurl, onDone) {
            success = jasmine.createSpy('success');
            error = jasmine.createSpy('error');
            progress = jasmine.createSpy('progress');

            var request = window.CONVERSION_RESPONSES[fpurl];

            // jasmine.Ajax.stubRequest(request.regex).and.returnValue(request.response);

            filepicker.conversions.convert(fpurl, {width: 64, height: 128}, success, error, progress);

            onDone(success, error, progress);
        };

        var url = "/library/convert/not_found";
        do_convert(url, function(success, error, progress){
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalled();

            var fperror = error.calls.allArgs()[0][0];

            expect(fperror instanceof filepicker.errors.FPError).toBe(true);
            expect(fperror.code).toEqual(141);
            expect(progress).toHaveBeenCalledWith(100);
        });
        
        url = "/library/convert/bad_params";
        do_convert(url, function(success, error, progress){
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalled();
            var fperror = error.calls.allArgs()[0][0];
            expect(fperror instanceof filepicker.errors.FPError).toBe(true);
            expect(fperror.code).toEqual(142);
            expect(progress).toHaveBeenCalledWith(100);
        });

        url = "/library/convert/not_authed";
        do_convert(url, function(success, error, progress){
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalled();
            var fperror = error.calls.allArgs()[0][0];
            expect(fperror instanceof filepicker.errors.FPError).toBe(true);
            expect(fperror.code).toEqual(403);
            expect(progress).toHaveBeenCalledWith(100);
        });

        url = "/library/convert/error";
        do_convert(url, function(success, error, progress){
            expect(success).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalled();
            var fperror = error.calls.allArgs()[0][0];
            expect(fperror instanceof filepicker.errors.FPError).toBe(true);
            expect(fperror.code).toEqual(143);
            expect(progress).toHaveBeenCalledWith(100);
        });
    });
});
