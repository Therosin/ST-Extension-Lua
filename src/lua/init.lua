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

-- Disable Debugging by default.
_G.DEBUG = false

-- Global Extension Object.
local Extension = {
    name = "ST-Extension-Lua",
    version = "1.2.0",
    author = "Theros <github/therosin>",
    config = {
        event_timer = 1000
    }
}
_G.Extension = Extension

-- Binds unpack to table.unpack for compatibility.
_G.unpack = unpack or table.unpack;

-- General Logging.
_G.Log = function(message, ...)
    print(string.format("[%s] " .. message, Extension.name, ...))
end

-- Setup LocalStorage.
if not (js_localStorage == nil) then
    local localStorage = require "localStorage"

    local config = localStorage.get("config") or {}

    if config.version == nil then
        Log("Initializing config")
        config.version = Extension.version
        for key, value in pairs(Extension.config) do
            config[key] = value
        end
        localStorage.set("config", config)
    end

    if config.version ~= Extension.version then
        Log("Updating config from version " .. config.version .. " to " .. Extension.version)
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
Events:on("tick", function()
    if DEBUG then
        Log("Debug :: EventLoop.Tick")
    end
end)

-- Setup Main Event Loop.
local main_timer;
if (type(_G['setInterval']) == 'function' or jstype(_G['setInterval']) == 'function') then
    main_timer = setInterval(function()
        Events:set_error(function(err)
            clearInterval(main_timer)
            Log("Error in event loop: " .. err)
        end)
        Events:emit("tick")
    end, Extension.config.event_timer)
end