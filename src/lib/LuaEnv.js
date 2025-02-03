// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
import { createLuaBridge } from './LuaBridge';
import Context from '../Context';
import SetupBindings from './LuaBindings';
import SetupWindowBindings from './LuaWindowBindings';
import { CORE_SCRIPTS, MAX_LUA_TIMERS, MAX_LUA_INTERVALS } from '../constants';
import { createLuaFileMap, topologicalLuaFileSort } from './LuaFileLoader';

/**
 * Custom LuaBridge Environment
 * Use this to modify the lua environment available to ST.
*/
export class LuaEnv {
    constructor() {
        this.Lua = null;
        this.GlobalScripts = [];
        this.activeIntervals = new Map(); // Track intervals
        this.activeTimeouts = new Map(); // Track timeouts
        this.intervalIdCounter = 1; // Unique IDs for intervals
        this.timeoutIdCounter = 1; // Unique IDs for timeouts
        this.maxIntervals = MAX_LUA_INTERVALS; // Maximum number of intervals
        this.maxTimeouts = MAX_LUA_TIMERS; // Maximum number of timeouts
    }

    /**
     * Initializes the Lua environment
     */
    async init() {
        if (this.Lua == null) {
            this.Lua = await createLuaBridge();
            this.GlobalScripts = Context.getGlobalScripts();
            await SetupEnv(this, this.Lua);
        }
    }

    /**
     * Shuts down the Lua environment
     */
    shutdown() {
        return new Promise((resolve, reject) => {
            if (this.Lua == null) reject('Lua is not initialized');

            console.log("Extension-Lua: Emitting shutdown event to Lua");
            this.Lua.execute('if Events then Events:emit("lua::shutdown") end', {});

            console.log("Extension-Lua: Clearing all managed intervals and timeouts...");
            this.clearAllTimers();

            console.log("Extension-Lua: Closing Lua environment handle...");
            this.Lua.close();
            this.Lua = null;

            resolve();
        });
    }

    async execute(script, data) {
        if (this.Lua == null) throw new Error('Lua is not initialized');
        return this.Lua.execute(script, data);
    }

    async loadGlobalScripts() {
        if (this.Lua == null) throw new Error('Lua is not initialized');
        for (const script of this.GlobalScripts) {
            await this.Lua.loadModule(script.name, script.code);
        }
    }

    /**
     * Register lua module code with the Lua environment
     * @param {string} name The name of the module
     * @param {string} modulecode The module code
     * @returns {Promise<void>}
     * @throws {string} If Lua is not initialized
     * @throws {string} If the module cannot be registered
    */
    async registerModule(name, modulecode) {
        if (this.Lua == null) throw new Error('Lua is not initialized');
        return await this.Lua.loadModule(name, modulecode);
    }


    /**
     * Register JavaScript function with the Lua environment
     * @param {string} name The name of the function
     * @param {Function} func The function to register
     * @returns {Promise<void>}
     * @throws {string} If Lua is not initialized
     * @throws {string} If the function cannot be registered
    */
    async registerFunction(name, func) {
        if (this.Lua == null) throw new Error('Lua is not initialized');
        return this.Lua.setGlobal(name, func);
    }


    /**
     * Load bundled Lua files into the Lua environment, handling dependencies.
     * each file can be a string representing the file path or an array containing the file path and an options object.
     * options object can have the following properties:
     * - module: boolean - Whether the file should be treated as a module.
     * - namespace: string - The namespace under which the module should be registered.
     * - dependencies: string[] - An array of dependencies that must be loaded before this file.
     * - initCode: string - Additional Lua code to run before the file's main content.
     * @param {Array<string|Array<string, LuaFileOptions>>} files - The files to load
     * @throws {Error} Throws an error if Lua is not initialized.
     */
    async loadFiles(files) {
        if (this.Lua == null) throw new Error('Lua is not initialized');

        // Create file map and perform topological sort
        const fileMap = createLuaFileMap(files);
        const sortedFiles = topologicalLuaFileSort(fileMap);
        if (!sortedFiles) {
            console.error('Error: Cyclic dependency detected');
            return;
        }

        // Load files in sorted order
        for (const filePath of sortedFiles) {
            try {
                const options = files.find(f => Array.isArray(f) ? f[0] === filePath : f === filePath)[1] || {};
                const moduleName = options.namespace || filePath.replace(/.*\/|\.lua/g, ''); // Extract module name from file path or use namespace
                const fileUrl = `/scripts/extensions/third-party/ST-Extension-Lua/src/lua/${filePath}`;
                const response = await fetch(fileUrl);
                if (!response.ok) throw new Error(`Failed to load Lua file: ${filePath}`);
                const code = await response.text();

                if (options.module) {
                    await this.Lua.loadModule(moduleName, code);
                } else {
                    await this.Lua.execute(code, {});
                }
            } catch (error) {
                console.error(`Error loading file ${filePath}:`, error);
                // Remove the file and its dependents from the list
                const dependents = files.filter(f => Array.isArray(f) && f[1]?.dependencies?.includes(filePath));
                files = files.filter(f => !dependents.includes(f) && !(Array.isArray(f) ? f[0] : f === filePath));
            }
        }
    }

    /**
 * Custom Lua-bound setInterval that tracks timers
 */
    setLuaInterval(callback, time, ...args) {
        const id = this.intervalIdCounter++;
        const timerId = setInterval(() => {
            if (this.Lua) {
                callback(...args);
            } else {
                this.clearLuaInterval(id); // Auto-clean if Lua is shut down
            }
        }, time);
        this.activeIntervals.set(id, timerId);
        return id;
    }

    /**
     * Custom Lua-bound clearInterval
     */
    clearLuaInterval(id) {
        if (this.activeIntervals.has(id)) {
            clearInterval(this.activeIntervals.get(id));
            this.activeIntervals.delete(id);
        }
    }

    /**
     * Custom Lua-bound setTimeout that tracks timers
     */
    setLuaTimeout(callback, time, ...args) {
        const id = this.timeoutIdCounter++;
        const timerId = setTimeout(() => {
            if (this.Lua) {
                callback(...args);
            }
            this.activeTimeouts.delete(id); // Remove after execution
        }, time);
        this.activeTimeouts.set(id, timerId);
        return id;
    }

    /**
     * Custom Lua-bound clearTimeout
     */
    clearLuaTimeout(id) {
        if (this.activeTimeouts.has(id)) {
            clearTimeout(this.activeTimeouts.get(id));
            this.activeTimeouts.delete(id);
        }
    }

    /**
     * Clears all Lua-managed timers
     */
    clearAllTimers() {
        this.activeIntervals.forEach(clearInterval);
        this.activeIntervals.clear();

        this.activeTimeouts.forEach(clearTimeout);
        this.activeTimeouts.clear();
    }
}

/**
 * This gets called once on every page load, it sets up the environment available to Lua scripts.
 * @param {Object} self - The reference to the current object.
 * @param {Object} env - The Lua environment object.
 * @returns {Promise<void>} - A promise that resolves when the environment setup is complete.
*/
const SetupEnv = async (self, env) => {

    // SillyTavern Interop, contains anything exposed by SillyTavern this makes it available to Lua.
    env.setGlobal("SillyTavern", SillyTavern);

    // Set up Lua bindings
    await SetupBindings(self, env);
    await SetupWindowBindings(self, env);

    // load bundled lua files
    await self.loadFiles(CORE_SCRIPTS).catch(console.error);

    // register events from SillyTavern to lua
    const { eventSource, eventTypes } = SillyTavern.getContext()
    // eslint-disable-next-line no-unused-vars
    for (const [_, value] of Object.entries(eventTypes)) {
        eventSource.on(value, (...args) => {
            env.execute(`if Events then Events:emit("${value}", ...) end`, [...args]);
        });
    }

    // load global scripts (user defined modules)
    await self.loadGlobalScripts().catch(console.error);
}

const Lua = new LuaEnv();
Lua.init()
export default Lua;
