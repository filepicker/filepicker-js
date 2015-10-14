window.FILES_WRITE_RESPONSES = {
    "/library/file/write/text" : {
        "description": "The response for a write to an fpurl",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "headers": {
                "Content-Type": {"$contains":"text/plain"},
                "Accept": {"$contains": "application/json"}
            },
            "responseText":"cool beans",
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"url": "https://www.filepicker.io/api/file/abc", "filename":"test.txt", "type":"text/plain","size": 10, "writeable": true, "key": "s3_key"})
        }
    },
    "/library/file/write/file" : {
        "description": "The response for a write to an fpurl of a file",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "headers": {
                "Content-Type": {"$contains": "multipart/form-data"},
                "Accept": {"$contains": "application/json"}
            },
            "files": {
                "fileUpload": {
                    "filename": {"$type":"string"},
                    "mimetype": "text/plain",
                    "responseText": "Hello World456"
                }
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"url": "https://www.filepicker.io/api/file/nomnom", "filename":"test.txt", "type":"text/plain","size": 14, "writeable": true, "key": "s3_key"})
        }
    },
    "/library/file/write/domfile" : {
        "description": "The response for a write to an fpurl of a DOM file",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "headers": {
                "Content-Type": {"$contains": "multipart/form-data"},
                "Accept": {"$contains": "application/json"}
            },
            "files": {
                "fileUpload": {
                    "filename": {"$type":"string"},
                    "mimetype": "text/plain",
                    "responseText": "Hello World789"
                }
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"url": "https://www.filepicker.io/api/file/nomnom2", "filename":"test.txt", "type":"text/plain","size": 14, "writeable": true, "key": "s3_key"})
        }
    },
    "/library/file/write/url" : {
        "description": "The response for a write to an fpurl of a url",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "headers": {
                "Content-Type": {"$contains": "application/x-www-form-urlencoded"},
                "Accept": {"$contains": "application/json"}
            },
            "form": {
                "url": "http://www.google.com"
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"url": "https://www.filepicker.io/api/file/nomnom3", "filename":"google.html", "type":"text/html","size": 4556, "writeable": true, "key": "s3_key"})
        }
    },
    "/library/file/store/domfile" : {
        "description": "The response for a store of a DOM file",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "headers": {
                "Content-Type": {"$contains": "multipart/form-data"},
                "Accept": {"$contains": "application/json"}
            },
            "files": {
                "fileUpload": {
                    "filename": {"$type":"string"},
                    "mimetype": "text/plain",
                    "responseText": "BlahBlah"
                }
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"url": "https://www.filepicker.io/api/file/yeah1", "filename":"test.txt", "type":"text/plain","size": 8, "writeable": true, "key": "s3_key"})
        }
    },
    "/library/file/store/image" : {
        "description": "The response for a store of raw data",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "headers": {
                "Content-Type": {"$contains":"image/png"},
                "Accept": {"$contains": "application/json"}
            },
            "responseText":"cooler beans",
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"url": "https://www.filepicker.io/api/file/yeah2", "filename":"test.png", "type":"image/png","size": 12, "isWriteable": false, "key": "s3_key"})
        }
    },
    "/library/file/store/url" : {
        "description": "The response for a store of a url",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "headers": {
                "Content-Type": {"$contains": "application/x-www-form-urlencoded"},
                "Accept": {"$contains": "application/json"}
            },
            "form":{
                "url": "http://www.imgix.com/p12"
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "application/json"
            },
            "status": 200,
            "responseText": JSON.stringify({"url": "https://www.filepicker.io/api/file/yeah3", "filename":"imgix.html", "type":"text/html","size": 240, "isWriteable": true, "key": "s3_key"})
        }
    },
    "/library/file/stat/success/metadata" : {
        "description": "The response for a getting the metadata of an fpfile",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"},
                "filename": "true",
                "mimetype": "true",
                "size": "true",
                "uploaded": "true"
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
            "responseText": JSON.stringify({"filename": "stattest.png", "mimetype":"image/png","size": 42, "uploaded": 1349935525383})
        }
    },
    "/library/file/remove/success/remove" : {
        "description": "The response for a store of a url",
        "request": {
            "params":{
                "_cacheBust": {"$type": "number"}
            },
            "headers": {
                "Accept": {"$contains": "text/html"}
            },
            "form":{
                "key": "12345"
            },
            "method": "POST"
        },
        "response": {
            "headers": {
                "Content-Type": "text/plain"
            },
            "status": 200,
            "responseText": "Success"
        }
    }
}
