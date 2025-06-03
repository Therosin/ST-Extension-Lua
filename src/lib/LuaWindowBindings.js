// Copyright (C) 2025 Theros <https://github.com/therosin>
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

export default function SetupBindings(self, env) {
    const config = {
        maxRequestsPerSecond: 5,
        timeoutMs: 5000,
    };

    const requestCounters = new Map(); // To track rate limits

    const cleanupTasks = [];

    const customWindow = {

        sendMessage: (type, payload) => {
            const now = Date.now();
            const windowMs = 1000; // 1-second window
            const maxRequests = config.maxRequestsPerSecond;

            // Rate-limiting logic
            if (!requestCounters.has(type)) {
                requestCounters.set(type, []);
            }
            const timestamps = requestCounters.get(type);
            while (timestamps.length && timestamps[0] < now - windowMs) {
                timestamps.shift();
            }
            if (timestamps.length >= maxRequests) {
                return Promise.reject(new Error(`Rate limit exceeded for request type "${type}".`));
            }
            timestamps.push(now);

            return new Promise((resolve, reject) => {
                const requestId = `req-${now}-${Math.random().toString(16).slice(2)}`;

                const listener = (event) => {
                    if (event.detail.requestId === requestId) {
                        window.removeEventListener('LuaEnvResponse', listener);
                        clearTimeout(timeoutId);
                        resolve(event.detail.response);
                    }
                };

                window.addEventListener('LuaEnvResponse', listener);

                const timeoutId = setTimeout(() => {
                    window.removeEventListener('LuaEnvResponse', listener);
                    reject(new Error(`No response for request type "${type}" within ${config.timeoutMs}ms.`));
                }, config.timeoutMs);

                window.dispatchEvent(new CustomEvent('LuaEnvRequest', {
                    detail: { type, payload, requestId },
                }));
            });
        },

        configure: {
            set: (key, value) => {
                if (config[key] !== undefined && typeof value === typeof config[key]) {
                    config[key] = value;
                    return true;
                }
                return false;
            },
            get: (key) => config[key],
        },

        clearRateLimits: (type) => {
            if (type) {
                requestCounters.delete(type);
            } else {
                requestCounters.clear();
            }
        },

        getRateLimitStatus: () => {
            return Array.from(requestCounters.entries()).map(([type, timestamps]) => ({
                type,
                activeRequests: timestamps.length,
            }));
        },

        listConfig: () => ({ ...config }),

        registerCleanup: (callback) => {
            if (typeof callback === 'function') {
                cleanupTasks.push(callback);
            }
        },
    };

    window.addEventListener("beforeunload", () => {
        console.log('[LuaEnv] Cleaning up...');
        cleanupTasks.forEach((task) => task());
    });

    env.setGlobal('window', customWindow);
}
