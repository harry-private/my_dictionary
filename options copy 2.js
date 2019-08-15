UIflashMessages = document.querySelector('.flash-messages');
UIdictionriesSettings = document.querySelector("#dictionaries-settings");
UIdictionriesHiddenSettings = document.querySelector("#dictionaries-hidden-settings");
UIsaveSettings = document.querySelector("#save-settings");

chrome.storage.sync.get(['dictionaries', 'dictionariesHidden'], result => {
  console.log(result)

  // create layout settings - main
  createDictionariesSettingsLayout(result, "dictionaries");

  // create layout settings - hidden
  createDictionariesSettingsLayout(result, "dictionariesHidden");

  // move dictionaries to hidden or other way around
  hideDictionary();
  showDictionary();

  addNewDictionary();
  sortDictionaries();

  // when clicked on the save-setting btn
  UIsaveSettings.addEventListener("click", function() {

    let UIdictionaries = UIdictionriesSettings.querySelectorAll(".dictionary");
    let UIdictionariesHidden = UIdictionriesHiddenSettings.querySelectorAll(".dictionary");

    let dictionariesToStore = getDictionariesFromInputs(UIdictionaries);
    let dictionariesToStoreInHidden = getDictionariesFromInputs(UIdictionariesHidden);


    console.log("Main", dictionariesToStore);
    console.log("Hidden", dictionariesToStoreInHidden);
    // save the dictionaries to the local storage
    chrome.storage.sync.set({
      dictionaries: dictionariesToStore,
      dictionariesHidden: dictionariesToStoreInHidden
    });

    showFlashMessages(["settings Saved!"]);
  });


});

// fucntions 


function createDictionariesSettingsLayout(result, dictionariesFrom) {
  let dictionaries = (dictionariesFrom == 'dictionaries') ? result.dictionaries : result.dictionariesHidden;
  let layoutFor = (dictionariesFrom == 'dictionaries') ? UIdictionriesSettings : UIdictionriesHiddenSettings;
  let hideOrShowbtn = (dictionariesFrom == 'dictionaries') ? '<button class="hide">Hide</button>' : '<button class="show">Show</button>';
  dictionaries.forEach(function(dictionary) {
    let fromTo;
    let preInstalled = (dictionary.preInstalled == 'true') ? true : false;
    // console.log(preInstalled)
    if (preInstalled) {
      if (dictionary.isGoogleTranslate) {
        let optionFrom;
        let optionTo;
        dictionariesData[dictionary.id].from.forEach(function(language) {
          let selectedFrom = (dictionary.from == language[1]) ? "selected" : "";
          let selectedTo = (dictionary.to == language[1]) ? "selected" : "";
          optionFrom += `<option ${selectedFrom}  value="${language[1]}">${language[0]}</option>`;
          optionTo += `<option ${selectedTo} value="${language[1]}">${language[0]}</option>`;
        });
        fromTo = `<label> <strong>Select Language (From)</strong> </label><br><select class="dictionary-from">${optionFrom}</select><br><br>
                <label> <strong>Select Language (To)</strong> </label><br><select class="dictionary-to">${optionTo}</select>`;
      } else {
        let optionFromTo;
        // console.log(dictionariesData[dictionary.id]);

        dictionariesData[dictionary.id].fromTo.forEach(function(language) {
          let selectedFromTo = (dictionary.fromTo == language[1]) ? "selected" : "";
          optionFromTo += `<option value="${language[1]}" ${selectedFromTo}>${language[0]}</option>`;
        });
        fromTo = `<label><strong>Select Language</strong> </label><br><select class="dictionary-from-to">${optionFromTo}</select>`;
      }
    }

    let template = `
    <div ${dictionary.isGoogleTranslate ? 'id="google-translate"' : ''} class="dictionary" style="background: #eee; margin-bottom: 30px; padding: 15px">
    <p>${dictionary.title}</p>
    <span class="drag-me" style="cursor: move;">Drag me to sort</span><br><br>
    <label><strong>Title </strong></label><br>
    <input type="text" class="dictionary-title" value="${dictionary.title}" ${(preInstalled ? "disabled" : '')}> <br><br>
    <input type="hidden" class="dictionary-id" value="${dictionary.id}" ${(preInstalled ? "disabled" : '')}>
    <label><strong>URL </strong></label><br> 
    <input type="text" class="dictionary-url" value="${dictionary.url}" ${(preInstalled ? "disabled" : '')}> <br><br>
    <input type="hidden" class="dictionary-preinstalled" value="${preInstalled}">
    ${( preInstalled ? fromTo + '<br><br>' : '' )}
    ${hideOrShowbtn}
    <hr><br>
    </div>`;
    layoutFor.insertAdjacentHTML('beforeend', template);
  });
}


function getDictionariesFromInputs(dictionaries) {
  let dictionariesToStore = [];
  [...dictionaries].forEach(function(dictionary) {
    let dictionariesToStoreObj = {};
    // console.log(dictionary.id)
    let dictionaryTitle = dictionary.querySelector(".dictionary-title").value;
    let dictionaryId = dictionary.querySelector(".dictionary-id").value;
    let dictionaryUrl = dictionary.querySelector(".dictionary-url").value;
    let dictionaryPreInstalled = dictionary.querySelector(".dictionary-preinstalled").value;

    // console.log((dictionaryPreInstalled === 'true' ? 'prrrrrrrr' : "noooooooooooo"));
    if (dictionaryPreInstalled === 'true') {
      if (dictionary.id == 'google-translate') {
        let dictionaryFrom = dictionary.querySelector(".dictionary-from");
        let dictionaryTo = dictionary.querySelector(".dictionary-to");
        let dictionaryFromSelected = dictionaryFrom.options[dictionaryFrom.selectedIndex].value
        let dictionaryToSelected = dictionaryTo.options[dictionaryTo.selectedIndex].value
        dictionariesToStoreObj.from = dictionaryFromSelected
        dictionariesToStoreObj.to = dictionaryToSelected
        dictionariesToStoreObj.isGoogleTranslate = true;
      } else {
        let dictionaryFromTo = dictionary.querySelector(".dictionary-from-to");
        let dictionaryFromToSelected = dictionaryFromTo.options[dictionaryFromTo.selectedIndex].value
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

// function hideDictionary() {
//   let UIhide = UIdictionriesSettings.querySelectorAll(".hide");
//   [...UIhide].forEach(function(hide) {
//     hide.addEventListener('click',
//       hideEventListener(hide), { once: true });
//   });
// }

function hideDictionary(onJustFirstElement = false) {

  if (!onJustFirstElement) {
    let UIhide = UIdictionriesSettings.querySelectorAll(".hide");
    [...UIhide].forEach(function(hide) {
      hide.addEventListener('click',
        hideEventListener(hide), { once: true });
    });
  } else if (onJustFirstElement) {
    let hide = UIdictionriesSettings.querySelector('.hide');
    console.log(hide)
    hide.addEventListener('click', hideEventListener(hide))
  }


}

function showDictionary(onJustFirstElement = false) {
  if (!onJustFirstElement) {
    let UIshow = UIdictionriesHiddenSettings.querySelectorAll(".show");
    [...UIshow].forEach(function(show) {
      show.addEventListener('click',
        showEventListener(show), { once: true });
    });
  } else if (onJustFirstElement) {
    let show = UIdictionriesHiddenSettings.querySelector('.show');
    show.addEventListener('click', showEventListener(show))
  }


}



function hideEventListener(hide) {
  return function(e) {
    let dictionaryToHide = hide.closest('.dictionary');
    // dictionaryToHide.parentNode.removeChild(dictionaryToHide)
    // console.log(hide);
    hide.classList.remove("hide");
    hide.classList.add("show");
    hide.innerText = 'Show';
    removeFadeOut(dictionaryToHide, 1000);
    setTimeout(() => {
      console.log(dictionaryToHide);
      dictionaryToHide.style.opacity = '1';
      UIdictionriesHiddenSettings.insertAdjacentHTML('afterbegin', dictionaryToHide.outerHTML);
      // calling this fucntion here, because otherwise show functionality won't work on
      // - newly hidden/created dictionaries
      showDictionary(true);
    }, 1000);
  };
}


function showEventListener(show) {
  return function(e) {
    let dictionaryToShow = show.closest('.dictionary');
    // dictionaryToHide.parentNode.removeChild(dictionaryToHide)
    // console.log(hide);
    show.classList.add("hide");
    show.classList.remove("show");
    show.innerText = 'Hide';
    removeFadeOut(dictionaryToShow, 1000);
    setTimeout(() => {
      console.log(dictionaryToShow);
      dictionaryToShow.style.opacity = '1';
      UIdictionriesSettings.insertAdjacentHTML('afterbegin', dictionaryToShow.outerHTML);
      // calling this fucntion here, because otherwise show functionality won't work on
      // - newly hidden/created dictionaries
      hideDictionary(true);
    }, 1000);
  };
}






function removeFadeOut(el, speed) {
  let seconds = speed / 1000;
  el.style.transition = "opacity " + seconds + "s ease";

  el.style.opacity = 0;
  setTimeout(function() {
    el.parentNode.removeChild(el);
  }, speed);
}


function addNewDictionary() {
  let UIaddNewDictionaryBtn = document.querySelector("#add-new-dictionary-btn");
  let dictionaryTitle = document.querySelector('.add-new-dictionary .dictionary-title');
  let dictionaryUrl = document.querySelector('.add-new-dictionary .dictionary-url');
  // console.log(dictionaryTitle)
  UIaddNewDictionaryBtn.addEventListener('click', function(e) {
    let error = {};
    let id = ('_' + Math.random().toString(36).substr(2, 9));

    let title = dictionaryTitle.value;
    let url = dictionaryUrl.value;

    if ((title.length >= 50) || (title.length <= 0)) {
      error.invalidTitleLength = 'Title length should be between 1 to 20';
      showFlashMessages([error.invalidTitleLength], "red")
    } else if (!isValidURL(url)) {
      error.invalidUrl = "URL is invalid";
      showFlashMessages([error.invalidUrl], "red")
    } else {
      // console.log((title))
      // console.log(url);
      // console.log(id);
      let newDictionaryTemplate = `<div class="dictionary">
      <label><strong>Title </strong></label><br>
      <input type="text" class="dictionary-title" value="${title}"> <br><br>
      <input type="hidden" class="dictionary-id" value="${id}">
      <label><strong>URL </strong></label><br> 
      <input type="text" class="dictionary-url" value="${url}"> <br><br>
      <input type="hidden" class="dictionary-preinstalled" value="false">
      <button class="hide">Hide</button>
      <hr><br>
      </div>`;
      UIdictionriesSettings.insertAdjacentHTML('afterbegin', newDictionaryTemplate);
      showFlashMessages(["New dictionary is added, please save changes."]);
      dictionaryTitle.value = "";
      dictionaryUrl.value = "";
      // add eventListener to newly created dictionary
      hideDictionary(true)

    }

    if (!isObjEmpty(error)) {
      console.log(error)

    }

  })
}

function isValidURL(string) {
  let res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null);
};

function isObjEmpty(obj) {
  if (Object.entries(obj).length === 0 && obj.constructor === Object) {
    return true;
  }
  return false;

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
  }, 1000);

}
// chrome.storage.sync.clear()


function sortDictionaries() {
  Sortable.create(UIdictionriesSettings, {
    handle: '.drag-me',
    animation: 150
  })
  //sorting the hidden dictionaries doesn't make any sense
  // Sortable.create(UIdictionriesHiddenSettings, {
  //   handle: '.drag-me',
  //   animation: 150
  // })
}