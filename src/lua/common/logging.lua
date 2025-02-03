-- Copyright (C) 2025 Theros <https://github.com/therosin>
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

local string = require "Common.string"

--- Log Levels
---@enum LOG_LEVELS 
local LOG_LEVELS = { error = "ERROR", warn = "WARN", info = "INFO", debug = "DEBUG" }

--- Generalized Log Function
---@class Logger
---@overload fun(message: string, vars?: table<string|number, any>)
Log = setmetatable({}, {
    __call = function(_, message, vars)
        local formattedMessage = vars and string.expand(message, vars) or message
        print(string.format("[%s] %s", Extension.name, formattedMessage))
    end
})

-- ─── Public Methods ──────────────────────────────────────────────────────────

--- Logs an info message
---@param message string
---@param vars? table<string|number, any>
function Log.info(message, vars)
    Log(string.format("[%s] %s", LOG_LEVELS.info, message), vars)
end

--- Logs a warning message
---@param message string
---@param vars? table<string|number, any>
function Log.warn(message, vars)
    Log(string.format("[%s] %s", LOG_LEVELS.warn, message), vars)
end

--- Logs an error message
---@param message string
---@param vars? table<string|number, any>
---@param traceback? boolean
function Log.error(message, vars, traceback)
    Log(string.format("[%s] %s", LOG_LEVELS.error, message), vars)
    if traceback then
        print(debug.traceback())
    end
end

--- Logs a debug message
---@param message string
---@param vars? table<string|number, any>
function Log.debug(message, vars)
    Log(string.format("[%s] %s", LOG_LEVELS.debug, message), vars)
end


return Log