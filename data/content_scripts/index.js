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
            this.panelMaximized = false;
            this.selectedText = "";
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
                    chrome.storage.sync.get(['dictionaries', "triggerKey"], result => {
                        resolve(result);
                    })
                })
            }
            this.dictionaries = await dictionariesPromise();
        }
        createPopup() {
            this.popupSelect.innerHTML = `${(this.dictionariesOptionsForSelect())}`;
            this.popup.appendChild(this.popupSelect);
        }

        isTriggerKeyPressed(mouseupEvent) {
            let triggerKeysNotNone = ["ctrlKey", "shiftKey", "altKey"];
            // storage triggerKey
            let isStorageTriggerKeyNotNone = (triggerKeysNotNone.indexOf(this.dictionaries.triggerKey) > -1);
            // check if set triggerKey is not "none"
            if (isStorageTriggerKeyNotNone) {
                return (mouseupEvent[this.dictionaries.triggerKey]) ? true : false;
            } else { return true; }
        }


        // this element will be used for black background
        createFixedPostionElement() {
            this.fixedPostionElement = document.createElement('div');
            this.fixedPostionElement.classList.add('create-fixed-postion-element');
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

        getSelectedText() {
            // this.selectedText = this.selection.toString().replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, ' ').trim();
            // this.selectedText = this.selection.toString();
            let activeEl = document.activeElement;
            let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
            if (
                (activeElTagName == "textarea") || (activeElTagName == "input" &&
                    /^(?:text|search|tel|url)$/i.test(activeEl.type)) &&
                (typeof activeEl.selectionStart == "number")
            ) {
                this.selectedText = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);

            } else if (window.getSelection) {
                this.selectedText = window.getSelection().toString();
            }
        }

        removePopup() {
            if (this.isAdded) {
                if (this.body.removeChild(this.popup)) { this.isAdded = false; }
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

            // unset some of the styles that was set in the narrow width to center the popup
            this.popup.style.marginLeft = "unset";
            this.popup.style.position = "absolute";

            let offsetX = 15;
            let offsetY = 10;

            // this width and height represent the width and height defined in the index.css
            let popupWidth = 182;
            let popupHeight = 30;
            let scrollWidthX = window.innerHeight - document.documentElement.clientHeight;
            let scrollWidthY = window.innerWidth - document.documentElement.clientWidth;

            this.popup.style.top = `${event.pageY + offsetY}px`;
            this.popup.style.left = `${event.pageX + offsetX}px`;

            if ((event.x + popupWidth + offsetX + scrollWidthX) >= window.innerWidth) {
                this.popup.style.left = `${event.pageX - popupWidth - offsetX}px`;
            }
            if ((event.x + popupWidth + offsetX + scrollWidthX) >= window.innerWidth &&
                (event.x - popupWidth - scrollWidthX <= 0)) {
                // center the popup
                this.popup.style.top = `${event.y + offsetY}px`;
                this.popup.style.left = "50%";
                // unset the below 2 styles at top
                this.popup.style.position = "fixed";
                this.popup.style.marginLeft = `-${popupWidth / 2}px`; // -91px

            }
            if (event.y + popupHeight + offsetY + scrollWidthY >= window.innerHeight) {
                this.popup.style.top = `${event.pageY - popupHeight - offsetY}px`;
            }


            if (this.body.appendChild(this.popup)) { this.isAdded = true; }
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
          <span class="my-dictionary-panel-back" title="Go back">🠈</span>
          <span class="my-dictionary-panel-forward" title="Go forward">🠊</span>
          <span class="my-dictionary-panel-maximize-restore" title="Maximize">🗖</span>
          <span class="my-dictionary-panel-close" title="Close the panel">🗙</span>
        </div>
        <div class="panel-select-panel-input-conatiner">
          <select class="my-dictionary-panel-select my-dictionary-custom-select">${this.dictionariesOptionsForSelect()}</select>
          <div class="my-dictionary-query-input-container">
            <input class="my-dictionary-query-input" value="${this.selectedText.trim()}">
          </div>
        </div>
          `);
            this.panel.classList.add("my-dictionary-panel");
            if (this.panelMaximized) {
                this.panel.classList.add('my-dictionary-panel-maximized');
            }
            this.fixedPostionElement.style.display = 'block';
            this.panel.querySelector('.my-dictionary-panel-select')
                .addEventListener('change', this.changeDictionary());
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
            // url = this.createDictionaryUrlForIFrame(firstUnhiddenDictionaryUrl, this.selectedText.trim())
            url = this.createDictionaryUrlForIFrame(selectedDictionaryUrl, this.selectedText.trim())
            this.iframe = document.createElement('iframe');
            this.iframe.classList.add('my-dictionary-iframe');
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
                    let query = queryInput.value.trim();
                    url = this.createDictionaryUrlForIFrame(selectedDictionaryUrl, query);
                    iframe.src = chrome.runtime.getURL('data/iframe/iframe.html?url=' + encodeURIComponent(url));
                });
            }
        }
        changeDictionaryQuery() {
            if (this.panel) {
                let panelSelect = this.panel.querySelector('.my-dictionary-panel-select');
                let queryInput = this.panel.querySelector('.my-dictionary-query-input');
                let queryOld = queryInput.value.trim();

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
                    let query = queryInput.value.trim();
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
                    this.panelMaximized = true;
                    panelMaximizeRestore.innerHTML = '🗗';
                    panelMaximizeRestore.setAttribute('title', 'Restore to default');
                } else {
                    this.panelMaximized = false;
                    panelMaximizeRestore.innerHTML = '🗖';
                    panelMaximizeRestore.setAttribute('title', 'Maximize');

                }

            });
            panelBack.addEventListener('click', () => {
                history.back();
            })
            panelForward.addEventListener('click', () => {
                history.forward();
            })

        }
    }
    let dictionary = new Dictionary();
    await dictionary.getDictionariesFromLocalStorage();
    document.body.onmouseup = (mouseupEvent) => {

        if (mouseupEvent.target.classList.contains('my-dictionary-popup-select') ||
            mouseupEvent.target.closest(".my-dictionary-popup-select") ||
            mouseupEvent.target.closest(".my-dictionary-panel")) { return; }
        if (dictionary.removePanelWhenClickedOutside(mouseupEvent)) {
            return;
        }
        setTimeout(() => {
            dictionary.getSelectedText();
            dictionary.removePopup();
            // if triggerKey is not pressed don't excute rest of the code
            if (!dictionary.isTriggerKeyPressed(mouseupEvent)) { return; }
            // if no text is selected or clicked element is popup, don't execute the rest of the code
            if (!dictionary.isSelectedText(mouseupEvent)) { return; }
            dictionary.createPopup()
            dictionary.showPopup(mouseupEvent);
            dictionary.popupSelect.onchange = (evt) => {
                dictionary.removePopup()
                evt.stopPropagation();
                evt.preventDefault();
                dictionary.createPanel(mouseupEvent);
                dictionary.createIFrame();
                dictionary.changeDictionaryQuery();
            }
        })
    }
})()