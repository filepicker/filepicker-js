describe("The handlers module", function(){
    it("can attach and detach handlers", function(){
        var handler = jasmine.createSpy("handler");
        var id = "tester";

        filepicker.handlers.attach(id, handler);
        
        //running another message
        var msg = { id: "other", payload: "bad" };
        expect(filepicker.handlers.run(msg)).toBe(false);
        expect(handler).not.toHaveBeenCalled();
        
        //running the actual message
        msg = { id: id, payload: "good" };
        expect(filepicker.handlers.run(msg)).toBe(true);
        expect(handler).toHaveBeenCalledWith(msg);
        handler.calls.reset();

        //detaching
        filepicker.handlers.detach(id, handler);
        expect(filepicker.handlers.run(msg)).toBe(false);
        expect(handler).not.toHaveBeenCalled();

        //detaching something that doesn't exist - should be ok
        var test = function(){
            filepicker.handlers.detach('bloogidy');
        };
        expect(test).not.toThrow();
    });

    it("can run multiple handlers for one id", function(){
        var id = "tester2";
        var handler1 = jasmine.createSpy("handler1");
        var handler2 = jasmine.createSpy("handler2");
        var handler3 = jasmine.createSpy("handler3");

        filepicker.handlers.attach(id, handler1);
        filepicker.handlers.attach(id, handler2);
        filepicker.handlers.attach(id, handler3);
        
        //running the message
        msg = { id: id, payload: "good" };
        filepicker.handlers.run(msg);
        expect(handler1).toHaveBeenCalledWith(msg);
        expect(handler2).toHaveBeenCalledWith(msg);
        expect(handler3).toHaveBeenCalledWith(msg);
        handler1.calls.reset();
        handler2.calls.reset();
        handler3.calls.reset();

        //detaching one
        filepicker.handlers.detach(id, handler1);
        filepicker.handlers.run(msg);
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalledWith(msg);
        expect(handler3).toHaveBeenCalledWith(msg);
        
        handler2.calls.reset();
        handler3.calls.reset();
        
        //detatching others
        filepicker.handlers.detach(id);
        filepicker.handlers.run(msg);
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).not.toHaveBeenCalled();
        expect(handler3).not.toHaveBeenCalled();
    });
});
