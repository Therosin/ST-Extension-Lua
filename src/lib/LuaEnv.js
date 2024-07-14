// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
import { createLuaBridge } from './LuaBridge';
import Context from '../Context';


/**
 * @typedef {Object} LuaFileOptions
 * @property {boolean} [module] - Whether the file should be treated as a module.
 * @property {string} [namespace] - The namespace under which the module should be registered.
 * @property {string[]} [dependencies] - An array of dependencies that must be loaded before this file.
 * @property {string} [initCode] - Additional Lua code to run before the file's main content.
*/


/**
 * Creates a file map based on the given array of lua files.
 * The file map is a Map object where each key represents a file path and the corresponding value is an array of dependencies.
 *
 * @param {Array<string | [string, LuaFileOptions]>} files - Array of file paths or file paths with options
 * @returns {Map<string, string[]>} - filemap.
 */
export function createLuaFileMap(files) {
    const fileMap = new Map();
    files.forEach(file => {
        let filePath, options;
        if (Array.isArray(file)) {
            [filePath, options] = file;
        } else {
            filePath = file;
            options = {};
        }
        fileMap.set(filePath, options.dependencies || []);
    });
    return fileMap;
}

/**
 * Perform topological sort on the given map of lua files and their dependencies.
 * @param {Map<string, string[]>} fileMap - The file map
 * @returns {Array<[string, object]> | null} - Sorted array of file paths and options or null if cyclic dependency is detected
 */
export function topologicalLuaFileSort(fileMap) {
    const sorted = [];
    const visited = new Set();
    const stack = new Set();

    function visit(file) {
        if (stack.has(file)) {
            return false; // Cycle detected
        }
        if (!visited.has(file)) {
            stack.add(file);
            const dependencies = fileMap.get(file) || [];
            for (const dep of dependencies) {
                if (!visit(dep)) {
                    return false; // Cycle detected
                }
            }
            stack.delete(file);
            visited.add(file);
            sorted.push(file);
        }
        return true;
    }

    for (const file of fileMap.keys()) {
        if (!visit(file)) {
            return null; // Cycle detected
        }
    }

    return sorted;
}

/**
 * Custom LuaBridge Environment
 * Use this to modify the lua environment available to ST.
*/
export class LuaEnv {
    constructor() {
        this.Lua = null;
        this.GlobalScripts = [];
    }

    /**
     * Initializes the Lua environment
     * @returns {Promise<void>}
     * @throws {string} If the global scripts cannot be registered
    */
    async init() {
        if (this.Lua == null) {
            this.Lua = await createLuaBridge();
            this.GlobalScripts = Context.getGlobalScripts();
            for (const script of this.GlobalScripts) {
                await this.Lua.loadModule(script.name, script.code);
            }

            SetupEnv(this, this.Lua);
        }
    }

    /**
     * Shuts down the Lua environment
     * @returns {Promise<void>}
     * @throws {string} If Lua is not initialized
    */
    shutdown() {
        return new Promise((resolve, reject) => {
            if (this.Lua == null) reject('Lua is not initialized');
            this.Lua.close();
            this.Lua = null;
            resolve();
        });
    }

    async execute(script, data) {
        if (this.Lua == null) throw new Error('Lua is not initialized');
        return this.Lua.execute(script, data);
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
}

const SetupEnv = (self, env) => { // Modify the Lua State Available to ST here    
    // SillyTavern Interop
    env.setGlobal("SillyTavern", {
        /** Returns ST Context for use in lua. */
        GetContext: () => SillyTavern.getContext(),
    })

    // get js type information. eg: if (type(ctx) == "userdata") and jstype(ctx) == "object" then ... end
    env.setGlobal('jstype', (obj) => { return typeof obj })

    // bind JS regular expression functions to lua
    env.setGlobal('regex', {
        match: (str, pattern) => {
            const regex = new RegExp(pattern, 'g');
            return str.match(regex);
        },
        replace: (str, pattern, replace) => {
            const regex = new RegExp(pattern, 'g');
            return str.replace(regex, replace);
        },
        test: (str, pattern) => {
            const regex = new RegExp(pattern, 'g');
            return regex.test(str);
        }
    });

    // bind JSON functions to lua
    env.setGlobal('JSON', {
        stringify: (obj) => {
            return JSON.stringify(obj);
        },
        parse: (str) => {
            return JSON.parse(str);
        }
    });

    // bind JS timer functions to lua
    if (Context.getSetting('enableTimers')) {
        env.setGlobal('setTimeout', (func, time, ...args) => {
            return setTimeout(() => {
                func(...args);
            }, time);
        });

        env.setGlobal('setInterval', (func, time, ...args) => {
            return setInterval(() => {
                func(...args);
            }, time);
        });

        env.setGlobal('clearTimeout', (id) => {
            clearTimeout(id);
        });

        env.setGlobal('clearInterval', (id) => {
            clearInterval(id);
        });
    }

    // bind JS localStorage functions to lua
    if (Context.getSetting('enableLocalStorage')) {
        // bind JS localStorage to lua
        env.setGlobal('js_localStorage', {
            get: (key) => {
                const value = localStorage.getItem(`ST-Ext-LUA::${key}`);
                if (value === null) return undefined;
                try {
                    return JSON.parse(value);
                }
                catch (e) {
                    console.error(`Error getting localStorage item: ${e}`);
                    return undefined;
                }
            },
            set: (key, value) => {
                if (value === null) {
                    localStorage.removeItem(`ST-Ext-LUA::${key}`);
                    return true;
                }
                try {
                    const json_value = JSON.stringify(value);
                    localStorage.setItem(`ST-Ext-LUA::${key}`, json_value);
                    return true;
                }
                catch (e) {
                    console.error(`Error setting localStorage item: ${e}`);
                    return false;
                }
            }
        });
    }


    // load bundled lua files
    self.loadFiles([
        // Core Libraries
        ["common/string.lua", { module: true, namespace: "Common.string" }],
        ["common/table.lua", { module: true, namespace: "Common.table" }],
        ["common/localStorage.lua", { module: true, namespace: "localStorage", dependencies: ["common/table.lua"] }],
        ["common/init.lua", { module: true, namespace: "Common" }],
        // Modules
        // ["events.lua", { module: true, namespace: "Events" }], // Events, not yet implemented
        // Main init file.
        "init.lua",
        // Third Party Libraries.
        ["libs/inspect.lua", { module: true, namespace: "Inspect" }],
        ["libs/pandora.lua", { module: true, namespace: "Pandora" }],

    ]).catch(console.error);
}

const Lua = new LuaEnv();
Lua.init()
export default Lua;
