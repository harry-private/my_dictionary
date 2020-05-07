(async () => {
    'use strict'
    class Dictionary {
        constructor() {
            this.dictionaries = {};
            this.body = document.body;
            this.html = document.documentElement;

            this.iframe;
            this.panel;
            this.panelSelect = "null";
            this.panelQueryInput = "null";
        }
        async getDictionariesFromLocalStorage() {
            let dictionariesPromise = async () => {
                return new Promise(resolve => {
                    chrome.storage.sync.get(['dictionaries', "triggerKey"], result => {
                        resolve(result);
                    })
                })
            }
            this.dictionaries = await dictionariesPromise();
        }
        dictionariesOptionsForSelect() {
            let options = '';
            this.dictionaries.dictionaries.forEach(function(dictionary) {
                if (!dictionary.isHidden) {
                    options += `<option data-url="${dictionary.url.replace(/"/g, '&quot;').replace(/'/g, '&#x27;')}">${dictionary.title}</option>`
                }
            });
            return options;
        }

        createPanel() {
            this.panel = document.createElement("div");
            this.panel.insertAdjacentHTML("afterbegin", `
              <div class="panel-select-panel-input-container ">
                <select class="my-dictionary-panel-select my-dictionary-custom-select">${this.dictionariesOptionsForSelect()}</select>
                <div class="my-dictionary-query-input-container">
                  <input class="my-dictionary-query-input" placeholder="Your query goes here" autofocus>
                </div>
              </div>
            `);
            this.panel.classList.add("my-dictionary-panel");
            this.panel.querySelector('.my-dictionary-panel-select')
                .addEventListener('change', this.changeDictionary());
            this.body.appendChild(this.panel);
        }
        createIFrame() {
            this.iframe = document.createElement('iframe');
            this.iframe.classList.add('my-dictionary-iframe');
            this.panel.appendChild(this.iframe);
        }
        changeDictionary(e) {
            if (!this.panel) { return; }
            // this method should not be needed to call from here, but I don't know why it is not working,
            //  without this method being called here.
            this.querySelectorAfterPanelCreated();
            this.panelSelect.addEventListener("change", () => {
                let query = this.panelQueryInput.value.trim();
                if (!query) { return; }
                let selectedDictionary = this.panelSelect.options[this.panelSelect.selectedIndex];
                let selectedDictionaryUrl = selectedDictionary.dataset.url;
                let url = this.createDictionaryUrlForIFrame(selectedDictionaryUrl, query);
                this.iframe.src = chrome.runtime.getURL('data/iframe/iframe.html?url=' + encodeURIComponent(url));
            });

        }
        changeDictionaryQuery() {
            if (!this.panel) { return; }
            let queryOld = this.panelQueryInput.value.trim();

            function delay(fn, ms) {
                let timer = 0
                return function(...args) {
                    clearTimeout(timer);
                    timer = setTimeout(fn.bind(this, ...args), ms || 0);
                }
            }
            this.panelQueryInput.addEventListener("keyup", delay((e) => {
                // if (e.key === "Escape") { return; }
                let selectedDictionary = this.panelSelect.options[this.panelSelect.selectedIndex];
                let selectedDictionaryUrl = selectedDictionary.dataset.url;
                if (!selectedDictionaryUrl) {
                    selectedDictionaryUrl = this.selectedDictionary.dataset.url;
                }
                let query = this.panelQueryInput.value.trim();
                if ((query != "") && (query != queryOld)) {
                    queryOld = query;
                    let url = this.createDictionaryUrlForIFrame(selectedDictionaryUrl, query);
                    this.iframe.src = chrome.runtime.getURL('data/iframe/iframe.html?url=' + encodeURIComponent(url));
                }
            }, 1500));

        }
        createDictionaryUrlForIFrame(url, query) {
            if ((url).includes("%s")) {
                return url.replace("%s", query);
            } else {
                return `${url}/?${query}`;
            }
        }

        querySelectorAfterPanelCreated() {
            this.panelSelect = this.panel.querySelector('.my-dictionary-panel-select');
            this.panelQueryInput = this.panel.querySelector('.my-dictionary-query-input');
        }

    }

    let dictionary = new Dictionary();
    await dictionary.getDictionariesFromLocalStorage();


    dictionary.createPanel();
    dictionary.querySelectorAfterPanelCreated();
    dictionary.createIFrame();
    dictionary.changeDictionaryQuery();
})();