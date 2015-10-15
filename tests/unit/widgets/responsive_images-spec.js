describe("The responsive widgets module", function(){
    var origin = window.location.protocol + '//' + window.location.host,
        defaultSrc = 'https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY',
        changedSrc = 'https://www.filepicker.io/api/file/lYoRE2ehRniSoCaAx1p2',
        processBase = 'http://process.filepickercdn.com/l5uQ3k7FQ5GoYCHyTdZV/',
        processUrl = 'http://process.filepickercdn.com/l5uQ3k7FQ5GoYCHyTdZV/resize=width:615,height:100/other=test:testValue/https://www.filepicker.io/api/file/daiHESM6QziofNYWl7rY';



    function createEmptyImage(){
        var image = document.createElement('img');
        document.getElementsByTagName('body')[0].appendChild(image);
        return image;
    }

    function createImage(src){
        src = src || defaultSrc;
        var image = createEmptyImage()
        image.setAttribute('src', defaultSrc);
        return image;
    }

    function createWidgetImage(src){
        src = src || defaultSrc;
        image = createEmptyImage()
        image.setAttribute('data-fp-src', defaultSrc);
        return image;
    }


    function triggerEvent(element, eventName){
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
        } else {
            event = document.createEventObject();
            event.eventType = eventName;
        }

        event.eventName = eventName;

        if (document.createEvent) {
            element.dispatchEvent(event);
        } else {
            element.fireEvent("on" + event.eventType, event);
        }
    }
    
    it("should be able to check DOM element dims", function(){
        expect(
            filepicker.responsiveImages.getElementDims(createImage())
        ).toEqual({ width: 24, height: 24 });
    });


    it("should be able to replace Image tag source value", function(){
        var image = createImage();
        expect(image.src).toEqual(defaultSrc);
        filepicker.responsiveImages.replaceSrc(image, changedSrc);
        expect(image.src).toEqual(changedSrc);

        filepicker.responsiveImages.replaceSrc(image, 'randomSrc');
        expect(image.src).toEqual(origin + '/randomSrc');
    });


    it("should return current resize params", function(){
        var image = createImage();
        var params = filepicker.responsiveImages.getCurrentResizeParams(processUrl);
        expect(params).toEqual({
            width: '615',
            height: '100'
        });
    });

    it('should be able to construct responsive image widget', function(){
        var image = createImage();
        image.setAttribute('data-fp-src', defaultSrc);
        expect(image.src).toEqual(defaultSrc);
        filepicker.responsiveImages.construct(image);
        expect(image.src).toEqual(processBase + 'resize=width:30/' + defaultSrc);
    });


    it('should be able to get and set responive options', function(){
        expect(filepicker.responsiveImages.getResponsiveOptions()).toEqual({});
        var newOptions = {
            pixelRound: 100,
            test: 'testValue',
        };
        filepicker.responsiveImages.setResponsiveOptions(newOptions);
        expect(filepicker.responsiveImages.getResponsiveOptions()).toEqual(newOptions);
    });


    it('should be able to init responsive view', function(done){
        var image = createWidgetImage();
        expect(image.src).toEqual('');
        filepicker.responsiveImages.init();
        window.setTimeout(function(){
            expect(image.src).toEqual(processBase + 'resize=width:1100/' + defaultSrc);
            done();
        });
    });

    it('should be able to reload image on resize', function(done){
        var image = createWidgetImage();
        filepicker.responsiveImages.init();

        window.setTimeout(function(){
            expect(image.src).toEqual(processBase + 'resize=width:1100/' + defaultSrc);
            image.setAttribute('style', 'width:200px;');
            triggerEvent(window, 'resize');
            window.setTimeout(function(){
                expect(image.src).toEqual(processBase + 'resize=width:200/' + defaultSrc);
                done();
            }, 250);
        }, 250);
    });
});
