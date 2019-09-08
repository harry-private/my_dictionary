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
            // this.popupIcon = document.createElement('div');
            this.popupSelect = document.createElement('select');
            this.popup.classList.add('my-dictionary-popup');
            this.popupSelect.classList.add('my-dictionary-popup-select');
            this.popupSelect.classList.add('my-dictionary-custom-select');
            this.isAdded = false;
            this.iframe;
            this.panel;
            this.selectedText;
            this.selectedDictionary;
            // appending "my-dictionary-" because StackOverflow has the popup class, so won't work there
            // this.popupIcon.classList.add('my-dictionary-popup-icon');
            // this.createPopup();
            // this.popup = this.poptest;
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
        createPopup() {
            this.popupSelect.innerHTML = `${(this.dictionariesOptionsForSelect())}`
            this.popup.appendChild(this.popupSelect);
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
            return window.getSelection();
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
        dictionariesOptionsForSelect() {
            let options = '<option selected disabled>Choose Dictionary</option>';
            this.dictionaries.dictionaries.forEach(function(dictionary) {
                if (!dictionary.isHidden) {
                    options += `<option data-url="${dictionary.url.replace(/"/g, '&quot;').replace(/'/g, '&#x27;')}">${dictionary.title}</option>`
                }
            });
            return options;
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
            this.panel = document.createElement("div");
            // 
            // this.dictionaries.dictionaries.forEach(function(dictionary) {
            //     if (!dictionary.isHidden) {
            //         option += `<option data-url="${dictionary.url.replace(/"/g, '&quot;').replace(/'/g, '&#x27;')}">${dictionary.title}</option>`
            //     }
            // });

            // overlap icon &#128471;

            this.panel.insertAdjacentHTML("afterbegin", `
          <div class="my-dictionary-panel-extra-options">
            <span class="my-dictionary-panel-back" title="Go back">&#129032;</span>
            <span class="my-dictionary-panel-forward" title="Go forward">&#129034;</span>
            <span class="my-dictionary-panel-maximize-restore" title="Maximize">&#128470;</span>
            <span class="my-dictionary-panel-close" title="Close the panel">&#128473;</span>
          </div>
          <div class="panel-select-panel-input-conatiner">
            <select class="my-dictionary-panel-select my-dictionary-custom-select">${this.dictionariesOptionsForSelect()}</select>
            <div class="my-dictionary-query-input-container">
              <input class="my-dictionary-query-input" value="${this.selectedText.toLowerCase().trim()}">
            </div>
          </div>`);
            this.panel.className = "my-dictionary-panel";
            this.fixedPostionElement.style.display = 'block'
            this.panel.querySelector('.my-dictionary-panel-select')
                .addEventListener('change', this.changeDictionary())
            this.addEventListenerToPanelExtraOption();
            this.body.appendChild(this.panel);
        }
        createIFrame() {
            this.selectedDictionary = this.popupSelect.options[this.popupSelect.selectedIndex];
            let selectedDictionaryUrl = this.selectedDictionary.dataset.url;
            let url;
            // let firstUnhiddenDictionary;
            // // get the first unhidden dictionary
            // this.dictionaries.dictionaries.some((dictionary) => {
            //     if (!dictionary.isHidden) { firstUnhiddenDictionary = dictionary; return dictionary; }
            // })
            // let firstUnhiddenDictionaryUrl = firstUnhiddenDictionary.url
            // url = this.createDictionaryUrlForIFrame(firstUnhiddenDictionaryUrl, this.selectedText.toLocaleLowerCase().trim())
            url = this.createDictionaryUrlForIFrame(selectedDictionaryUrl, this.selectedText.toLocaleLowerCase().trim())
            this.iframe = document.createElement('iframe');
            this.iframe.className = 'my-dictionary-iframe'
            this.iframe.src = chrome.runtime.getURL('data/iframe/iframe.html?url=' + encodeURIComponent(url));
            this.panel.appendChild(this.iframe);
        }
        changeDictionary() {
            if (this.panel) {
                let panelSelect = this.panel.querySelector('.my-dictionary-panel-select');
                let queryInput = this.panel.querySelector('.my-dictionary-query-input');
                panelSelect.addEventListener("change", () => {
                    let iframe = document.querySelector('.my-dictionary-panel').querySelector('iframe');
                    let selectedDictionary = panelSelect.options[panelSelect.selectedIndex];
                    let selectedDictionaryUrl = selectedDictionary.dataset.url;
                    let url;
                    let query = queryInput.value.toLocaleLowerCase().trim();
                    url = this.createDictionaryUrlForIFrame(selectedDictionaryUrl, query);
                    iframe.src = chrome.runtime.getURL('data/iframe/iframe.html?url=' + encodeURIComponent(url));
                });
            }
        }
        changeDictionaryQuery() {
            if (this.panel) {
                let panelSelect = this.panel.querySelector('.my-dictionary-panel-select');
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
                    let selectedDictionary = panelSelect.options[panelSelect.selectedIndex];
                    let selectedDictionaryUrl = selectedDictionary.dataset.url;
                    let url;
                    if (!selectedDictionaryUrl) {
                        selectedDictionaryUrl = this.selectedDictionary.dataset.url;
                    }
                    let query = queryInput.value.toLocaleLowerCase().trim();
                    if ((query != "") && (query != queryOld)) {
                        queryOld = query;
                        url = this.createDictionaryUrlForIFrame(selectedDictionaryUrl, query);
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

        addEventListenerToPanelExtraOption() {
            let panelClose = this.panel.querySelector(".my-dictionary-panel-close");
            let panelMaximizeRestore = this.panel.querySelector(".my-dictionary-panel-maximize-restore");
            let panelBack = this.panel.querySelector(".my-dictionary-panel-back");
            let panelForward = this.panel.querySelector(".my-dictionary-panel-forward");

            panelClose.addEventListener('click', () => {
                this.body.removeChild(this.panel) && (this.panel = null);
                this.fixedPostionElement.style.display = 'none';
            });

            panelMaximizeRestore.addEventListener('click', () => {

                this.panel.classList.toggle('my-dictionary-panel-maximized');
                if (this.panel.classList.contains('my-dictionary-panel-maximized')) {
                    panelMaximizeRestore.innerHTML = '&#128471;';
                    panelMaximizeRestore.setAttribute('title', 'Restore to default');
                } else {
                    panelMaximizeRestore.innerHTML = '&#128470;';
                    panelMaximizeRestore.setAttribute('title', 'Maximize');

                }

            });
            panelBack.addEventListener('click', () => {
                history.back();
                // console.log('this.iframe.contentWindow: ', this.iframe.contentWindow);
            })
            panelForward.addEventListener('click', () => {
                history.forward();
                // console.log('this.iframe.contentWindow: ', this.iframe.contentWindow);
            })

        }
    }
    let dictionary = new Dictionary();
    await dictionary.getDictionariesFromLocalStorage();
    document.body.onmouseup = (e) => {
        // console.log(dictionary.getSelection().toString());
        if (e.target.classList.contains('my-dictionary-popup-select') ||
            e.target.closest(".my-dictionary-popup-select") ||
            e.target.closest(".my-dictionary-panel")) { return; }
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
            dictionary.createPopup()
            dictionary.showPopup(e);
            dictionary.popupSelect.onchange = (evt) => {
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