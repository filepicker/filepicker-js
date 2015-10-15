
window.CONVERSION_RESPONSES = {
    "/library/convert/success" : {
        "description": "The response for a successful conversion request from the v1 library",
        "request": {
            "form":{
                "width": "64",
                "height": "128"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"url": "https://www.filepicker.io/api/file/blah", "filename":"test.png", "type":"image/jpeg","size":9344})
        }
    },
    "/library/convert/not_found" : {
        "description": "The response for a conversion request from the v1 library where the file isn't found",
        "request": {
            "form":{
                "width": "64",
                "height": "128"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 404,
            "responseText": "File not found"
        }
    },
    "/library/convert/not_authed" : {
        "description": "The response for a conversion request from the v1 library where convert isn't authed",
        "request": {
            "form":{
                "width": "64",
                "height": "128"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 403,
            "responseText": "Invalid security params"
        }
    },
    "/library/convert/bad_params" : {
        "description": "The response for a conversion request from the v1 library where the conversion parameters are bad",
        "request": {
            "form":{
                "width": "64",
                "height": "128"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 400,
            "responseText": "Invalid conversion params"
        }
    },
    "/library/convert/error" : {
        "description": "The response for a conversion request from the v1 library that failed mysteriously",
        "request": {
            "form":{
                "width": "64",
                "height": "128"
            },
            "headers": {
                "Accept": {"$contains": "application/json"}
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 500,
            "responseText": "Server failure (ish)"
        }
    }
};
