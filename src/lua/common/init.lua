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

---@diagnostic disable-next-line: deprecated
local unpack = table.unpack or unpack

local Common = {
    DEBUG_ENABLED = false, -- set to true to enable debug messages
}

--- basic function timer, returns the time it took to run the function.
---@param func function                                         The function to time.
---@param ... any                                               The arguments to pass to the function.
---@return number                                               Time it took to run the function, in seconds.
function Common.TimedFunc(func, ...)
    local startTime = os.clock()
    func(...)
    return os.clock() - startTime
end

function Common.numrange(from, to, step)
    if not from then return error("from is required", 2) end
    if not to then return error("to is required", 2) end
    step = step or 1
    local t = {}
    for i = from, to, step do
        table.insert(t, i)
    end

    return t
end

local TryCatch = {}
TryCatch.__index = TryCatch

function TryCatch:new(try_block)
    local o = setmetatable({}, self)
    o.try_block = try_block
    o.catch_block = nil
    o.finally_block = nil
    o.results = nil
    return o
end

function TryCatch:catch(catch_block)
    self.catch_block = catch_block
    return self
end

function TryCatch:finally(finally_block)
    self.finally_block = finally_block
    self:execute()
    return self
end

function TryCatch:execute()
    local status, results = pcall(function()
        self.results = {self.try_block()}
        return unpack(self.results)
    end)

    if not status and self.catch_block then
        self.catch_block(results)
    end

    if self.finally_block then
        self.finally_block(unpack(self.results or {}))
    end
end

setmetatable(TryCatch, {
    __call = function(_, try_block)
        return TryCatch:new(try_block)
    end
})

Common.TryCatch = TryCatch

return Common
