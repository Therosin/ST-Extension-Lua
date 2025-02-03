/** Name of the extension */
export const EXTENSION_NAME = 'Extension-Lua';

/** Default settings for the extension */
export const DEFAULT_SETTINGS = {
    globalScripts: [],
    enableGlobalScripts: true,
    /** Allow the use of Interval and Timeout functions */
    enableTimers: false,
    /** Allow the use of LocalStorage */
    enableLocalStorage: false,
    /** Allow the use of Fetch */
    enableFetch: false,
    /** Fetch whitelist with wildcard support */
    fetchWhitelist: `
    https://docs.sillytavern.app/*
    `,
    /** Allow the use of DOM manipulation */
    enableDomManipulation: false,
};


/**
 * Core Scripts/Modules to be loaded into the Lua Environment.
 * Each entry is a tuple with the first element being the path to the script and the second element being an object with the following properties:
 * - module: boolean - Whether the file should be treated as a module.
 * - namespace: string - The namespace under which the module should be registered. (required if module is true, literal string that will be used to require the module in Lua)
 * - dependencies: string[] - An array of dependencies that must be loaded before this file.
 * - initCode: string - Additional Lua code to run before the file's main content (Optional, not recommended though can be used to set up global variables or functions).
 * 
 * The order of the scripts in this array is important as the scripts will be loaded in the order they appear, though due to timing issues, dependencies may not be loaded in the order they appear.
 * To avoid dependency issues, it is recommended to use the dependencies property to specify dependents so we can sort them properly later.
 * 
 * @type {Array<[string, import('./lib/LuaFileLoader').LuaFileOptions]>}
 *
*/
export const CORE_SCRIPTS = [
    // Core Libraries
    ["common/string.lua", { module: true, namespace: "Common.string" }],
    ["common/table.lua", { module: true, namespace: "Common.table" }],
    ["common/logging.lua", { module: true, namespace: "Logging", dependencies: ["common/string.lua"] }],
    ["common/localStorage.lua", { module: true, namespace: "localStorage", dependencies: ["common/table.lua"] }],
    ["common/eventmanager.lua", { module: true, namespace: "EventManager" }],
    ["common/LazyTimer.lua", { module: true, namespace: "LazyTimer" }],
    ["common/tool_calling.lua", { module: true, namespace: "ToolCalling", dependencies: ["libs/pandora.lua"] }],
    ["common/init.lua", { module: true, namespace: "Common", dependencies: ["common/eventmanager.lua", "common/localStorage.lua", "common/logging.lua"] }],
    // Third Party Libraries.
    ["libs/inspect.lua", { module: true, namespace: "Inspect" }], // Inspect, Human Readable Table Printing
    ["libs/pandora.lua", { module: true, namespace: "Pandora" }], // Pandora Class Library
    ["libs/LunaQuery.lua", { module: true, namespace: "LunaQuery" }], // LunaQuery, Linq like Query Library
    // Main init file.
    ["init.lua", { dependencies: ["common/init.lua", "libs/inspect.lua"] }],
];

/**
 * Maximum number of Timers that can be created by the Lua Environment.
 * @type {number}
*/
export const MAX_LUA_TIMERS = 50;

/**
 * Maximum number of Intervals that can be created by the Lua Environment.
 * @type {number}
*/
export const MAX_LUA_INTERVALS = 50;