chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        console.log(details)
        return { requestHeaders: details.requestHeaders };
    }, { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]);



chrome.webRequest.onHeadersReceived.addListener(function(info) {
        console.log(info)
        // return;
        let initiator = (info.initiator || info.originUrl);
        if (
            (initiator == "https://twitter.com" && info.type == "xmlhttprequest") ||
            (initiator == 'https://github.com') ||
            (info.type == 'sub_frame')
        ) {
            // alert("I have been reached.")
            // console.log(info)
            // console.log("Initiator:- ", info.initiator);
            // console.log("Type:- ", info.type);
            // console.log("Url:- ", info.url);


            console.table([{ "Initiator": info.initiator }, { "Type": info.type }, { "URL": info.url }])
            var headers = info.responseHeaders;
            // console.log(headers)
            for (var i = headers.length - 1; i >= 0; --i) {
                var header = headers[i].name.toLowerCase();
                if (header == 'x-frame-options' || header == 'frame-options') {
                    // alert(header)
                    headers.splice(i, 1); // Remove header
                }
                if (header == 'content-security-policy') {
                    // alert(header)
                    headers.splice(i, 1); // Remove header
                }
            }
            console.log(headers)
            return {
                responseHeaders: headers
            };
        }
    }, {
        urls: ["<all_urls>"], // Pattern to match all http(s) pages
        // types: ["sub_frame", 'xmlhttprequest', "script", "websocket"]
    },
    ['blocking', 'responseHeaders']
);
// chrome.webRequest.onCompleted(function() {
//     alert();
// })

chrome.runtime.onInstalled.addListener(function() {
    // alert(googelTraslateLanguages)
    // alert("Fist time")
    chrome.storage.sync.get(['dictionaries'], result => {
        console.log(result)
        if (!result.dictionaries) {
            // create dictionary if its first time
            firsTime();
            // alert("Dictionaries added")
        }
    });
});


function firsTime() {
    chrome.storage.sync.set({
        dictionaries: [

            {
                "preInstalled": "true",
                "id": "googleTranslate",
                "title": "Google Translate",
                "isGoogleTranslate": true,
                "from": "auto", //default
                "to": "en", //default
                "url": dictionariesData.googleTranslate.generateUrl("auto", "en")
            }, {
                "preInstalled": "true",
                "id": "cambridge",
                "title": "Cambridge",
                "fromTo": "english",
                "url": dictionariesData.cambridge.generateUrl("english")
            }, {
                "preInstalled": "true",
                "id": "oxford",
                "title": "Oxford",
                "fromTo": "en",
                "url": dictionariesData.oxford.generateUrl("en")
            }, {
                "preInstalled": "true",
                "id": "collins",
                "title": "Collins",
                "fromTo": "english",
                "url": dictionariesData.collins.generateUrl("english")
            }, {
                "preInstalled": "true",
                "id": "longman",
                "title": "Longman",
                "fromTo": "english",
                "url": dictionariesData.longman.generateUrl("english")
            },

        ],
        dictionariesHidden: []
    });
}