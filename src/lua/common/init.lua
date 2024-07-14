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

return Common
