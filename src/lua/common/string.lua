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


local string = setmetatable({}, {__index = string})

--- splits a string into a table
---@param str string                                            the string to split
---@param sep string                                            separator to split on (default ":")
---@return table                                                table of strings
function string.split(str, sep)
    local sep, fields = sep or ":", {}
    local pattern = string.format("([^%s]+)", sep)
    local _ = str:gsub(pattern, function(c) fields[#fields+1] = c end)
    return fields
end

--- trims whitespace from a string
---@param s string                                              string to trim
---@return string                                               trimmed string
function string.trim(s)
    return s:match'^()%s*$' and '' or s:match'^%s*(.*%S)'
end

--- checks if a string starts with a substring
---@param str string                                            string to check
---@param start string                                          substring to check for
function string.startswith(str, start)
    return str:sub(1, #start) == start
end

--- checks if a string ends with a substring
---@param str string                                            string to check
---@param ending string                                         substring to check for
function string.endswith(str, ending)
    return ending == "" or str:sub(-#ending) == ending
end

--- expands a string with variables
---@param s string                                              to expand
---@param subst table|function                                  variables to expand, can also be a function to string.gsub
function string.expand(s, subst)
    local res, k = s:gsub('%${([%w_]+)}', subst)
    if k > 0 then return res end
    return (res:gsub('%$([%w_]+)', subst))
end

return string