window.FILES_READ_RESPONSES = {
    "/library/file/read/base64" : {
        "description": "The response for a read from a url that has base64 encoded data",
        "request": {
            "params":{
                "base64encode": "true",
                "_cacheBust": {"$type": "number"}
            },
            "headers": {
                "X-NO-STREAM": "true"
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "text/plain"
            },
            "status": 200,
            "responseText": "SGVsbG8gV29ybGTDjcKlwrk="
        }
    },
    "/library/file/read/nonbase64" : {
        "description": "The response for a read from a url that has base64 encoded data",
        "request": {
            "params":{
                "base64encode": "false",
                "_cacheBust": {"$type": "number"}
            },
            "headers": {
                "X-NO-STREAM": "true"
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "text/plain"
            },
            "status": 200,
            "responseText": "Hello World"
        }
    },
    "/library/file/read/error/notfound" : {
        "description": "The response for a read from a url that isn't found",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "method": "GET"
        },
        "response": {
            "status": 404,
            "responseText": "File not found"
        }
    },
    "/library/file/read/error/notauth" : {
        "description": "The response for a read from a url that isn't authed",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "method": "GET"
        },
        "response": {
            "status": 403,
            "responseText": "Not authorized"
        }
    },
    "/library/file/read/error/badparam" : {
        "description": "The response for a read from a url with bad parameters",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "method": "GET"
        },
        "response": {
            "status": 400,
            "responseText": "Bad params"
        }
    },
    "/library/file/read/error/server" : {
        "description": "The response for a read from a url with a server error",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "method": "GET"
        },
        "response": {
            "status": 500,
            "responseText": "Server error (ish)"
        }
    },
    "/library/file/read/error/nocors" : {
        "description": "The response for a read from a url with no cors",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "method": "GET"
        },
        "response": {
            "status": 200,
            "responseText": "Ok, but not CORS"
        }
    },
    "/library/file/read/error/corserror" : {
        "description": "The response for a read from a url with cors, but an error",
        "CORS": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Max-Age": "21600",
            "Access-Control-Allow-Headers": "CONTENT-TYPE,X-NO-STREAM"
        },
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "method": "GET"
        },
        "response": {
            "status": 500,
            "responseText": "Server error (ish)"
        }
    },
    "/library/file/readstore/store/success" : {
        "description": "The response for a store in order to read",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "files": {
                "fileUpload": {
                    "filename": {"$type":"string"},
                    "mimetype": "text/plain",
                    "responseText": "Hello World234"
                }
            },
            "headers": {
                "Accept": {"$contains": "application/json"},
                "Content-Type": {"$contains": "multipart/form-data"}
            },
            "method": "POST"
        },
        "response": {
            "status": 200,
            "responseText": JSON.stringify({"url":"/library/file/readstore/read/success"})
        }
    },
    "/library/file/readstore/read/success" : {
        "description": "The response for a read after a store",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"},
                "base64encode": "true"
            },
            "headers": {
                "X-NO-STREAM": "true"
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "text/plain"
            },
            "status": 200,
            "responseText": "SGVsbG8gV29ybGTDg8KNw4LCpcOCwrk="
        }
    }
}
