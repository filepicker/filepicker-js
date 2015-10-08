describe("The setup code", function(){
    it("should enable the filepicker object to be extended with private functions", function(){
        //root package, private -- note we use "window.filepicker" to get outer
        window.filepicker.extend(function(){
            return {
                test_private: 1
            };
        });
        //should show up in inner context, not on outer
        expect(filepicker.test_private).toEqual(1);
        expect(window.filepicker.test_private).not.toBeDefined();
    });

    it("should enable the filepicker object to be extended with public functions", function(){
        //root package, public -- note we use "window.filepicker" to get outer
        window.filepicker.extend(function(){
            return {
                test_public: 2
            };
        }, true);
        //should show up in both
        expect(filepicker.test_public).toEqual(2);
        expect(window.filepicker.test_public).toEqual(2);
    });

    it("should enable the filepicker object to be extended with on subpackages", function(){
        //subpackage, public -- note we use "window.filepicker" to get outer
        window.filepicker.extend("test.sub", function(){
            return {
                is_public: 3
            };
        }, true);
        //should show up in both
        expect(filepicker.test.sub.is_public).toEqual(3);
        expect(window.filepicker.test.sub.is_public).toEqual(3);
    });

    it("should pass the filepicker context into attached functions", function(){
        window.filepicker.extend(function(){
            expect(this).toEqual(filepicker);
            var test_func = function(){
                expect(this).toEqual(filepicker);
                return 5;
            };
            return {
                test_func: test_func
            };
        });
        expect(filepicker.test_func()).toEqual(5);
    });

    it("should enable internal calls on the filepicker object", function(){
        window.filepicker.internal(function(){
            expect(this).toEqual(filepicker);
        });
    });
});
