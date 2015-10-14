//writing to console breaks IE:
window.test = {};
window.test.console = window.console;

var test_server = {
    base: "",
    cors: ""
};

var features = {};
features.all = function(){
    var ret = {};
    for (feature in features) {
        if (feature != "all") {
            ret[feature] = features[feature]();
        }
    }
    return ret;
};

features.progress = function(){
    return false;
};

features.overwrite_navigator = function(){
    try{
        var old = window.navigator;
        window.navigator = "a";
        var ret = window.navigator === "a";
        window.navigator = old;
        return ret;
    } catch (e) {
        return false;
    }
};

features.dragdrop = function(){
    return (!!window.FileReader || navigator.userAgent.indexOf("Safari") >= 0) && 
        ('draggable' in document.createElement('span'));
};

//if we use XDomainRequest for ajax
features.xdr_cors = function(){
    return window.XDomainRequest && !("withCredentials" in new XMLHttpRequest());
};

features.overwrite_xhr = function(){
    try{
        var old = window.XMLHttpRequest;
        var a = function(){};
        window.XMLHttpRequest = a;
        var ret = window.XMLHttpRequest === a;
        window.XMLHttpRequest = old;
        return ret;
    } catch (e) {
        return false;
    }
};

features.fileupload = function(){
    //opera has weird issues trying to mock out files and upload them
    return !(window.isPhantom || window.navigator.appName == "Opera");
};

window.test.features = features.all();
