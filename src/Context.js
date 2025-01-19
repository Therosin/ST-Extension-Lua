// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
import { EXTENSION_NAME, DEFAULT_SETTINGS } from './constants.js';
const { extensionSettings, saveSettingsDebounced } = SillyTavern.getContext();


// Loads the extension settings if they exist, otherwise initializes them to the defaults.
function loadSettings() {
    extensionSettings[EXTENSION_NAME] = extensionSettings[EXTENSION_NAME] || {};
    if (Object.keys(extensionSettings[EXTENSION_NAME]).length === 0) {
        console.log('[ST-Extension-Lua] Initializing settings to default values');
        Object.assign(extensionSettings[EXTENSION_NAME], DEFAULT_SETTINGS);
    }

    // Ensure that all settings are present else add them
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (extensionSettings[EXTENSION_NAME][key] === undefined) {
            console.log(`[ST-Extension-Lua] Adding missing setting ${key} with default value`, value);
            extensionSettings[EXTENSION_NAME][key] = value;
        }
    }
}

/**
 * Validate the fetch whitelist
 * @param {string} value - the value to validate
 * @returns {string[]} an array of valid urls
 */
function validateFetchWhitelist(value) {
    value = value.split('\n').map(
        line => line.trim() // split by new line and trim each line
    ).filter(
        line => line.length > 0 // remove empty lines
    ).filter(
        // validate that we have patterns that look like URLs. ( with wildcards anywhere in the URL ) eg. `[*|http|https]://([*|sub-domain].)?example.com(/[*|path])?`
        line => /^(\*|https?):\/\/(\*|[\w-]+)?\.([\w.-]+)(\/(\*|[\w/.-]*))?$/i.test(line)
    );
    return value
}



// largely copied from GroupGreetings
class Context {

    constructor() {
        loadSettings();
    }

    getSetting(key) {
        const settings = extensionSettings[EXTENSION_NAME];
        return settings[key];
    }

    setSetting(key, value) {
        const settings = extensionSettings[EXTENSION_NAME];
        settings[key] = value;
        saveSettingsDebounced();
    }

    getGlobalScripts() {
        return this.getSetting('globalScripts');
    }

    setGlobalScripts(scripts) {
        this.setSetting('globalScripts', scripts);
    }

    /**
     * Find Global Scripts by name
     * @param {string} CharacterAvatarUrl - the avatar url of the character
     * @param {object} scriptName - the name of the script to find
     * @returns {object} script - the script object if found, otherwise undefined { index, name, code }
     * @example
     * const script = findGlobalScriptByName('HelloWorld');
     * const { index, name, code } = script;
     * console.log(`Found script ${name} at index ${index} with code ${code}`);
    */
    findGlobalScriptByName(scriptName) {
        const scripts = this.getGlobalScripts();
        for (const [index, script] of scripts.entries()) {
            if (script.name === scriptName) {
                return { index, ...script };
            }
        }
    }

    /**
     * Find Global Scripts by id
     * @param {string} scriptId - the id of the script to find
     * @returns {object} script - the script object if found, otherwise undefined.
     * @example
     * const script = findGlobalScriptById(0);
     * const { name, code } = script;
    */
    findGlobalScriptById(scriptId) {
        const scripts = this.getGlobalScripts();
        return scripts[scriptId];
    }


    /**
     * get the fetch whitelist as an array of urls
    */
    getFetchWhitelist() {
        const whitelist = this.getSetting('fetchWhitelist');
        return validateFetchWhitelist(whitelist);
    }

    /**
     * set the fetch whitelist as an array of urls
     * @param {string[]} urls - the urls to set
    */
    setFetchWhitelist(urls) {
        urls = validateFetchWhitelist(urls.join('\n'));
        this.setSetting('fetchWhitelist', urls.join('\n'));
    }
}

const ctx = new Context();

export default ctx;
