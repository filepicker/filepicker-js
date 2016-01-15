describe("The main lib module", function(){

    filepicker.setKey('l5uQ3k7FQ5GoYCHyTdZV');

    it("should allow setting the apikey", function(){
    });

    it("should expose FilepickerExceptions", function(){
    });

    it("should route pick calls", function(){

    });

    it("should route pickMultiple calls", function(){

    });

    it("should route pickAndStore calls", function(){

    });

    it("should route read calls", function(){
        //check different input types, mock read

    });

    it("should route write calls", function(){

    });

    it("should route writeUrl calls", function(){

    });

    it("should route store calls", function(){

    });

    it("should route storeUrl calls", function(){

    });

    it("should route stat calls", function(){

    });

    it("should route remove calls", function(){

    });

    it("should route convert calls", function(){

    });

    it("should route constructWidget calls", function(){

    });

    it("should route makeDropPane calls", function(){

    });

    it("should fail if the apikey isn't set", function(){
        //check all calls
    });

    it("can programatically close dialog window", function(){
      // TODO we should actually check if dialog appeared on screen,
      // and that after calling close it disappeared.

      var dialog = filepicker.pick();
      expect(dialog.close).toBeDefined();

      dialog = filepicker.pickMultiple();
      expect(dialog.close).toBeDefined();

      dialog = filepicker.pickAndStore({}, {});
      expect(dialog.close).toBeDefined();

      dialog = filepicker.pickFolder();
      expect(dialog.close).toBeDefined();

      dialog = filepicker.processImage('/api/file/');
      expect(dialog.close).toBeDefined();

      dialog = filepicker.export('https://www.filestackapi.com/api/file/qHi4LxRh28IeEBdJcFpw');
      expect(dialog.close).toBeDefined();
    });

});
