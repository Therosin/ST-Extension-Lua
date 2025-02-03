---@diagnostic disable: deprecated
-- Copyright (C) 2024 Theros <https://github.com/therosin>
--
-- This file is part of ST-Extension-Lua.
--
-- ST-Extension-Lua is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- ST-Extension-Lua is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with ST-Extension-Lua.  If not, see <https://www.gnu.org/licenses/>.
local EventManager = require "EventManager" ---@type EventManager
local Log = require "Logging" ---@type Logger

-- Disable Debugging by default.
_G.DEBUG = false

-- Global Extension Object.
local Extension = {
    name = "ST-Extension-Lua",
    version = "1.2.5",
    author = "Theros <github/therosin>",
    config = {
        event_timer = 1000
    }
}
_G.Extension = Extension

-- Binds unpack to table.unpack for compatibility.
_G.unpack = unpack or table.unpack;

-- General Logging.
_G.Log = Log
Log("Initializing ${name} v${version} by ${author}", Extension)

-- Setup LocalStorage.
if not (js_localStorage == nil) then
    local localStorage = require "localStorage"

    local config = localStorage.get("config") or {}

    if config.version == nil then
        Log.warn("Initializing config for the first time.")
        config.version = Extension.version
        for key, value in pairs(Extension.config) do
            config[key] = value
        end
        localStorage.set("config", config)
    end

    if config.version ~= Extension.version then
        Log.warn("Updating config from version ${old} to ${new}", { old = config.version, new = Extension.version })
        config.version = Extension.version
        --- settings update logic here later...
        localStorage.set("config", config)
    end

    -- Load config from localStorage
    config = localStorage.get("config") or {}
    for key, _ in pairs(Extension.config) do
        if config[key] ~= nil then
            Extension.config[key] = config[key]
        end
    end
end

-- Setup EventManager.
_G.Events = EventManager("ST-Lua-EventManager")
Events:emit("lua::startup")
Events:on("tick", function()
    if DEBUG then
        Log.debug("EventLoop > Tick")
    end
end)

-- Setup Main Event Loop.
if (type(_G['setInterval']) == 'function' or jstype(_G['setInterval']) == 'function') then
    if main_loop_timer ~= nil then
        Log.warn(
        "Existing main_loop_timer detected (ID: ${timer}), stopping previous interval before starting a new one.",
            { timer = main_loop_timer })
        clearInterval(main_loop_timer)
    end
    _G.main_loop_timer = setInterval(function()
        Events:emit("tick")
    end, Extension.config.event_timer)

    Log.info("Event Loop Initialized with ${ms}ms interval (ID: ${timer})",
        { ms = Extension.config.event_timer, timer = main_loop_timer })

    Events:set_error(function(err)
        clearInterval(main_loop_timer)
        Log.error("Event loop error: ${msg} | Stopping interval (ID: ${timer})", { msg = err, timer = main_loop_timer })
    end)

    -- Listen for shutdown event.
    Events:on("lua::shutdown", function()
        Log.info("Shutdown signal received. Stopping event loop (ID: ${timer})", { timer = main_loop_timer })
        if main_loop_timer then
            Log.info("Clearing interval (ID: ${timer})", { timer = main_loop_timer })
            clearInterval(main_loop_timer)
            _G.main_loop_timer = nil -- Ensure it's unset
        else
            Log.warn("Shutdown executed, but main_loop_timer was already nil.")
        end
    end)
end


_G.sleep = function(ms)
    if type(_G['_sleep_js']) == "nil" then
        Log.error("sleep function not available when timers are disabled.")
        return
    end
    _G['_sleep_js'](ms):await()
end
