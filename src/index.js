"use strict";
//@ts-check

const HOUR    = 1000 * 60 * 60;
const HOUR12  = 1000 * 60 * 60 * 12;
const DAY     = 1000 * 60 * 60 * 24;
const WEEK    = 1000 * 60 * 60 * 24 * 7;
const WEEK4   = 1000 * 60 * 60 * 24 * 7 * 4;

const ORIGIN_TYPE_EXTENSION = "extension";
const ORIGIN_TYPE_PROTECTEDWEB = "protectedWeb";
const ORIGIN_TYPES = [ORIGIN_TYPE_EXTENSION, ORIGIN_TYPE_PROTECTEDWEB];

const GLOBAL_TYPES = [
    "appcache",
    "cache",
    "cacheStorage",
    "cookies",
    "downloads",
    "fileSystems",
    "formData",
    "history",
    "indexedDB",
    "localStorage",
    "passwords",
    "serviceWorkers",
    "webSQL"
];

const CURRENT_TYPES = [
    "cache",
    "cookies",
    "localStorage"
];

const GlobalDataTypeSet = {
    "appcache": false,
    "cache": false,
    "cacheStorage": false,
    "cookies": false,
    "downloads": false,
    "fileSystems": false,
    "formData": false,
    "history": false,
    "indexedDB": false,
    "localStorage": false,
    "passwords": false,
    "serviceWorkers": false,
    "webSQL": false
};

const CurrentDataTypeSet = {
    "cache": false,
    "cookies": false,
    "localStorage": false,
};

const GlobalOriginTypes = {
    extension: false,
    protectedWeb: false,
    unprotectedWeb: true
};

const GlobalRemovalOptions = {
    excludeOrigins: undefined,
    originTypes: GlobalOriginTypes,
    origins: undefined,
    since: 0,
};

const CurrentRemovalOptions = {
    excludeOrigins: undefined,
    originTypes: {
        extension: false,
        protectedWeb: false,
        unprotectedWeb: true
    },
    origins: [],
    since: 0,
};

const GlobalPermitted = [];
const CurrentPermitted = [];

let currentDataToRemove = 0;
let globalDataToRemove = 0;

const DOMHeaderButtons = document.getElementById("header-buttons");
//UI ASSERT
if (DOMHeaderButtons === null) {
    throw Error("#header-buttons does not exist");
}

const DOMCurrent = document.forms["current"];
const DOMGlobal = document.forms["global"];
//UI ASSERT
if (DOMCurrent === null) {
    throw Error("'current form' does not exist");
}
if (DOMGlobal === null) {
    throw Error("'global form' does not exist");
}

const DOMCurrentSet = DOMCurrent["data-set"];
const DOMGlobalSet = DOMGlobal["data-set"];
//UI ASSERT
if (DOMCurrentSet.children.length !== CURRENT_TYPES.length) {
    throw Error("'current form fieldset' does not have all CURRENT_TYPES");
}

const DOMSelect = document.getElementById("since");
if (DOMSelect === null) {
    throw Error("#since does not exist");
}

chrome.browsingData.settings(function (result) {
    console.info(result);
    let globalPermitted = false;
    for (const type of GLOBAL_TYPES) {
        if (result.dataRemovalPermitted[type] && result.dataToRemove[type]) {
            globalPermitted = true;
            GlobalDataTypeSet[type] = true;
            globalDataToRemove += 1;
            GlobalPermitted.push(type);
            DOMGlobal[type]?.removeAttribute("disabled");
        }
    }
    for (const type of CURRENT_TYPES) {
        if (result.dataRemovalPermitted[type] && result.dataToRemove[type]) {
            CurrentDataTypeSet[type] = true;
            CurrentPermitted.push(type);
            currentDataToRemove += 1;
        }
    }

    if (globalPermitted) {
        DOMGlobal["button-delete"].disabled = false;
        DOMGlobal["button-clear"].disabled = false;
    }

    if (result.options.originTypes?.extension) {
        DOMGlobal[ORIGIN_TYPE_EXTENSION].disabled = false;
    }
    if (result.options.originTypes?.protectedWeb) {
        DOMGlobal[ORIGIN_TYPE_PROTECTEDWEB].disabled = false;
    }
});

(async function () {
    const tabData = await chrome.tabs.query({active: true, currentWindow: true});
    const injection = {
        target: {tabId: tabData[0].id},
        func: function () {
            return window.location.origin;
        }
    };

    let res;
    try { res = await chrome.scripting.executeScript(injection); }
    catch { return; }

    CurrentRemovalOptions.origins.push(res[0].result);

    let currentPermitted = false;
    for (const type of CURRENT_TYPES) {
        if (CurrentDataTypeSet[type]) {
            currentPermitted = true;
            DOMCurrent[type]?.removeAttribute("disabled");
        }
    }
    if (currentPermitted) {
        DOMCurrent["button-delete"].removeAttribute("disabled");
        DOMCurrent["button-clear"].removeAttribute("disabled");
    }
}());

DOMCurrent["button-delete"].onclick = function () {
    if (CurrentDataTypeSet.cookies) {
        chrome.browsingData.removeCookies(CurrentRemovalOptions);
    }
    if (CurrentDataTypeSet.cache) {
        chrome.browsingData.removeCache(CurrentRemovalOptions);
    }
    if (CurrentDataTypeSet.localStorage) {
        chrome.browsingData.removeLocalStorage(CurrentRemovalOptions);
    }
};

DOMCurrent.oninput = function (e) {
    const target = e.target;
    if (CurrentDataTypeSet[target.name] === undefined) {
        console.error("ERROR: does not have a target.name");
        return;
    }
    CurrentDataTypeSet[target.name] = target.checked;
    if (target.checked) {
        currentDataToRemove += 1;
    } else {
        currentDataToRemove -= 1;
    }
    DOMCurrent["button-delete"].disabled = (currentDataToRemove < 1);
}

DOMCurrent["button-clear"].onclick = function () {
    for (const type of CurrentPermitted) {
        DOMCurrent[type].checked = false;
        CurrentDataTypeSet[type] = false;
    }
}

DOMGlobal["button-delete"].onclick = function () {
    if (GlobalDataTypeSet.appcache) {
        chrome.browsingData.removeAppcache(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.cache) {
        chrome.browsingData.removeCache(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.cacheStorage) {
        chrome.browsingData.removeCacheStorage(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.cookies) {
        chrome.browsingData.removeCookies(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.downloads) {
        chrome.browsingData.removeDownloads(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.fileSystems) {
        chrome.browsingData.removeFileSystems(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.formData) {
        chrome.browsingData.removeFormData(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.history) {
        chrome.browsingData.removeHistory(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.indexedDB) {
        chrome.browsingData.removeIndexedDB(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.localStorage) {
        chrome.browsingData.removeLocalStorage(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.passwords) {
        chrome.browsingData.removePasswords(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.serviceWorkers) {
        chrome.browsingData.removeServiceWorkers(GlobalRemovalOptions);
    }
    if (GlobalDataTypeSet.webSQL) {
        chrome.browsingData.removeWebSQL(GlobalRemovalOptions);
    }
};

DOMGlobal.oninput = function (e) {
    const target = e.target;
    if (target.parentElement?.name === "data-set") {
        if (GlobalDataTypeSet[target.name] === undefined) {
            console.error("ERROR: does not have a target.name");
            return;
        }
        GlobalDataTypeSet[target.name] = target.checked;
        if (target.checked) {
            globalDataToRemove += 1;
        } else {
            globalDataToRemove -= 1;
        }
        DOMGlobal["button-delete"].disabled = (globalDataToRemove < 1);
    } else if (target.parentElement?.name === "origin-types") {
        for (let type of ORIGIN_TYPES) {
            if (target.name === type) {
                DOMGlobal[type] = target.checked;
                GlobalOriginTypes[type] = target.checked;
            }
        }
    }
}

DOMGlobal["button-clear"].onclick = function () {
    for (const type of GlobalPermitted) {
        DOMGlobal[type].checked = false;
        GlobalDataTypeSet[type] = false;
    }
}

DOMSelect.onchange = function (e) {
    const value = e.target.value;
    switch (value) {
        case "0": {
            CurrentRemovalOptions.since = 0;
            GlobalRemovalOptions.since = 0;
            break;
        }
        case "1": {
            CurrentRemovalOptions.since = (new Date()).getTime() - HOUR;
            GlobalRemovalOptions.since = (new Date()).getTime() - HOUR;
            break;
        }
        case "2": {
            CurrentRemovalOptions.since = (new Date()).getTime() - HOUR12;
            GlobalRemovalOptions.since = (new Date()).getTime() - HOUR12;
            break;
        }
        case "3": {
            CurrentRemovalOptions.since = (new Date()).getTime() - DAY;
            GlobalRemovalOptions.since = (new Date()).getTime() - DAY;
            break;
        }
        case "4": {
            CurrentRemovalOptions.since = (new Date()).getTime() - WEEK;
            GlobalRemovalOptions.since = (new Date()).getTime() - WEEK;
            break;
        }
        case "5": {
            CurrentRemovalOptions.since = (new Date()).getTime() - WEEK4;
            GlobalRemovalOptions.since = (new Date()).getTime() - WEEK4;
            break;
        }
    }
}

DOMHeaderButtons.onclick = function (e) {
    const target = e.target;
    console.log(target);
    if (target.name === "about") {
        window.open(chrome.runtime.getURL("about.html"));
        if (chrome.runtime.openOptionsPage !== undefined) {
            chrome.runtime.openOptionsPage();
        } else {
        }
    } else if (target.name === "close") {
        window.close();
    }
}
