
initResonses();

function initResonses(){
    jasmine.Ajax.install();
    var responsesArray = [
        window.AJAX_RESPONSES,
        window.CONVERSION_RESPONSES,
        window.FILES_WRITE_RESPONSES, 
        window.FILES_READ_RESPONSES,
        window.MODAL_RESPONSES
    ];

    for (var i in  responsesArray){
        stubRequests(responsesArray[i]);
    }

}

function stubRequests(responses) {
    for (var key in responses) {
        request = responses[key];
        jasmine.Ajax.stubRequest(new RegExp(key, 'i')).andReturn(request.response);
    }

}



function merge(target, source) {
        
    /* Merges two (or more) objects,
       giving the last one precedence */
    
    if ( typeof target !== 'object' ) {
        target = {};
    }
    
    for (var property in source) {
        
        if ( source.hasOwnProperty(property) ) {
            
            var sourceProperty = source[ property ];
            
            if ( typeof sourceProperty === 'object' ) {
                target[ property ] = merge( target[ property ], sourceProperty );
                continue;
            }
            
            target[ property ] = sourceProperty;
            
        }
        
    }
    
    for (var a = 2, l = arguments.length; a < l; a++) {
        merge(target, arguments[a]);
    }
    
    return target;
};

