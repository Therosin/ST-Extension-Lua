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

--[[
    This file contains a simple event system for Lua.
    tries to mimic the event system in C#.
    It also contains a simple coroutine based event loop.
--]]

---@class EventManager
---@field public name string
---@field public events table<string, fun(...)[]> -- A table of events, each event is a table of callbacks
---@field public on fun(self, name: string, callback: function): nil -- Adds a callback to an event
---@field public off fun(self, name: string, callback: function): nil -- Removes a callback from an event
---@field public emit fun(self, name: string, ...): nil -- Emits an event, any additional arguments are passed to the callbacks
---@field public new fun(self, name: string): EventManager -- Creates a new EventManager
---@overload fun(name: string): EventManager
local EventManager = {}

function EventManager:on(name, callback)
    if not self.events[name] then
        self.events[name] = {}
    end
    table.insert(self.events[name], callback)
end

function EventManager:off(name, callback)
    if not self.events[name] then
        return
    end
    for i, cb in ipairs(self.events[name]) do
        if cb == callback then
            table.remove(self.events[name], i)
            return
        end
    end
end

function EventManager:emit(name, ...)
    if not self.events[name] then
        return
    end
    for _, cb in ipairs(self.events[name]) do
        local ok, err = pcall(cb, ...)
        if not ok then
            if self.error_callback then
                self.error_callback(string.format("event %s threw an error: %s", name, err))
            else
                error(err)
            end
        end
    end
end

function EventManager:new(name)
    return setmetatable({ name = name, events = {} }, { __index = self })
end

function EventManager:set_error(callback)
    self.error_callback = callback
end

return setmetatable({}, { __call = function(_, ...) return EventManager:new(...) end })
