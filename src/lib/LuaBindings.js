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


export default function SetupBindings(self, env) {


    // get js type information. eg: if (type(ctx) == "userdata") and jstype(ctx) == "object" then ... end
    env.setGlobal('jstype', (obj) => { return typeof obj })


    // bind JS regular expression functions to lua, this allows lua to use regex
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

    // bind Dom Manipulation functions to lua, this allows lua to manipulate the DOM, eg. for creating UI.
    if (Context.getSetting('enableDomManipulation')) {
        env.setGlobal('Document', DomManipulator);
    }

    // bind fetch function to lua, this allows lua to fetch data from the web, should be used with caution.
    if (Context.getSetting('enableFetch')) {
        env.setGlobal('fetch', async (url, options) => {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`Failed to fetch url ${url}`);
                }
                const response_type = response.headers.get('content-type');
                if (response_type.includes('application/json')) {
                    return response.json();
                } else if (response_type.includes('text/html')) {
                    return response.text();
                } else {
                    throw new Error(`Unsupported response type: ${response_type}`);
                }
            } catch (error) {
                console.error(`Error fetching url ${url}: ${error}`);
                return null;
            }
        });
    }
}