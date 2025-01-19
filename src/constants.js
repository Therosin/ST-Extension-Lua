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
