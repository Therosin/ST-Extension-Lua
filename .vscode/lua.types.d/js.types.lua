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
---@meta

--- returns the JS type of a value.
---@param value any
---@return string
_G.jstype = function(value) end


local Regex = {}

--- Regex match
---@param str string
---@param pattern string (global)
---@return table
function Regex.match(str, pattern) end

--- Regex replace
---@param str string
---@param pattern string (global)
---@param replace string
---@return string
function Regex.replace(str, pattern, replace) end

--- Regex test
---@param str string
---@param pattern string
---@return boolean
function Regex.test(str, pattern) end

_G.Regex = Regex


local JSON = {}

--- JSON parse
---@param str string
---@return table
---@return string
function JSON.parse(str) end

--- JSON stringify
---@param value table
---@return string
function JSON.stringify(value) end

_G.JSON = JSON

--- setTimeout
---@param callback function (callback)
---@param delay number (milliseconds)
---@vararg any arguments
---@return userdata (timer)
_G.setTimer = function(callback, delay, ...) end

--- clearTimeout
---@param timer userdata (timer)
_G.clearTimer = function(timer) end

--- setInterval
---@param callback function (callback)
---@param delay number (milliseconds)
---@vararg any arguments
---@return userdata (interval)
_G.setInterval = function(callback, delay, ...) end

--- clearInterval
---@param interval userdata (interval)
---@return nil
_G.clearInterval = function(interval) end


---@class toastr
local toastr = {}

--- success
---@param message string
---@param title string
function toastr.success(message, title) end

--- error
---@param message string
---@param title string
function toastr.error(message, title) end

--- warning
---@param message string
---@param title string
function toastr.warning(message, title) end

--- info
---@param message string
---@param title string
function toastr.info(message, title) end

_G.toastr = toastr


--- fetch
---@param url string
---@param options table
---@return any
_G.fetch = function(url, options) end


local Document = {}

--- findElement
--- Find an element by selector.
---@param selector string
---@return userdata
function Document.findElement(selector) end

--- createElement
--- Create an element.
---@param tag string
---@param attributes table
---@param textContent? string
---@return userdata
function Document.createElement(tag, attributes, textContent) end

--- modifyElement
--- Modify an element.
---@param element userdata
---@param attributes table
---@param textContent? string
function Document.modifyElement(element, attributes, textContent) end

--- addEventListener
--- Add an event listener to an element.
---@param element userdata
---@param event string
---@param callback function
function Document.addEventListener(element, event, callback) end

--- createStyle
--- Create a css string from a table of css properties.
---@param css table
---@return string
function Document.createStyle(css) end

_G.Document = Document