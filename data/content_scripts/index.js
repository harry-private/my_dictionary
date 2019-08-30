// import 'babel-polyfill'
(async () => {
    'use strict'

    class Dictionary {
        constructor() {
            this.dictionaries = {};
            this.panelWidth = 450;
            this.panelHeight = 300;
            this.body = document.body;
            this.html = document.documentElement;
            this.popup = document.createElement('div');
            this.popupIcon = document.createElement('div');
            this.isAdded = false;
            this.iframe;
            this.panel;
            this.selectedText;

            // appending "my-dictionary-" because StackOverflow has the popup class, so won't work there
            this.popupIcon.classList.add('my-dictionary-popup-icon');
            this.popup.classList.add('my-dictionary-popup');
            this.popup.appendChild(this.popupIcon);
            this.createFixedPostionElement()

        }
        async getDictionariesFromLocalStorage() {
            let dictionariesPromise = async () => {
                return new Promise(resolve => {
                    chrome.storage.sync.get(['dictionaries'], result => {
                        resolve(result)
                    })
                })
            }
            this.dictionaries = await dictionariesPromise();

        }

        // this element will be used for black background
        createFixedPostionElement() {
            this.fixedPostionElement = document.createElement('div');
            this.fixedPostionElement.className = 'create-fixed-postion-element';

            this.body.appendChild(this.fixedPostionElement);
        }
        removePanelWhenClickedOutside(event) {
            if (this.panel && event.target !== this.panel && !this.panel.contains(event.target)) {
                this.body.removeChild(this.panel) && (this.panel = null);
                this.fixedPostionElement.style.display = 'none';
                return true;
            }
            return false;
        }
        getSelection() {
            this.selection = window.getSelection();
        }
        getSelectedText() {
            // this.selectedText = this.selection.toString().replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, ' ').trim();
            this.selectedText = this.selection.toString();
        }
        getRelative() {
            this.relative = document.body.parentNode.getBoundingClientRect();
        }
        getBCR() {
            this.bcr = this.selection.getRangeAt(0).getBoundingClientRect();
        }
        getOffset() {
            this.offset = -1;
        }
        removePopup() {
            if (this.isAdded) {
                if (this.body.removeChild(this.popup)) {
                    this.isAdded = false;
                }
            }
        }
        isSelectedText(event) {
            // if (!this.selectedText || event.target === this.popup || this.selectedText.includes(' ')) {
            //     return false;
            // }
            if (!this.selectedText.trim() || event.target === this.popup) {
                return false;
            }
            return true;
        }
        showPopup(event) {
            if (Math.abs(event.clientY - this.bcr.top) > this.bcr.bottom - event.clientY) {
                // icon will be shown on top
                this.offset = this.bcr.height + 28;
            }
            this.popup.style.top = `${this.bcr.bottom - this.relative.top - this.offset}px`; //this will place ele below the selection
            this.popup.style.left = `${event.clientX + this.html.scrollLeft - 12}px`; //this will place ele below the selection
            if (this.body.appendChild(this.popup)) {
                this.isAdded = true;
            }
        }
        createPanel(event) {
            let option = '';

            this.panel = document.createElement("div");
            // console.log(this.dictionaries.dictionaries)
            this.dictionaries.dictionaries.forEach(function(dictionary) {
                if (!dictionary.isHidden) {
                    option += `<option data-url="${dictionary.url.replace(/"/g, '&quot;').replace(/'/g, '&#x27;')}">${dictionary.title}</option>`
                }
            });

            this.panel.insertAdjacentHTML("afterbegin", `
          <select class="select-dictionary">${option}</select>
          <div class="my-dictionary-query-input-container">
          <input class="my-dictionary-query-input" value="${this.selectedText.toLowerCase().trim()}">
          </div>`);

            this.panel.className = "my-dictionary-panel";
            this.fixedPostionElement.style.display = 'block'
            this.body.appendChild(this.panel);
        }
        createIFrame() {

            let url;
            let firstUnhiddenDictionary;
            // get the first unhidden dictionary
            this.dictionaries.dictionaries.some((dictionary) => {
                if (!dictionary.isHidden) { firstUnhiddenDictionary = dictionary; return dictionary; }
            })
            let firstUnhiddenDictionaryUrl = firstUnhiddenDictionary.url
            url = this.createDictionaryUrlForIFrame(firstUnhiddenDictionaryUrl, this.selectedText.toLocaleLowerCase().trim())

            this.iframe = document.createElement('iframe');
            this.iframe.className = 'my-dictionary-iframe'

            this.iframe.src = chrome.runtime.getURL('data/iframe/iframe.html?url=' + encodeURIComponent(url));
            this.panel.appendChild(this.iframe);
        }

        changeDictionary() {
            if (this.panel) {
                let selectedDictionary = this.panel.querySelector('.select-dictionary');
                let queryInput = this.panel.querySelector('.my-dictionary-query-input');

                selectedDictionary.addEventListener("change", () => {
                    let iframe = document.querySelector('.my-dictionary-panel').querySelector('iframe');

                    let selectedOption = selectedDictionary.options[selectedDictionary.selectedIndex];
                    let selectedOptionUrl = selectedOption.dataset.url;
                    let url;
                    let query = queryInput.value.toLocaleLowerCase().trim();

                    url = this.createDictionaryUrlForIFrame(selectedOptionUrl, query);
                    iframe.src = chrome.runtime.getURL('data/iframe/iframe.html?url=' + encodeURIComponent(url));
                });
            }
        }


        changeDictionaryQuery() {
            if (this.panel) {
                let selectedDictionary = this.panel.querySelector('.select-dictionary');
                let queryInput = this.panel.querySelector('.my-dictionary-query-input');
                let queryOld = queryInput.value.toLocaleLowerCase().trim();

                function delay(fn, ms) {
                    let timer = 0
                    return function(...args) {
                        clearTimeout(timer)
                        timer = setTimeout(fn.bind(this, ...args), ms || 0)
                    }
                }
                queryInput.addEventListener("keyup", delay((e) => {
                    let iframe = document.querySelector('.my-dictionary-panel').querySelector('iframe');

                    let selectedOption = selectedDictionary.options[selectedDictionary.selectedIndex];
                    let selectedOptionUrl = selectedOption.dataset.url;
                    let url;
                    let query = queryInput.value.toLocaleLowerCase().trim();
                    if ((query != "") && (query != queryOld)) {
                        queryOld = query;
                        url = this.createDictionaryUrlForIFrame(selectedOptionUrl, query);
                        iframe.src = chrome.runtime.getURL('data/iframe/iframe.html?url=' + encodeURIComponent(url));
                    }
                }, 1500));
            }
        }

        createDictionaryUrlForIFrame(url, query) {
            if ((url).includes("%s")) {
                return url.replace("%s", query);
            } else {
                return `${url}/?${query}`;
            }
        }



    }


    let dictionary = new Dictionary();

    await dictionary.getDictionariesFromLocalStorage();
    document.body.onmouseup = (e) => {
        dictionary.changeDictionary();
        if (dictionary.removePanelWhenClickedOutside(e)) {
            return;
        }

        setTimeout(() => {

            dictionary.getSelection();
            dictionary.getSelectedText();
            dictionary.getRelative();
            dictionary.getOffset();

            dictionary.removePopup();

            // if no text is selected or clicked element is popup, don't execute the rest of the code
            if (!dictionary.isSelectedText(e)) {
                return;
            }
            dictionary.getBCR();
            dictionary.showPopup(e);

            dictionary.popup.onclick = (evt) => {
                dictionary.removePopup()
                evt.stopPropagation();
                evt.preventDefault();

                dictionary.createPanel(e);

                dictionary.createIFrame();
                dictionary.changeDictionaryQuery();
            }
        })
    }

})()