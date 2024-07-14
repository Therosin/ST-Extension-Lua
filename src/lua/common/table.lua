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

-- Table functions

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
---@param tbl table                                              table to check
---@param val any                                                value to check for
---@return boolean                                              true if the table contains the value
function table.contains(tbl, val)
    for _, v in pairs(tbl) do
        if v == val then
            return true
        end
    end
    return false
end

--- checks if a table contains a key
---@param tbl table                                              table to check
---@param key any                                                key to check for
---@return boolean                                               true if the table contains the key
function table.hasKey(tbl, key)
    return tbl[key] ~= nil
end

--- All Keys in a table
---@param tbl table                                              table to get keys from
---@return table                                                table of keys
function table.keys(tbl)
    local keys = {}
    for k, _ in pairs(tbl) do
        keys[#keys + 1] = k
    end
    return keys
end

--- All Values in a table
---@param tbl table                                              table to get values from
---@return table                                                table of values
function table.values(tbl)
    local values = {}
    for _, v in pairs(tbl) do
        values[#values + 1] = v
    end
    return values
end

--- ForEach in a table
---@param tbl table                                              table to iterate over
---@param func fun(k, v)                                         function to call for each key, value pair
function table.forEach(tbl, func)
    for k, v in pairs(tbl) do
        func(k, v)
    end
end

--- ForEachArr in a table
---@param tbl table                                              table to iterate over
---@param func fun(i, v)                                         function to call for each value
function table.forEachArr(tbl, func)
    for i, v in ipairs(tbl) do
        func(i, v)
    end
end

--- Creates a new table with the results of calling a function for every element in the table
---@param tbl table                                              table to map
---@param func fun(k, v)                                         function to call for each key, value pair
---@return table                                                 mapped table
function table.map(tbl, func)
    local mapped = {}
    for k, v in pairs(tbl) do
        mapped[k] = func(k, v)
    end
    return mapped
end

--- Shallow copies a table
---@param tbl table                                              table to copy
---@return table                                                 copied table
function table.copy(tbl)
    if type(tbl) ~= "table" and not (type(tbl) == "userdata" and jstype(tbl) == "Object") then
        error("table.copy expects a table or a JS Object as an argument")
    end

    local copy = {}

    --- handle arrays
    if (type(tbl) == "userdata" and jstype(tbl) == "Array") then
        ---@diagnostic disable-next-line: param-type-mismatch
        for i, v in ipairs(tbl) do
            copy[i] = v
        end
        return copy
    end

    --- handle tables and js objects
    for k, v in pairs(tbl) do
        copy[k] = v
    end
    return copy
end

--- Deep copies a table
---@param tbl table                                              table to copy
---@param seen table|nil                                         internal use for tracking circular references
---@return table                                                 copied table
function table.deepcopy(tbl, seen)
    if type(tbl) ~= "table" and not (type(tbl) == "userdata" and jstype(tbl) == "object") then
        error("table.deepcopy expects a table or a JS Object as an argument")
    end

    seen = seen or {}
    if seen[tbl] then
        return seen[tbl]
    end

    local copy = {}

    seen[tbl] = copy

    --- handle tables and js objects
    for k, v in pairs(tbl) do
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
---@param tbls table[]                                           tables to merge
---@return table                                                 merged table
function table.update(tbls)
    local merged = {}
    for _, tbl in ipairs(tbls) do
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
---@param tbl T                                                 table to freeze
---@return T                                                    frozen table
function table.freeze(tbl)
    return setmetatable({}, {
        __index = tbl,
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
---@param tbl table                                              table to check
---@return boolean                                              true if the table is frozen
function table.isFrozen(tbl)
    return (getmetatable(tbl) == "frozen") or false
end

return table
