// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Lua from './lib/LuaEnv';
import Context from './Context';

/**
 * Execute a Global Lua Script by Id
 * @param {string} scriptId - the id of the script to execute
 * @param {object} data - the data to pass to the script
 * @returns {Promise<any>} - the results of the script
 * @throws {Error} if the script is not loaded
 * @throws {Error} if the script does not contain a main function
 * @throws {Error} if the script execution fails
*/
async function executeLuaScript(scriptId, data) {
    const script = Context.findGlobalScriptById(scriptId);
    if (script) {
        const scriptName = script.name;
        try {
            const scriptContent = script.code;
            const scriptContext = { ...data }; // can be used for context injection.
            const results = await Lua.execute(scriptContent, scriptContext);
            return results;

        } catch (error) {
            throw new Error(`Error executing script ${scriptName}: ${error}`);
        }
    }
}

/**
 * ExcuteLuaCode
 * @param {string} luaCode - the lua code to execute
 * @returns {Promise<any>} - the results of the script
*/
async function executeLuaCode(luaCode, data) {
    try {
        const context = { ...data }; // can be used for context injection.
        const results = await Lua.execute(luaCode, context);
        return results;
    } catch (error) {
        throw new Error(`Error executing lua code: ${error}`);
    }
}

async function setup() {
    await Lua.init();
    const rootContainer = document.getElementById('extensions_settings');
    const rootElement = document.createElement('div', { id: 'extension-lua-scripts-root', class: 'extension-lua-scripts-root' });
    rootContainer.appendChild(rootElement);

    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
    console.log("Extension-Lua setup complete");
}

export { executeLuaScript, executeLuaCode, setup, Context, Lua };