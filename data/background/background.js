chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    return { requestHeaders: details.requestHeaders };
  }, { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]);



chrome.webRequest.onHeadersReceived.addListener(function (info) {
  let initiator = (info.initiator || info.originUrl);
  if (
    (initiator == "https://twitter.com/sw.js" && info.type == "xmlhttprequest") ||
    (initiator == "https://twitter.com" && info.type == "xmlhttprequest") ||
    (initiator == 'https://github.com') ||
    (info.type == 'sub_frame')
  ) {
    var headers = info.responseHeaders;
    for (var i = headers.length - 1; i >= 0; --i) {
      var header = headers[i].name.toLowerCase();
      if (header == 'x-frame-options' || header == 'frame-options') {
        headers.splice(i, 1); // Remove header
      }
      if (header == 'content-security-policy') {
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

chrome.runtime.onInstalled.addListener((details) => {
  // let isFirefox = typeof InstallTrigger !== 'undefined';
  let userAgent = (navigator && navigator.userAgent || '').toLowerCase();
  let isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  let isFirefox = userAgent.match(/(?:firefox|fxios)\/(\d+)/);
  let urlForChrome = "https://chrome.google.com/webstore/detail/lookup-in-popup/akaefbhdlppmfdecoakjogglbjgacdhm/";
  let urlForFirefox = "https://addons.mozilla.org/en-US/firefox/addon/lookup-in-popup/"
  let onInstallLaunchUrl = (isChrome && !isFirefox) ? urlForChrome : urlForFirefox;
  if (details.reason == "install") {
    firstTime();
    chrome.tabs.create({ url: onInstallLaunchUrl }, function (tab) { });
  } else if (details.reason == "update") {
    chrome.tabs.create({ url: onInstallLaunchUrl }, function (tab) { });

  }
});


function firstTime() {
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
    triggerKey: "none",
    enableDisable: {
      globally: "enable", //disabled|enabled
      listMode: "blacklist-mode", //blacklist-mode|whitelist-mode
      blacklist: [], //["someUrl", "anotherUrl", "sommeAnotherUrl"]
      whitelist: [] //["someUrl", "anotherUrl", "sommeAnotherUrl"]
    },
    showChooseDictionaryOptions: 'yes'
  });
}