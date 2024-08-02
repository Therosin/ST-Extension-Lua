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

local Extension = {
    name = "ST-Extension-Lua",
    version = "0.2.0",
    author = "Theros <github/therosin>"
}

_G.DEBUG = false


_G.Log = function(...)
    print("[" .. Extension.name .. "]", ...)
end

if not (js_localStorage == nil) then
    local localStorage = require "localStorage"

    local config = localStorage.get("config") or {}

    if config.version == nil then
        Log("Initializing config")
        config.version = Extension.version
    end

    if config.version ~= Extension.version then
        Log("Updating config from version " .. config.version .. " to " .. Extension.version)
        config.version = Extension.version
        --- settings update logic here later...
    end

    localStorage.set("config", config)
end

_G.Events = EventManager("ST-Lua-EventManager")


Events:on("tick", function()
    if DEBUG then
        Log("Tick")
    end
end)

local main_timer;
if (type(_G['setInterval']) == 'function' or jstype(_G['setInterval']) == 'function') then
    main_timer = setInterval(function()
        Events:set_error(function(err)
            clearInterval(main_timer)
            Log("Error in event loop: " .. err)
        end)
        Events:emit("tick")
    end, 1000)
end
