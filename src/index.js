"use strict";
//@ts-check
const VERSION = "0.2.1";

const HOUR    = 1000 * 60 * 60;
const HOUR12  = 1000 * 60 * 60 * 12;
const DAY     = 1000 * 60 * 60 * 24;
const WEEK    = 1000 * 60 * 60 * 24 * 7;
const WEEK4   = 1000 * 60 * 60 * 24 * 7 * 4;

const ORIGIN_TYPE_EXTENSION = "extension";
const ORIGIN_TYPE_PROTECTEDWEB = "protectedWeb";
const ORIGIN_TYPES = [ORIGIN_TYPE_EXTENSION, ORIGIN_TYPE_PROTECTEDWEB];

const BrowserOriginTypes = {
    extension: false,
    protectedWeb: false,
    unprotectedWeb: true
};

const BrowserRemovalOptions = {
    excludeOrigins: undefined,
    originTypes: BrowserOriginTypes,
    origins: undefined,
    since: 0,
};

const DBrowser = {
    /** @type{HTMLFormElement} */
    FORM: (function () {
        const form = document.forms["browser"];
        if (form === null) {
            throw Error("'browser form' does not exist");
        }
        return form;
    }()),
    TYPES: [
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
    ],
    toClean: {
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
    },
    permitted: [],
    dataToRemove: 0,
    /**
     * @type {(e: InputEvent) => undefined} */
    oninput(e) {
        const target = e.target;
        const dataType = target.getAttribute("data-type");
        if (dataType === "clear") {
            if (target.name == null || DBrowser.toClean[target.name] === undefined) {
                console.error("ERROR: does not have a target.name");
                return;
            }
            if (target.checked) {
                DBrowser.dataToRemove += 1;
            } else {
                DBrowser.dataToRemove -= 1;
            }
            DBrowser.toClean[target.name] = target.checked;
            DBrowser.FORM["button-clear"].disabled = (DBrowser.dataToRemove < 1);

        } else if (dataType === "origin") {
            for (let type of ORIGIN_TYPES) {
                if (target.name === type) {
                    BrowserOriginTypes[type] = target.checked;
                }
            }
        }
    },
    onclick(e) {
        const target = e.target;
        const name = target.name;
        if (name === "button-deselect") {
            if (DBrowser.dataToRemove > 0) {
                for (const type of DBrowser.permitted) {
                    DBrowser.FORM[type].checked = false;
                    DBrowser.toClean[type] =  false;
                }
                DBrowser.dataToRemove = 0;
                DBrowser.FORM["button-clear"].disabled = true;
            }
        } else if (name === "button-clear") {
            const toclean = DBrowser.toClean
            if (toclean.appcache) {
                chrome.browsingData.removeAppcache(BrowserRemovalOptions);
            }
            if (toclean.cache) {
                chrome.browsingData.removeCache(BrowserRemovalOptions);
            }
            if (toclean.cacheStorage) {
                chrome.browsingData.removeCacheStorage(BrowserRemovalOptions);
            }
            if (toclean.cookies) {
                chrome.browsingData.removeCookies(BrowserRemovalOptions);
            }
            if (toclean.downloads) {
                chrome.browsingData.removeDownloads(BrowserRemovalOptions);
            }
            if (toclean.fileSystems) {
                chrome.browsingData.removeFileSystems(BrowserRemovalOptions);
            }
            if (toclean.formData) {
                chrome.browsingData.removeFormData(BrowserRemovalOptions);
            }
            if (toclean.history) {
                chrome.browsingData.removeHistory(BrowserRemovalOptions);
            }
            if (toclean.indexedDB) {
                chrome.browsingData.removeIndexedDB(BrowserRemovalOptions);
            }
            if (toclean.localStorage) {
                chrome.browsingData.removeLocalStorage(BrowserRemovalOptions);
            }
            if (toclean.passwords) {
                chrome.browsingData.removePasswords(BrowserRemovalOptions);
            }
            if (toclean.serviceWorkers) {
                chrome.browsingData.removeServiceWorkers(BrowserRemovalOptions);
            }
            if (toclean.webSQL) {
                chrome.browsingData.removeWebSQL(BrowserRemovalOptions);
            }
            for (const type of DBrowser.permitted) {
                DBrowser.FORM[type].checked = false;
                DBrowser.toClean[type] =  false;
            }
        }
    },
};

const TabRemovalOptions = {
    excludeOrigins: undefined,
    originTypes: {
        extension: false,
        protectedWeb: false,
        unprotectedWeb: true
    },
    origins: [],
    since: 0,
};

const DTab = {
    /** @type{HTMLFormElement} */
    FORM: (function () {
        const form = document.forms["tab"];
        if (form === null) {
            throw Error("'tab form' does not exist");
        }
        return form;
    }()),
    TYPES: [
        "cache",
        "cookies",
        "localStorage"
    ],
    toClean: {
        "cache": false,
        "cookies": false,
        "localStorage": false,
    },
    permitted: [],
    dataToRemove: 0,
    /**
     * @type {(e: MouseEvent) => undefined} */
    onclick(e) {
        const target = e.target;
        const name = target.name;
        if (name === "button-deselect") {
            if (DTab.dataToRemove > 0) {
                for (const type of DTab.permitted) {
                    DTab.FORM[type].checked = false;
                    DTab.toClean[type] = false;
                }
                DTab.dataToRemove = 0;
                DTab.FORM["button-clear"].disabled = true;
            }
        } else if (name === "button-clear") {
            const toclean = DTab.toClean;
            if (toclean.cookies) {
                chrome.browsingData.removeCookies(TabRemovalOptions);
            }
            if (toclean.cache) {
                chrome.browsingData.removeCache(TabRemovalOptions);
            }
            if (toclean.localStorage) {
                chrome.browsingData.removeLocalStorage(TabRemovalOptions);
            }
            for (const type of DTab.permitted) {
                DTab.FORM[type].checked = false;
                DTab.toClean[type] = false;
            }
        }
    },
    /**
     * @type {(e: InputEvent) => undefined} */
    oninput(e) {
        const target = e.target;
        if (target.name == null || DTab.toClean[target.name] === undefined) {
            console.error("ERROR: does not have a target.name");
            return;
        }
        if (target.checked) {
            DTab.dataToRemove += 1;
        } else {
            DTab.dataToRemove -= 1;
        }
        DTab.toClean[target.name] = target.checked;
        DTab.FORM["button-clear"].disabled = (DTab.dataToRemove < 1);
    },
};

const DHeader = {
    /** @type{HTMLElement} */
    BUTTONS: (function () {
        const buttons = document.getElementById("header-buttons");
        if (buttons === null) {
            throw Error("#header-buttons does not exist");
        }
        return buttons;
    }()),
    /**
     * @type {(e: MouseEvent) => undefined} */
    onclick(e) {
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
};

const DTimeRange = {
    /** @type {HTMLSelectElement} */
    SELECT: (function () {
        const select = document.getElementById("timerange");
        if (select === null) {
            throw Error("#timerange does not exist");
        }
        return select;
    }()),
    /**
     * @type {(e: InputEvent) => undefined} */
    onchange(e) {
        const value = e.target.value;
        switch (value) {
            case "0": {
                TabRemovalOptions.since = 0;
                BrowserRemovalOptions.since = 0;
                break;
            }
            case "1": {
                TabRemovalOptions.since = (new Date()).getTime() - HOUR;
                BrowserRemovalOptions.since = (new Date()).getTime() - HOUR;
                break;
            }
            case "2": {
                TabRemovalOptions.since = (new Date()).getTime() - HOUR12;
                BrowserRemovalOptions.since = (new Date()).getTime() - HOUR12;
                break;
            }
            case "3": {
                TabRemovalOptions.since = (new Date()).getTime() - DAY;
                BrowserRemovalOptions.since = (new Date()).getTime() - DAY;
                break;
            }
            case "4": {
                TabRemovalOptions.since = (new Date()).getTime() - WEEK;
                BrowserRemovalOptions.since = (new Date()).getTime() - WEEK;
                break;
            }
            case "5": {
                TabRemovalOptions.since = (new Date()).getTime() - WEEK4;
                BrowserRemovalOptions.since = (new Date()).getTime() - WEEK4;
                break;
            }
        }
    }
};


chrome.browsingData.settings(function (result) {
    let browserPermitted = false;
    for (const type of DBrowser.TYPES) {
        if (result.dataRemovalPermitted[type] && result.dataToRemove[type]) {
            browserPermitted = true;
            DBrowser.permitted.push(type);
            DBrowser.FORM[type]?.removeAttribute("disabled");
        }
    }
    for (const type of DTab.TYPES) {
        if (result.dataRemovalPermitted[type] && result.dataToRemove[type]) {
            DTab.permitted.push(type);
        }
    }
    if (browserPermitted) {
        DBrowser.FORM["button-deselect"].removeAttribute("disabled");
    }

    if (result.options.originTypes?.extension != null) {
        DBrowser.FORM[ORIGIN_TYPE_EXTENSION].disabled = false;
    }
    if (result.options.originTypes?.protectedWeb != null) {
        DBrowser.FORM[ORIGIN_TYPE_PROTECTEDWEB].disabled = false;
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

    TabRemovalOptions.origins.push(res[0].result);

    let tabPermitted = false;
    for (const type of DTab.permitted) {
        tabPermitted = true;
        DTab.FORM[type]?.removeAttribute("disabled");
    }
    if (tabPermitted) {
        DTab.FORM["button-deselect"]?.removeAttribute("disabled");
    }
}());

DBrowser.FORM.addEventListener("input", DBrowser.oninput, false);
DBrowser.FORM.addEventListener("click", DBrowser.onclick, false);

DTab.FORM.addEventListener("input", DTab.oninput, false);
DTab.FORM.addEventListener("click", DTab.onclick, false);

DHeader.BUTTONS.addEventListener("click", DHeader.onclick, false);
DTimeRange.SELECT.addEventListener("change", DTimeRange.onchange, false);
