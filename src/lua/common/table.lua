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
local DEBUG_ENABLED = false

local table = setmetatable({
    --- gets or sets the debug state
    ---@param state? boolean                                        the state to set, if nil returns the current state
    ---@return boolean                                             the current state
    DEBUG = function(state)
        if state ~= nil then
            return DEBUG_ENABLED
        else
            DEBUG_ENABLED = state or false
        end
        return DEBUG_ENABLED
    end
}, { __index = table })

--- checks if a table contains a value
---@param t table                                              table to check
---@param val any                                                value to check for
---@return boolean                                              true if the table contains the value
function table.contains(t, val)
    for _, v in pairs(t) do
        if v == val then
            return true
        end
    end
    return false
end

--- checks if a table contains a key
---@param t table                                              table to check
---@param key any                                                key to check for
---@return boolean                                               true if the table contains the key
function table.hasKey(t, key)
    return t[key] ~= nil
end

--- All Keys in a table
---@param t table                                              table to get keys from
---@return table                                                table of keys
function table.keys(t)
    local keys = {}
    for k, _ in pairs(t) do
        keys[#keys + 1] = k
    end
    return keys
end

--- All Values in a table
---@param t table                                              table to get values from
---@return table                                                table of values
function table.values(t)
    local values = {}
    for _, v in pairs(t) do
        values[#values + 1] = v
    end
    return values
end

--- ForEach in a table
---@param t table                                              table to iterate over
---@param func fun(k, v)                                         function to call for each key, value pair
function table.forEach(t, func)
    for k, v in pairs(t) do
        func(k, v)
    end
end

--- ForEachArr in a table
---@param t table                                              table to iterate over
---@param func fun(i, v)                                         function to call for each value
function table.forEachArr(t, func)
    for i, v in ipairs(t) do
        func(i, v)
    end
end

--- Creates a new table with the results of calling a function for every element in the table
---@param t table                                              table to map
---@param func fun(k, v)                                         function to call for each key, value pair
---@return table                                                 mapped table
function table.map(t, func)
    local mapped = {}
    for k, v in pairs(t) do
        mapped[k] = func(k, v)
    end
    return mapped
end

--- Shallow copies a table
---@param t table                                              table to copy
---@return table                                                 copied table
function table.copy(t)
    if type(t) ~= "table" and not (type(t) == "userdata" and jstype(t) == "Object") then
        error("table.copy expects a table or a JS Object as an argument")
    end

    local copy = {}

    --- handle arrays
    if (type(t) == "userdata" and jstype(t) == "Array") then
        ---@diagnostic disable-next-line: param-type-mismatch
        for i, v in ipairs(t) do
            copy[i] = v
        end
        return copy
    end

    --- handle tables and js objects
    for k, v in pairs(t) do
        copy[k] = v
    end
    return copy
end

--- Deep copies a table
---@param t table                                              table to copy
---@param seen table|nil                                         internal use for tracking circular references
---@return table                                                 copied table
function table.deepcopy(t, seen)
    if type(t) ~= "table" and not (type(t) == "userdata" and jstype(t) == "object") then
        error("table.deepcopy expects a table or a JS Object as an argument")
    end

    seen = seen or {}
    if seen[t] then
        return seen[t]
    end

    local copy = {}

    seen[t] = copy

    --- handle tables and js objects
    for k, v in pairs(t) do
        if type(v) == "table" or (type(v) == "userdata" and jstype(v) == "object") then
            ---@diagnostic disable-next-line: param-type-mismatch
            copy[k] = table.deepcopy(v, seen)
        else
            copy[k] = v
        end
    end
    return copy
end

--- merges tables from right to left, overwriting values in tables to the left
---@param ... table[]                                           tables to merge
---@return table                                                 merged table
function table.update(...)
    local merged = {}
    for _, tbl in ipairs(...) do
        for k, v in pairs(tbl) do
            merged[k] = v
        end
    end
    return merged
end

--- Freezes a table, making it immutable
--- uses a metatable to prevent modification of the table, NOTE: rawset can override this.
--- NOTE: this is not a deep freeze, only the top level table is frozen.
---@generic T: table
---@param t T                                                 table to freeze
---@return T                                                    frozen table
function table.freeze(t)
    return setmetatable({}, {
        __index = t,
        __newindex = function()
            if DEBUG_ENABLED then
                print("Ignoring Attempt to modify a frozen table")
            end
        end,
        -- prevent modification of the metatable
        __metatable = "frozen"
    })
end

--- checks if a table is frozen
---@param t table                                              table to check
---@return boolean                                              true if the table is frozen
function table.isFrozen(t)
    return (getmetatable(t) == "frozen") or false
end

--- Destructures a table based on the specified keys.
--- supports nested keys using dot notation.
---@example
--- ```lua
--- local tbl = {a = 1, b = 2, c = {d = 3, e = 4}}
--- local a, b, d = table.destructure(tbl, {"a", "b", "c.d"})
--- print(a, b, d) -- 1 2 3
--- ```
---@param t table The table to destructure.
---@param keys table The keys to use for destructuring.
function table.destructure(t, keys)
    -- implementation goes here
    local function extract_value(t, key)
        local value = t
        for part in string.gmatch(key, "[^.]+") do
            value = value[part]
        end
        return value
    end

    local result = {}
    for _, key in ipairs(keys) do
        t.insert(result, extract_value(t, key))
    end
    return t.unpack(result)
end

--- Retrieves a specified number of elements from a table.
--- @param t table The table to retrieve elements from.
--- @param count number The number of elements to retrieve.
--- @param reverse boolean (optional) If true, retrieves elements in reverse order.
--- @return table elements.
function table.elements(t, count, reverse)
    local result = {}
    local len = #t

    if reverse then
        -- Unpack the last `count` elements
        for i = len - count + 1, len do
            table.insert(result, t[i])
        end
    else
        -- Unpack the first `count` elements
        for i = 1, count do
            table.insert(result, t[i])
        end
    end

    return unpack(result)
end

return table
