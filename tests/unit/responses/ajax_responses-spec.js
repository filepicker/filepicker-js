window.AJAX_RESPONSES = {
    "/library/ajax/get/success" : {
        "description": "The response for testing the js library successful GET ajax request",
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
            "body": {"hello": "world"}
        }
    },
    "/library/ajax/get/success_xdr" : {
        "description": "The response for testing the js library successful GET ajax request via XDR",
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
            "body": {"hello": "world"}
        }
    },
    "/library/ajax/post/success" : {
        "description": "The response for testing the js library successful POST ajax request",
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
            "body": {"hello": "world"}
        }
    },
    "/library/ajax/post/success_xdr" : {
        "description": "The response for testing the js library successful POST ajax request via XDR",
        "CORS": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Max-Age": "21600",
            "Access-Control-Allow-Headers": "CONTENT-TYPE"
        },
        "request": {
            "body":"test123=45",
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
            "body": {"hello": "world"}
        }
    },
    "/library/ajax/put/success" : {
        "description": "The response for testing the js library successful PUT ajax request",
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
            "body": {"hello": "world"}
        }
    },
    "/library/ajax/post/complex" : {
        "description": "The response for testing the js library ajax request with complex data",
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
            "body": {"hello": "success"}
        }
    },
    "/library/ajax/post/xml_data" : {
        "description": "The response for testing the js library ajax request with xml data",
        "request": {
            "body":"<data>Xml is ugly</data>",
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
            "body": "<resp>Good xml</resp>"
        }
    },
    "/library/ajax/get/invalid_json" : {
        "description": "The response for testing the js library with a GET ajax request that returns bad json",
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
            "body": "Hello world"
        }
    },
    "/library/ajax/get/bad_params" : {
        "description": "The response for testing the js library with a GET ajax request that returns a 400",
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
            "body": "Narp"
        }
    },
    "/library/ajax/get/not_authed" : {
        "description": "The response for testing the js library with a GET ajax request that returns a 403",
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
            "body": "Bad auth"
        }
    },
    "/library/ajax/get/not_found" : {
        "description": "The response for testing the js library with a GET ajax request that returns a 404",
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
            "body": "Not found (ish)"
        }
    },
    "/library/ajax/get/error" : {
        "description": "The response for testing the js library with a GET ajax request that returns a 500",
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
            "body": "That's an error, Jim"
        }
    },
    "/library/ajax/get/no_crossdomain" : {
        "description": "The response for testing the js library with a GET ajax request that doesn't allow crossdomain",
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
            "body": "Everything is OK"
        }
    },
    "/library/ajax/get/xdr_no_crossdomain" : {
        "description": "The response for testing the js library with a GET ajax request that doesn't allow crossdomain, over xdr",
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
            "body": "Everything is OK"
        }
    }
}
