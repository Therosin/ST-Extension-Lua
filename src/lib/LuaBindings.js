// Copyright (C) 2024 Theros <https://github.com/therosin>
// 
// This file is part of ST-Extension-Lua.
// 
// ST-Extension-Lua is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// ST-Extension-Lua is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with ST-Extension-Lua.  If not, see <https://www.gnu.org/licenses/>.
// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
/* global toastr */
import DomManipulator from '../utils/DomManipulator';
import Context from '../Context';
// eslint-disable-next-line no-unused-vars
import LuaCanvasElement from '../components/LuaCanvas'; // make our custom element available to the browser

export default function SetupBindings(self, env) {


    // get js type information. eg: if (type(ctx) == "userdata") and jstype(ctx) == "object" then ... end
    env.setGlobal('jstype', (obj) => { return typeof obj })

    // bind JS regular expression functions to lua, this allows lua to use regex
    const allowedFlags = /^[gimu]*$/;
    const maxPatternLength = 1000;

    env.setGlobal('regex', {
        match: (str, pattern, flags = 'g') => {
            if (pattern.length > maxPatternLength) throw new Error(`Pattern exceeds maximum length of ${maxPatternLength} characters.`);
            if (!allowedFlags.test(flags)) throw new Error(`Invalid flags: ${flags}`);
            try {
                const regex = new RegExp(pattern, flags);
                return str.match(regex);
            } catch (e) {
                throw new Error(`Invalid regex pattern: ${pattern}`);
            }
        },
        replace: (str, pattern, replacement, flags = 'g') => {
            if (pattern.length > maxPatternLength) throw new Error(`Pattern exceeds maximum length of ${maxPatternLength} characters.`);
            if (!allowedFlags.test(flags)) throw new Error(`Invalid flags: ${flags}`);
            try {
                const regex = new RegExp(pattern, flags);
                return str.replace(regex, replacement);
            } catch (e) {
                throw new Error(`Invalid regex pattern: ${pattern}`);
            }
        },
        test: (str, pattern, flags = 'g') => {
            if (pattern.length > maxPatternLength) throw new Error(`Pattern exceeds maximum length of ${maxPatternLength} characters.`);
            if (!allowedFlags.test(flags)) throw new Error(`Invalid flags: ${flags}`);
            try {
                const regex = new RegExp(pattern, flags);
                return regex.test(str);
            } catch (e) {
                throw new Error(`Invalid regex pattern: ${pattern}`);
            }
        }
    });


    // bind JSON functions to lua, faster than using some json library.
    env.setGlobal('JSON', {
        stringify: (obj) => {
            return JSON.stringify(obj);
        },
        parse: (str) => {
            return JSON.parse(str);
        }
    });

    // bind JS timer functions to lua, allows lua to use timers and intervals for scheduling.
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

        // js based sleep function, allows lua to sleep for a given amount of time.
        env.setGlobal('_sleep_js', (ms) => new Promise(resolve => setTimeout(resolve, ms)));
    }

    // bind JS localStorage functions to lua, we prefix the keys with ST-Ext-LUA to avoid conflicts.
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

    // allow access to toastr to display notifications, useful for script feedback.
    env.setGlobal('toastr', {
        success: (...args) => toastr.success(...args),
        info: (...args) => toastr.info(...args),
        warning: (...args) => toastr.warning(...args),
        error: (...args) => toastr.error(...args)
    });

    // allows lua to manipulate the DOM, eg. for creating UI.
    if (Context.getSetting('enableDomManipulation')) {
        env.setGlobal('Document', DomManipulator);
    }

    /**
     * Fetch Function Configuration
     * 
     * This module binds a secure `fetch` function to the Lua environment. The function allows Lua scripts
     * to perform web requests with controlled methods, headers, and hosts. The response can include
     * metadata and data in multiple formats such as JSON, text, Blob, or Blob URL.
     * 
     * Usage:
     * ```javascript
     * const response = fetch('https://example.com', {
     *     method: 'GET',
     *     headers: { 'Accept': 'application/json' },
     *     blobUrl: true // Return a Blob URL for media types
     * });
     * 
     * console.log(response.data); // Access returned data
     * console.log(response.metadata); // Access response metadata
     * ```
    */
    if (Context.getSetting('enableFetch')) {
        const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
        const allowedHeaders = ['Accept', 'Accept-Language', 'Content-Type', 'Authorization', 'Origin', 'Referer', 'User-Agent'];
        const allowedHosts = ['*://localhost/*', '*://127.0.0.1/*'];
        const allowedResponseTypes = ['application/json', 'text/html', 'text/plain', 'image/', 'video/', 'audio/'];

        const userAllowedHosts = Context.getFetchWhitelist();
        if (userAllowedHosts) {
            allowedHosts.push(...userAllowedHosts);
        }

        /**
         * Performs a web request with the specified options.
         *
         * @param {string} url - The URL to fetch.
         * @param {Object} [options] - Fetch options.
         * @param {string} [options.method='GET'] - HTTP method (e.g., GET, POST).
         * @param {Object} [options.headers] - Custom headers to include in the request.
         * @param {boolean} [options.blobUrl=false] - Whether to return a Blob URL for media types.
         * @returns {Promise<Object>} A promise resolving to an object containing `data` and `metadata`.
         * @throws {Error} If the URL, method, headers, or response type is invalid.
        */
        env.setGlobal('fetch', async (url, options) => {
            if (typeof url !== 'string') {
                throw new Error('Invalid url');
            }
            if (options === null || typeof options !== 'object') {
                throw new Error('Invalid options');
            }
            if (!options.method) {
                options.method = 'GET';
            }
            if (!allowedMethods.includes(options.method)) {
                throw new Error(`Invalid method: ${options.method}`);
            }
            if (options.headers && typeof options.headers === 'object' && !(options.headers instanceof Headers)) {
                for (const header in options.headers) {
                    if (!allowedHeaders.includes(header)) {
                        throw new Error(`Invalid header: ${header}`);
                    }
                }
            }
            if (!allowedHosts.some(host => new RegExp(`^${host.replace(/\*/g, '[^/]*')}`, 'i').test(url))) {
                throw new Error(`Host not allowed: ${url}`);
            }

            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`Failed to fetch url ${url}`);
                }
                const response_type = response.headers.get('content-type');
                if (!response_type) {
                    throw new Error(`Response does not include a content-type header.`);
                }
                if (allowedResponseTypes.some(type => response_type.startsWith(type))) {
                    if (response_type.includes('application/json')) {
                        return {
                            data: await response.json(),
                            metadata: {
                                url,
                                status: response.status,
                                statusText: response.statusText,
                                headers: [...response.headers],
                                type: response_type
                            }
                        };
                    } else if (response_type.includes('text/') || response_type.includes('html')) {
                        return {
                            data: await response.text(),
                            metadata: {
                                url,
                                status: response.status,
                                statusText: response.statusText,
                                headers: [...response.headers],
                                type: response_type
                            }
                        };
                    } else if (response_type.startsWith('image/') || response_type.startsWith('video/') || response_type.startsWith('audio/')) {
                        const blob = await response.blob();
                        const data = options.blobUrl ? URL.createObjectURL(blob) : blob;
                        return {
                            data,
                            metadata: {
                                url,
                                status: response.status,
                                statusText: response.statusText,
                                headers: [...response.headers],
                                type: response_type,
                                size: blob.size
                            }
                        };
                    }
                } else {
                    throw new Error(`Unsupported response type: ${response_type}`);
                }
            } catch (error) {
                console.error(`Error fetching url ${url}: ${error}`);
                return null;
            }
        });
    }

    // bind a builder for creating LuaCanvas elements.
    env.setGlobal('CreateLuaCanvas', (options) => {
        /** @type {LuaCanvasElement} */
        const canvas = document.createElement('lua-canvas', options);
        return canvas;
    });
}
