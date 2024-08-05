-- Copyright (C) 2024 Theros <https://github.com/therosin>
--
-- This file is part of ST-Extension-Lua-Workspace.
--
-- ST-Extension-Lua-Workspace is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- ST-Extension-Lua-Workspace is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with ST-Extension-Lua-Workspace.  If not, see <https://www.gnu.org/licenses/>.
---@meta

---@class Document
local Document = {}

--- findElement
--- Find an element by selector.
---@param selector string
---@return HTMLElement?
function Document.findElement(selector) end

--- createElement
--- Create an element.
---@param tag string
---@param attributes HTMLElementAttributes
---@param textContent? string
---@return HTMLElement
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


---@class HTMLElement : HTMLElementAttributes
local HTMLElement = {}

--- Appends a child element to the current element
---@param element HTMLElement The element to append
---@return HTMLElement element The appended element
function HTMLElement.appendChild(element) end

--- Removes a child element from the current element
---@param element HTMLElement The element to remove
---@return HTMLElement element The removed element
function HTMLElement.removeChild(element) end

--- Sets an attribute on the element
---@param name string The name of the attribute
---@param value string|boolean|number The value of the attribute
function HTMLElement.setAttribute(name, value) end

--- Gets the value of an attribute on the element
---@param name string The name of the attribute
---@return string|boolean|number? value The value of the attribute
function HTMLElement.getAttribute(name) end

--- Removes an attribute from the element
---@param name string The name of the attribute
function HTMLElement.removeAttribute(name) end

--- Adds an event listener to the element
---@param event string The event type to listen for
---@param callback function The function to call when the event occurs
function HTMLElement.addEventListener(event, callback) end

--- Removes an event listener from the element
---@param event string The event type to remove
---@param callback function The function to remove
function HTMLElement.removeEventListener(event, callback) end

--- Simulates a click on the element
function HTMLElement.click() end

--- Sets focus on the element
function HTMLElement.focus() end

--- Removes focus from the element
function HTMLElement.blur() end

--- Selects the text in the element (for input elements)
function HTMLElement.select() end

--- Submits the form (for form elements)
function HTMLElement.submit() end

--- Resets the form (for form elements)
function HTMLElement.reset() end

--- Gets elements by class name
---@param className string The class name to match
---@return HTMLElement[] elements A list of matching elements
function HTMLElement.getElementsByClassName(className) end

--- Gets elements by tag name
---@param tagName string The tag name to match
---@return HTMLElement[] elements A list of matching elements
function HTMLElement.getElementsByTagName(tagName) end

--- Gets the first element that matches the selector
---@param selectors string The CSS selector to match
---@return HTMLElement? element The first matching element
function HTMLElement.querySelector(selectors) end

--- Gets all elements that match the selector
---@param selectors string The CSS selector to match
---@return HTMLElement[] elements A list of matching elements
function HTMLElement.querySelectorAll(selectors) end

--- Gets the parent element
---@return HTMLElement? parentElement The parent element
function HTMLElement.getParentElement() end

--- Gets the first child element
---@return HTMLElement? firstChild The first child element
function HTMLElement.getFirstChild() end

--- Gets the last child element
---@return HTMLElement? lastChild The last child element
function HTMLElement.getLastChild() end

--- Removes the element from the document
---@return HTMLElement element The removed element
function HTMLElement.remove() end

---@class HTMLElementAttributes
---@field id? string Unique identifier for the element
---@field className? string Class name(s) for the element
---@field style? string Inline style for the element
---@field innerHTML? string HTML content inside the element
---@field innerText? string Text content inside the element
---@field value? string Value of the element (for input elements)
---@field checked? boolean Checked state (for checkbox/radio input elements)
---@field disabled? boolean Disabled state of the element (for input elements)
---@field selected? boolean Selected state (for option elements)
---@field src? string Source URL (for image, script, etc.)
---@field href? string URL (for anchor elements)
---@field target? string Target for hyperlinks
---@field type? string Type of input element
---@field placeholder? string Placeholder text (for input elements)
---@field title? string Tooltip text for the element
---@field name? string Name attribute for form elements
---@field readOnly? boolean Read-only state (for input elements)
---@field multiple? boolean Multiple selection (for select elements)
---@field size? number Size (for input elements)
---@field tabIndex? number Tab index for focus order
---@field maxLength? number Maximum length (for input elements)
---@field minLength? number Minimum length (for input elements)
---@field pattern? string Pattern for input validation
---@field required? boolean Required state (for input elements)
---@field min? string Minimum value (for input elements)
---@field max? string Maximum value (for input elements)
---@field step? string Step value (for input elements)
---@field rows? number Number of rows (for textarea elements)
---@field cols? number Number of columns (for textarea elements)
---@field formAction? string URL to submit form data to
---@field formEncType? string Encoding type for form data
---@field formMethod? string HTTP method for form submission
---@field formNoValidate? boolean Skip form validation
---@field formTarget? string Target for form submission
---@field accept? string File types accepted (for input elements)
---@field autocomplete? string Autocomplete behavior (for input elements)
---@field autofocus? boolean Automatically focus on element
---@field form? string Form ID (for input elements)
---@field list? string ID of datalist element (for input elements)
---@field minDate? string Minimum date (for input elements)
---@field maxDate? string Maximum date (for input elements)
---@field stepUp? number Step up value (for input elements)
---@field stepDown? number Step down value (for input elements)
---@field valueAsDate? string Date value (for input elements)
---@field valueAsNumber? number Number value (for input elements)
