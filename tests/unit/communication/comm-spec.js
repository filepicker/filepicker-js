describe("The Comm library", function(){
    var base_url = filepicker.urls.BASE;
    var base_comm_url = filepicker.urls.COMM;
    beforeEach(function(){
        //mocking out url
        filepicker.urls.COMM = "comm_iframe.html";
        var origin = window.location.protocol + '//' + window.location.host;
        filepicker.urls.BASE = origin;
        filepicker.comm.openChannel();
    });

    afterEach(function(){
        filepicker.urls.COMM = base_comm_url;
        filepicker.urls.BASE = base_url;
        filepicker.comm.closeChannel();
    });

    it("can open a communication channel via iframes", function(done){
        var loaded = false;
        var iframe = window.frames['filepicker_comm_iframe'];
        expect(iframe).toBeDefined();
        expect(iframe.name).toEqual("filepicker_comm_iframe");

        iframe.onload = function(){
            loaded = true;
        };

        var dom_elem = document.getElementsByName("filepicker_comm_iframe")[0];
        expect(dom_elem.src).toEqual(filepicker.urls.BASE+"/comm_iframe.html");
        expect(dom_elem.style.display).toEqual("none");

        window.setTimeout(function(){

            var iframe = window.frames['filepicker_comm_iframe'];
            expect(iframe.location.href).toEqual(filepicker.urls.BASE+"/comm_iframe.html");
            done();
        },1000)
    });

    it("won't add another if one already exists", function(){
        filepicker.comm.openChannel();
        filepicker.comm.openChannel();
        filepicker.comm.openChannel();
        filepicker.comm.openChannel();
        expect(document.getElementsByName("filepicker_comm_iframe").length).toEqual(1);
    });

    it("attaches a handler that listens on events", function(done){
        var spy = jasmine.createSpy('test handler');
        filepicker.handlers.attach("tester", spy);
        window.postMessage('{"id":"tester","payload":{"hello":"world"}}', "*");

        window.setTimeout(function(){
            expect(spy.calls.allArgs()[0].length).toEqual(1);
            expect(spy).toHaveBeenCalledWith({id: "tester", payload: {hello: "world"}});
            filepicker.handlers.detach("tester", spy);
            done();
        });
    });
});
