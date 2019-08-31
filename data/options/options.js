UIflashMessages = document.querySelector('.flash-messages');
UIdictionriesSettings = document.querySelector("#dictionaries-settings");
UIsaveSettings = document.querySelector("#save-settings");


chrome.storage.sync.get(['dictionaries'], result => {
    // console.log(result)
    createDictionariesSettingsLayout(result);
    addNewDictionary();
    sortDictionaries();
    addEventListenerToDictionarySideoptions()

    UIsaveSettings.addEventListener("click", function() {

        let UIdictionaries = UIdictionriesSettings.querySelectorAll(".dictionary");

        let dictionariesToStore = getDictionariesFromInputs(UIdictionaries);

        // save the dictionaries to the local storage
        chrome.storage.sync.set({
            dictionaries: dictionariesToStore,
        });

        showFlashMessages(["settings Saved!"]);
    });

});

function createDictionariesSettingsLayout(result) {

    let dictionaries = result.dictionaries;

    dictionaries.forEach(function(dictionary) {
        let fromTo;
        let preInstalled = (dictionary.preInstalled == 'true') ? true : false;
        let isHidden = (dictionary.isHidden == 'true') ? true : false;


        if (preInstalled) {
            if (dictionary.isGoogleTranslate) {
                let optionFrom = '';
                let optionTo = '';
                dictionariesData[dictionary.id].from.forEach(function(language) {
                    let selectedFrom = (dictionary.from == language[1]) ? "selected" : "";
                    let selectedTo = (dictionary.to == language[1]) ? "selected" : "";
                    optionFrom += `<option ${selectedFrom}  value="${language[1]}">${language[0]}</option>`;
                    optionTo += `<option ${selectedTo} value="${language[1]}">${language[0]}</option>`;
                });
                fromTo = `<label> <strong>Select Language (From)</strong> </label><br><select class="dictionary-from">${optionFrom}</select><br><br>
                <label> <strong>Select Language (To)</strong> </label><br><select class="dictionary-to">${optionTo}</select>`;
            } else {
                let optionFromTo = '';

                // dictionariesData is from dictionaries_data.js
                dictionariesData[dictionary.id].fromTo.forEach(function(language) {
                    let selectedFromTo = (dictionary.fromTo == language[1]) ? "selected" : "";
                    optionFromTo += `<option value="${language[1]}" ${selectedFromTo}>${language[0]}</option>`;
                });
                fromTo = `<label><strong>Select Language</strong> </label><br><select class="dictionary-from-to">${optionFromTo}</select>`;
            }
        }

        let template = templateForDictionary({
            isGoogleTranslate: dictionary.isGoogleTranslate,
            preInstalled,
            isHidden,
            fromTo,
            title: dictionary.title,
            url: dictionary.url,
            id: dictionary.id
        })
        UIdictionriesSettings.insertAdjacentHTML('beforeend', template);
    });

    changeUrlOfPreIntalledDictionaries();
}

function getDictionariesFromInputs(dictionaries) {
    let dictionariesToStore = [];
    [...dictionaries].forEach(function(dictionary) {
        let dictionariesToStoreObj = {};
        let dictionaryTitle = dictionary.querySelector(".dictionary-title").value;
        let dictionaryId = dictionary.querySelector(".dictionary-id").value;
        let dictionaryUrl = dictionary.querySelector(".dictionary-url").value;

        let dictionaryPreInstalled = dictionary.querySelector(".dictionary-preinstalled").value;
        let dictionaryIsHidden = dictionary.querySelector('.dictionary-ishidden');
        if (dictionaryIsHidden) {
            if (dictionaryIsHidden.value === "true") {
                dictionariesToStoreObj.isHidden = "true";
            }
        }
        if (dictionaryPreInstalled === 'true') {
            if (dictionary.id == 'google-translate') {
                let dictionaryFrom = dictionary.querySelector(".dictionary-from");
                let dictionaryTo = dictionary.querySelector(".dictionary-to");
                let dictionaryFromSelected = getSelectedOption(dictionaryFrom)
                let dictionaryToSelected = getSelectedOption(dictionaryTo)
                dictionariesToStoreObj.from = dictionaryFromSelected
                dictionariesToStoreObj.to = dictionaryToSelected
                dictionariesToStoreObj.isGoogleTranslate = true;
            } else {
                let dictionaryFromTo = dictionary.querySelector(".dictionary-from-to");
                let dictionaryFromToSelected = getSelectedOption(dictionaryFromTo);
                dictionariesToStoreObj.fromTo = dictionaryFromToSelected;
            }
        }



        dictionariesToStoreObj.title = dictionaryTitle;
        dictionariesToStoreObj.id = dictionaryId;
        dictionariesToStoreObj.url = dictionaryUrl;
        dictionariesToStoreObj.preInstalled = dictionaryPreInstalled;
        dictionariesToStore.push(dictionariesToStoreObj);
    });
    return dictionariesToStore;
}




function addNewDictionary() {
    let UIaddNewDictionaryBtn = document.querySelector("#add-new-dictionary-btn");
    let dictionaryTitle = document.querySelector('.add-new-dictionary .dictionary-title');
    let dictionaryUrl = document.querySelector('.add-new-dictionary .dictionary-url');
    UIaddNewDictionaryBtn.addEventListener('click', function(e) {
        let error = {};
        // let id = ('_' + Math.random().toString(36).substr(2, 9));

        let title = (dictionaryTitle.value).trim();
        let url = dictionaryUrl.value;

        if ((title.length >= 50) || (title.length <= 0)) {
            error.invalidTitleLength = 'Title length should be between 1 to 20';
            showFlashMessages([error.invalidTitleLength], "red")
        } else if (!isValidURL(url)) {
            error.invalidUrl = "URL is invalid";
            showFlashMessages([error.invalidUrl], "red")
        } else {
            let newDictionaryTemplate = templateForDictionary({
                title,
                url,
            });
            UIdictionriesSettings.insertAdjacentHTML('afterbegin', newDictionaryTemplate);
            showFlashMessages(["New dictionary is added, please save the changes."]);
            dictionaryTitle.value = "";
            dictionaryUrl.value = "";
            // add eventListener to newly created dictionary
            addEventListenerToDictionarySideoptions(true)

        }

        if (!isObjEmpty(error)) {
            // console.log(error)

        }

    })
}



function isValidURL(string) {
    let res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null);
};

function isObjEmpty(obj) {
    // if (Object.entries(obj).length === 0 && obj.constructor === Object) {
    //   return true;
    // }
    // return false;
    return (Object.entries(obj).length === 0 && obj.constructor === Object) ? true : false
}

function showFlashMessages(messages = [], BGColor = "rgb(6, 178, 184)") {

    UIflashMessages.style.backgroundColor = BGColor;
    UIflashMessages.style.display = 'block';
    UIflashMessages.innerHTML = "";

    messages.forEach(function(message) {
        UIflashMessages.insertAdjacentHTML('beforeend', `<strong>${message}</strong>`)
    })

    setTimeout(function() {
        UIflashMessages.style.display = 'none';
    }, 2000);

}

function sortDictionaries() {
    Sortable.create(UIdictionriesSettings, {
        handle: '.dictionary-drag',
        animation: 150
    });
}


function templateForDictionary({
    isGoogleTranslate = false,
    preInstalled = false,
    isHidden = false,
    fromTo,
    title,
    url,
    id = ('_' + Math.random().toString(36).substr(2, 9))
} = {}) {


    // alert(('_' + Math.random().toString(36).substr(2, 9)))
    return `
    <div ${isGoogleTranslate ? 'id="google-translate"' : ''} class="dictionary" style="">
    <div class="flex-container nowrap" style="justify-content: space-between">
      <div class="column">${sanitize(title)}</div>
      <div class="column" style="text-align: right">
      <span class="dictionary-edit" style="font-size: 25px; cursor: pointer; margin-right: 10px" title="Edit the dictionary"><strong>&#x1F589;</strong></span>
      <span class="dictionary-hide" style="font-size: 25px; ${(isHidden ? 'text-decoration: line-through;': '')} cursor: pointer; margin-right: 10px" title="Hide the dictionary"><strong>&#128065;</strong></span>
      ${(preInstalled ? '' : '<span class="dictionary-remove" style="font-size: 25px; cursor: pointer; margin-right: 10px; color: red;" title="Remove the dictionary"><strong>&#128473;</strong></span>')}
      <span class="dictionary-drag" style="font-size: 25px; cursor: grab" title="Sort by draging and droping"><strong>&#x2630</strong></span>
      </div>
    </div>
    <div class="dictionary-edited" style="display:none">
    <br>
    <label><strong>Title </strong></label><br>
    <input type="text" class="dictionary-title" value="${title}" ${(preInstalled ? "disabled" : '')}> <br><br>
    <input type="hidden" class="dictionary-id" value="${id}" ${(preInstalled ? "disabled" : '')}>
    <label><strong>URL </strong></label><br> 
    <input type="text" class="dictionary-url" value="${url.replace(/"/g, '&quot;').replace(/'/g, '&#x27;')}" ${(preInstalled ? "disabled" : '')}> <br><br>
    <input type="hidden" class="dictionary-preinstalled" value="${preInstalled}">
    <input type="hidden" class="dictionary-ishidden" value="${isHidden}">
    ${( preInstalled ? fromTo + '<br><br>' : '' )}
    <button class="dictionary-done">Done</button><br>
    </div>
    </div>`;
}

function addEventListenerToDictionarySideoptions(onJustFirstElement = false) {
    if (!onJustFirstElement) {

        UIallDictionaries = UIdictionriesSettings.querySelectorAll(".dictionary");

        [...UIallDictionaries].forEach(eventListenerForSideOptions());

    } else if (onJustFirstElement) {
        let UIfirstDictionary = UIdictionriesSettings.querySelector('.dictionary');
        (eventListenerForSideOptions())(UIfirstDictionary);
    }
}

function eventListenerForSideOptions() {
    return function(dictionary) {
        let UIdictionaryEdit = dictionary.querySelector(".dictionary-edit");
        let UIdictionaryHide = dictionary.querySelector(".dictionary-hide");
        let UIdictionaryRemove = dictionary.querySelector(".dictionary-remove");
        let UIdictionaryDone = dictionary.querySelector(".dictionary-done");


        UIdictionaryEdit.addEventListener('click', function(e) {
            let UIdictionaryEdited = dictionary.querySelector(".dictionary-edited");
            if (UIdictionaryEdited.style.display === 'none') {
                UIdictionaryEdited.style.display = ""
            } else {
                UIdictionaryEdited.style.display = "none"
            }
        });
        UIdictionaryHide.addEventListener('click', function(e) {
            let UIdictionaryIshidden = dictionary.querySelector('.dictionary-ishidden');

            if (UIdictionaryIshidden.value === "true") {
                UIdictionaryIshidden.value = "false"
                UIdictionaryHide.style.textDecoration = '';
            } else {
                UIdictionaryIshidden.value = "true"
                UIdictionaryHide.style.textDecoration = 'line-through';

            }
        });
        if (UIdictionaryRemove) {
            UIdictionaryRemove.addEventListener('click', function(e) {
                dictionary.parentNode.removeChild(dictionary);

            });
        }
        UIdictionaryDone.addEventListener('click', function(e) {
            let UIdictionaryEdited = dictionary.querySelector(".dictionary-edited");
            UIdictionaryEdited.style.display = "none"
        });

    }
}

function changeUrlOfPreIntalledDictionaries() {
    UIallDictionaries = UIdictionriesSettings.querySelectorAll(".dictionary");

    [...UIallDictionaries].forEach(function(dictionary) {
        let UIdictionaryPreinstalled = dictionary.querySelector('.dictionary-preinstalled')
        if (UIdictionaryPreinstalled.value == 'true') {
            let dictionaryId = dictionary.querySelector('.dictionary-id').value;
            let dictionaryUrl = dictionary.querySelector('.dictionary-url');
            if (dictionary.getAttribute("id") == 'google-translate') {
                let UIdictionaryFrom = dictionary.querySelector('.dictionary-from');
                let UIdictionaryTo = dictionary.querySelector('.dictionary-to');
                UIdictionaryFrom.addEventListener('change', function(e) {
                    let selectedDctionaryFrom = getSelectedOption(UIdictionaryFrom);
                    let selectedDctionaryTo = getSelectedOption(UIdictionaryTo);
                    let newUrl = dictionariesData[dictionaryId].generateUrl(selectedDctionaryFrom, selectedDctionaryTo)
                    dictionaryUrl.value = newUrl;
                })
                UIdictionaryTo.addEventListener('change', function(e) {
                    let selectedDctionaryFrom = getSelectedOption(UIdictionaryFrom);
                    let selectedDctionaryTo = getSelectedOption(UIdictionaryTo);
                    let newUrl = dictionariesData[dictionaryId].generateUrl(selectedDctionaryFrom, selectedDctionaryTo)
                    dictionaryUrl.value = newUrl;
                })
            } else {
                let UIdictionaryFromTo = dictionary.querySelector('.dictionary-from-to');
                UIdictionaryFromTo.addEventListener('change', function(e) {
                    let selectedDctionaryFromTo = getSelectedOption(UIdictionaryFromTo);
                    let newUrl = dictionariesData[dictionaryId].generateUrl(selectedDctionaryFromTo)
                    dictionaryUrl.value = newUrl;
                })
            }
        }
    });

    // UIfromTo.addEventListener('change', function(e) {alert("You are disgusting!")})
}

function getSelectedOption(e) {
    return e.options[e.selectedIndex].value
}


function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]));
}