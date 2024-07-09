// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
import { EXTENSION_NAME, DEFAULT_SETTINGS } from './constants.js';
const { context, extensionSettings, saveSettingsDebounced } = SillyTavern.getContext();


// Loads the extension settings if they exist, otherwise initializes them to the defaults.
function loadSettings() {
    extensionSettings[EXTENSION_NAME] = extensionSettings[EXTENSION_NAME] || {};
    if (Object.keys(extensionSettings[EXTENSION_NAME]).length === 0) {
        Object.assign(extensionSettings[EXTENSION_NAME], DEFAULT_SETTINGS);
    }
}

// largely copied from GroupGreetings
class Context {

    constructor() {
        loadSettings();
    }

    GetSetting(key) {
        const settings = extensionSettings[EXTENSION_NAME];
        return settings[key];
    }

    SetSetting(key, value) {
        const settings = extensionSettings[EXTENSION_NAME];
        settings[key] = value;
        saveSettingsDebounced();
    }

    getCharacterId() {
        let characterId = context.characterId;
        // When peeking a group chat member, find a proper characterId
        if (context.groupId) {
            const avatarUrlInput = document.getElementById('avatar_url_pole');
            if (avatarUrlInput instanceof HTMLInputElement) {
                const avatarUrl = avatarUrlInput.value;
                characterId = context.characters.findIndex(c => c.avatar === avatarUrl);
            }
        }
        return characterId;
    }

    getCharacterIdFromAvatarUrl(avatarUrl) {
        return context.characters.findIndex(c => c.avatar === avatarUrl);
    }

    getGlobalScripts() {
        return this.GetSetting('globalScripts');
    }

    setGlobalScripts(scripts) {
        this.SetSetting('globalScripts', scripts);
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
}

const ctx = new Context();

export default ctx;
