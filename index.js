// import 'babel-polyfill'
(async () => {
    'use strict'




    class Dictionary {
        constructor() {
            this.dictionaries = {};
            // const WEBSITE_URL = `https://dictionary.cambridge.org/search/${dictionary}/direct/`
            this.webSiteUrl = `https://translate.google.co.in/#view=home&op=translate&sl=auto&tl=hi&text=`;
            // const WEBSITE_URL = `https://www.ldoceonline.com/dictionary/`
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

            // appending dictionary- because StackOverflow has the popup class, so won't work there
            this.popupIcon.classList.add('dictionary-popup-icon');
            this.popup.classList.add('dictionary-popup');
            this.popup.appendChild(this.popupIcon);
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
        removePanelWhenClickedOutside(event) {
            if (this.panel && event.target !== this.panel && !this.panel.contains(event.target)) {
                this.body.removeChild(this.panel) && (this.panel = null);
                return true;
            }
            return false;
        }
        getSelection() {
            this.selection = window.getSelection();
        }
        getSelectedText() {
            this.selectedText = this.selection.toString().replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, ' ').trim();
        }
        getRelative() {
            this.relative = document.body.parentNode.getBoundingClientRect();
        }
        getBCR() {
            // console.log(this.selection)
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
            if (!this.selectedText || event.target === this.popup || this.selectedText.includes(' ')) {
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
            let offsetTop = this.bcr.bottom - this.relative.top - this.offset;
            if (offsetTop - this.html.scrollTop < this.panelHeight) {
                offsetTop += 27;
            } else if (offsetTop + this.panelHeight > this.html.scrollTop) {
                offsetTop -= this.panelHeight;
            }
            this.panel = document.createElement("div");
            console.log(this.dictionaries.dictionaries)
            this.dictionaries.dictionaries.forEach(function(dictionary) {

                option += `<option class="longman" value="longman" data-url="${dictionary.url}">${dictionary.title}</option>`
            });

            this.panel.insertAdjacentHTML("afterbegin", `
            <select class="selectDictionary" style="position:sticky; width: 100%; height: 36px; background: #ccceee">${option}</select>
            <span id="selection" style="display:none">${this.selectedText}</span>`);
            this.panel.className = "my-panel";
            this.panel.style.width = `${this.panelWidth}px`;
            this.panel.style.height = `${this.panelHeight}px`;
            this.panel.style.zIndex = 999999999;
            this.panel.style.position = 'absolute';
            this.panel.style.top = `${offsetTop}px`;
            this.panel.style.resize = 'both';
            this.panel.style.overflow = 'auto';
            this.panel.style.background = '#cdecde';
            this.panel.style.border = '1px solid #ccc';
            if (event.clientX + this.panelWidth > this.body.clientWidth) {
                this.panel.style.left = `${this.body.clientWidth + this.html.scrollLeft - this.panelWidth}px`;
            } else {
                this.panel.style.left = `${event.clientX + this.html.scrollLeft - 10}px`;
            }
            this.body.appendChild(this.panel);
        }
        createIFrame() {
            let url;
            let firstDictionaryUrl = this.dictionaries.dictionaries[0].url;


            // alert(firstDictionary)

            url = this.createDictionaryUrlForIFrame(firstDictionaryUrl, this.selectedText.toLocaleLowerCase())

            this.iframe = document.createElement('iframe');

            this.iframe.src = url;
            this.iframe.style.width = `100%`;
            this.iframe.style.height = `100%`;
            this.iframe.style.border = 'none';
            // this.iframe.style.resize = 'both'
            // this.iframe.style.overflow = 'hidden';
            this.panel.appendChild(this.iframe);
        }

        changeDictionary() {
            if (this.panel) {
                let selectedDictionary = this.panel.querySelector('.selectDictionary');
                selectedDictionary.addEventListener("change", () => {
                    let selectedOption = selectedDictionary.options[selectedDictionary.selectedIndex];
                    let selectedOptionUrl = selectedOption.dataset.url;
                    let url;
                    console.log(selectedOptionUrl)
                    let query = (this.panel.querySelector("#selection").innerHTML).toLocaleLowerCase();
                    url = this.createDictionaryUrlForIFrame(selectedOptionUrl, query);
                    this.iframe.src = url;
                });
            }
        }



        createDictionaryUrlForIFrame(url, query) {
            if ((url).includes("%s")) {
                return url.replace("%s", query);
            } else {
                return `${url}/${query}`;
            }
        }
    }


    let dictionary = new Dictionary();

    await dictionary.getDictionariesFromLocalStorage();
    // console.log(dictionary.dictionaries);
    document.body.onmouseup = (e) => {

        // document.addEventListener("keydown", event => {
        //   if (event.isComposing || event.keyCode === 229) {
        //     return;
        //   }
        //   if (event.code == 'Escape') {
        //     console.log(panel);
        //     if (panel) {
        //       body.removeChild(panel) && (panel = null);
        //       return;
        //     }
        //   }
        // });

        // if (panel) {
        //   console.log(panel)
        //   let select = panel.querySelector("select");
        //   // console.log(longman)
        //   select.addEventListener("change", function(e) {
        //     let selectedOption = select.options[select.selectedIndex].dataset.url;
        //     // console.log("Slected Options", selectedOption)
        //     let slection = panel.querySelector("#selection").innerHTML;
        //     // alert
        //     iframe.src = `https://www.ldoceonline.com/dictionary/${slection}`;
        //   });


        // }


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
            }
            // body.appendChild(cambridgeEle) && (isAdded = true)
            // myPanel = document.body.querySelector('.my-panel')



        })
    }
})()