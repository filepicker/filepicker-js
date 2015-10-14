describe("The mimetypes library", function(){

    var tests, i;
    tests = [
        ['image/png', '', 'image/png'],
        ['image/png', 'test.jpg', 'image/png'],
        ['image/jpeg', 'test.jpg', 'image/jpeg'],
        ['application/download', 'stuff.pdf', 'application/pdf'],
        ['application/download', 'noextension', 'application/download'],
        ['', 'noextension', '']
    ];

    for (i = 0; i < tests.length; i++){
        function test(i) {
            var file = {'type': tests[i][0], 'name': tests[i][1]};
            var result = tests[i][2];
            return function () {expect(filepicker.mimetypes.getMimetype(file)).toEqual(result);};
        }
        it("can determine the mimetype of a file: " + tests[i], test(i));
    }

    tests = [
        ['application/pdf', 'application/*', true],
        ['image/png', 'image/*', true],
        ['image/png', 'image/PNG', true],
        ['image/jpeg', 'image/png', false],
        ['application/unknown', 'application/pdf', true],
        ['application/x-download', 'application/pdf', true]
        ];

    for (i = 0; i < tests.length; i++){
        function mimetypetest(i) {
            return function () {expect(filepicker.mimetypes.matchesMimetype(tests[i][0], tests[i][1])).toEqual(tests[i][2]);};
        }
        it("can test mimetype matching on " + tests[i], mimetypetest(i));
    }
});
