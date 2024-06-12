// ==UserScript==
// @name         GitHub Issues/Pull Request Default Filters
// @namespace    https://github.com/
// @version      2024-06-12
// @author       derpierre65
// @description  Add two buttons - one to save the current filters as default and another to reset the filters to default for the issue or pull request list.
// @match        https://github.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// ==/UserScript==

(function() {
    'use strict';

    const allowedSites = ['/pulls', '/issues'];
    let currentURL = window.location.href;
    let tries = 0;
    let loadTimeout = null;

    window.setInterval(() => {
        const currentLocation = window.location.href;
        if (currentURL !== currentLocation) {
            currentURL = currentLocation;
            checkLoadDefaultFilter();
        }
    }, 199);

    function isAllowedPath(path) {
        for ( const allowed of allowedSites ) {
            if ( path.endsWith(path) ) return true;
        }

        return false;
    }

    function checkLoadDefaultFilter() {
        tries = 0;
        window.clearTimeout(loadTimeout);

        const path = window.location.pathname;
        if ( !isAllowedPath(path) || path.split('/').length !== 4 ) {
            return;
        }

        loadDefaultFilter();
    }

    function getStorageKey() {
        const currentPath = window.location.pathname;

        return currentPath.split('/').filter(value => value).slice(0,3).join('_');
    }

    function createButton(searchBar, className, label) {

        const html = `<a class="${className} Button--primary Button--medium Button ml-2">${label}</a>`;
        searchBar.insertAdjacentHTML('afterend', html);

        return document.querySelector(`.${className}`);
    }

    function createResetButton() {
        const resetButton = document.querySelector('.gh-filter-reset');
        if ( resetButton ) return;

        const newButton = createButton(document.querySelector('.gh-filter-save'), 'gh-filter-reset', 'Reset');
        newButton.onclick = () => {
            GM_deleteValue(getStorageKey());
            newButton.remove();
        }
    }

    function createSaveButton() {
        const searchBar = document.querySelector('.subnav-search');
        const ghFilterSave = createButton(searchBar, 'gh-filter-save', 'Save as Default');
        ghFilterSave.onclick = () => {
            const element = document.querySelector('#js-issues-search');
            GM_setValue(getStorageKey(), element.value);
            createResetButton();
        }
    }

    function loadDefaultFilter() {
        if ( tries > 1000 ) return;

        const element = document.querySelector('#js-issues-search');
        if ( element === null ) {
            tries ++;
            loadTimeout = window.setTimeout(loadDefaultFilter, 97);
            return;
        }

        createSaveButton();

        tries = 0;
        const defaultFilter = GM_getValue(getStorageKey());
        if ( !defaultFilter ) {
            return;
        }

        element.value = defaultFilter;

        const event = document.createEvent('Event');
        event.initEvent('keyup', true, true);
        event.keyCode = 13;
        event.key = 'Enter';

        element.dispatchEvent(event);

        createResetButton();
    }

    checkLoadDefaultFilter();
})();
