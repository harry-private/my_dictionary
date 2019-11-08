chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        return { requestHeaders: details.requestHeaders };
    }, { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]);



chrome.webRequest.onHeadersReceived.addListener(function(info) {
        let initiator = (info.initiator || info.originUrl);
        // return if the request is from main frame, not from the subframe
        // if (info.frameId === 0) { return; }
        // console.log('FrameID: ', info.frameId);
        // console.log('initiator: ', initiator);
        if (
            (initiator == "https://twitter.com/sw.js" && info.type == "xmlhttprequest") ||
            (initiator == "https://twitter.com" && info.type == "xmlhttprequest") ||
            (initiator == 'https://github.com') ||
            (info.type == 'sub_frame')
        ) {
            // console.log("Type Matched!");

            var headers = info.responseHeaders;
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
    chrome.storage.sync.get(['dictionaries, triggerKey'], result => {
        // console.log(result)
        if (!result.dictionaries) {
            // create dictionary if its first time
            firsTime();
            // alert("Dictionaries added")
        }


        if (!result.triggerKey) {
            // if there is no trigger key in the storage I can set here
            // because when this extension gets updated 
            // users may not have that in there storage
            // because initially there was no such key
            setTriggerKeyFirstTime();
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
        dictionariesHidden: [],
        triggerKey: "none"
    });
}

function setTriggerKeyFirstTime() {

    chrome.storage.sync.set({
        triggerKey: "none"
    });
}