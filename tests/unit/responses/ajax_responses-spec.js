window.AJAX_RESPONSES = {
    "/library/ajax/get/success" : {
        "description": "The response for testing the js library successful GET ajax request",
        "regex": /library\/ajax\/get\/success/,
        "CORS": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Max-Age": "21600",
            "Access-Control-Allow-Headers": "CONTENT-TYPE"
        },
        "request": {
            "params":{
                "test123": "45"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"hello": "world"})
        }
    },
    "/library/ajax/get/success_xdr" : {
        "description": "The response for testing the js library successful GET ajax request via XDR",
        "regex": /library\/ajax\/get\/success_xdr/,
        "CORS": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Max-Age": "21600",
            "Access-Control-Allow-Headers": "CONTENT-TYPE"
        },
        "request": {
            "params":{
                "test123": "45"
            },
            "headers": {
                "Accept": "*/*"
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"hello": "world"})
        }
    },
    "/library/ajax/post/success" : {
        "description": "The response for testing the js library successful POST ajax request",
        "regex": /library\/ajax\/post\/success/,
        "CORS": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Max-Age": "21600",
            "Access-Control-Allow-Headers": "CONTENT-TYPE"
        },
        "request": {
            "form":{
                "test123": "45"
            },
            "headers": {
                "Accept": {"$contains": "application/json"},
                "Content-Type": {"$contains": "application/x-www-form-urlencoded"}
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"hello": "world"})
        }
    },
    "/library/ajax/post/success_xdr" : {
        "description": "The response for testing the js library successful POST ajax request via XDR",
        "regex": /library\/ajax\/post\/success_xdr/,
        "CORS": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Max-Age": "21600",
            "Access-Control-Allow-Headers": "CONTENT-TYPE"
        },
        "request": {
            "responseText":"test123=45",
            "headers": {
                "Accept": "*/*"
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"hello": "world"})
        }
    },
    "/library/ajax/put/success" : {
        "description": "The response for testing the js library successful PUT ajax request",
        "regex": /library\/ajax\/put\/success/,
        "request": {
            "form":{
                "test123": "45"
            },
            "headers": {
                "Accept": {"$contains": "application/json"},
                "Content-Type": {"$contains": "application/x-www-form-urlencoded"}
            },
            "method": "PUT"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"hello": "world"})
        }
    },
    "/library/ajax/post/complex" : {
        "description": "The response for testing the js library ajax request with complex data",
        "regex": /library\/ajax\/post\/complex/,
        "request": {
            "form":{
                "test123[a][0]": "1",
                "test123[a][1]": "2",
                "test123[a][2]": "3",
                "test123[a][3]": "true",
                "b": "abc"
            },
            "headers": {
                "Accept": {"$contains": "application/json"},
                "Content-Type": {"$contains": "application/x-www-form-urlencoded"},
                "X-CUSTOM-HEADER": "fpio"
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"hello": "success"})
        }
    },
    "/library/ajax/post/xml_data" : {
        "description": "The response for testing the js library ajax request with xml data",
        "regex": /library\/ajax\/post\/xml_data/,
        "request": {
            "responseText":"<data>Xml is ugly</data>",
            "headers": {
                "Accept": {"$contains": "text/xml"},
                "Content-Type": {"$contains": "text/xml"}
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "text/xml"
            },
            "status": 200,
            "responseText": "<resp>Good xml</resp>"
        }
    },
    "/library/ajax/get/invalid_json" : {
        "description": "The response for testing the js library with a GET ajax request that returns bad json",
        "regex": /library\/ajax\/get\/invalid_json/,
        "request": {
            "params":{
                "test123": "45"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": "Hello world"
        }
    },
    "/library/ajax/get/bad_params" : {
        "description": "The response for testing the js library with a GET ajax request that returns a 400",
        "regex": /library\/ajax\/get\/bad_params/,
        "request": {
            "params":{
                "test123": "45"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 400,
            "responseText": "Narp"
        }
    },
    "/library/ajax/get/not_authed" : {
        "description": "The response for testing the js library with a GET ajax request that returns a 403",
        "regex": /library\/ajax\/get\/not_authed/,
        "request": {
            "params":{
                "test123": "45"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 403,
            "responseText": "Bad auth"
        }
    },
    "/library/ajax/get/not_found" : {
        "description": "The response for testing the js library with a GET ajax request that returns a 404",
        "regex": /library\/ajax\/get\/not_found/,
        "request": {
            "params":{
                "test123": "45"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 404,
            "responseText": "Not found (ish)"
        }
    },
    "/library/ajax/get/error" : {
        "description": "The response for testing the js library with a GET ajax request that returns a 500",
        "regex": /library\/ajax\/get\/error/,
        "request": {
            "params":{
                "test123": "45"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 500,
            "responseText": "That's an error, Jim"
        }
    },
    "/library/ajax/get/no_crossdomain" : {
        "description": "The response for testing the js library with a GET ajax request that doesn't allow crossdomain",
        "regex": /library\/ajax\/get\/no_crossdomain/,
        "request": {
            "params":{
                "test123": "45"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": "Everything is OK"
        }
    },
    "/library/ajax/get/xdr_no_crossdomain" : {
        "description": "The response for testing the js library with a GET ajax request that doesn't allow crossdomain, over xdr",
        "regex": /library\/ajax\/get\/xdr_no_crossdomain/,
        "request": {
            "params":{
                "test123": "45"
            },
            "headers": {
                "Accept": "*/*"
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": "Everything is OK"
        }
    }
}
