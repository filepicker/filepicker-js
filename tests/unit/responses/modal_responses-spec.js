window.MODAL_RESPONSES = {
    "/library/modal/basic" : {
        "description": "A basic html template for a test modal",
        "request": {
            "headers": {
                "Accept": {"$contains": "text/html"}
            },
            "method": "GET"
        },
        "response": {
            "headers": {
                "Content-Type": "text/html"
            },
            "status": 200,
            "responseText": "<html><body>This is a test modal frame</body></html>"
        }
    }
}
