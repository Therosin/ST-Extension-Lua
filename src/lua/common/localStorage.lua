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

local table = require "Common.table"

local has_localStorage = false;
if not (js_localStorage == nil) then
    has_localStorage = true;
end

---@class localStorage
local localStorage = {}

--- sets a value in the local storage
---@param key string                                            key to set
---@param value string|table|nil                                value to set
function localStorage.set(key, value)
    if not has_localStorage then error("localStorage is not available") end
    js_localStorage:set(key, value)
end

--- gets a value from the local storage
---@param key string                                            key to get
---@return string|table|nil                                     value
function localStorage.get(key)
    if not has_localStorage then error("localStorage is not available") end
    -- BUG: JS returns an json object, need to deepcopy it to lua table.
    local data = js_localStorage:get(key)
    if data == nil then return nil end
    data = table.deepcopy(data)
    return data
end

return localStorage