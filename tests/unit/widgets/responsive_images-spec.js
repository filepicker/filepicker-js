describe("The responsive widgets module", function(){
    var origin = window.location.protocol + '//' + window.location.host,
        defaultSrc = origin + '/test';

    function createImage(){
        var image = document.createElement('img');
        image.setAttribute('src', defaultSrc);
        document.getElementsByTagName('body')[0].appendChild(image);
        return image;
    }

    it("should be able to check DOM element dims", function(){
        expect(
            filepicker.responsiveImages.getElementDims(createImage())
        ).toEqual({ width: 24, height: 24 });
    });


    it("should be able to replace Image tag source value", function(){
        var image = createImage();
        expect(image.src).toEqual(defaultSrc);

    });

});
