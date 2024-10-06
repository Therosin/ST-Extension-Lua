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
local Pandora = require 'Pandora';
local class, static = Pandora.class, Pandora.static;
local Context = SillyTavern.getContext()

---@class ToolCalling
--- Provides a System for for defining LLM Tool Calls
local ToolCalling = {
    --- Registered Tools
    ---@type table<string, ToolCall>
    Tools = {}
}

function ToolCalling:registerTool(toolCall)
    --- validate ToolCall Object
    assert(type(toolCall) == "table" and toolCall.name and toolCall.action, "Invalid ToolCall object")
    --- add ToolCall to Tools
    self.Tools[toolCall.name] = toolCall
    --- use Context.registerFunctionTool to register the ToolCall (using the reference from self.Tools)
    Context.registerFunctionTool({
        name = toolCall.name,
        displayName = toolCall.displayName,
        description = toolCall.description,
        parameters = toolCall.parameters,
        action = toolCall.action,
        formatMessage = toolCall.formatMessage
    })
end

function ToolCalling:unregisterTool(toolCall)
    --- validate ToolCall Object
    assert(type(toolCall) == "table" and toolCall.name, "Invalid ToolCall object")

    --- Must find Exact Reference to ToolCall in Tools
    if self.Tools[toolCall.name] then
        self.Tools[toolCall.name] = nil
        Context.unregisterFunctionTool(toolCall.name)
    end
end

---@class ToolCall
---@field name string Internal name of the function tool, must be unique.
---@field displayName string Display name of the function tool, optional.
---@field description string Description of the function tool, explaining what it does and when to use it.
---@field parameters table JSON schema for the parameters of the function tool.
---@field action function Function to call when the tool is triggered. Can be async.
---@field formatMessage function|nil Optional function to format the toast message displayed when the function is invoked.
local ToolCall = class 'ToolCall' {

    --- Creates a new ToolCall object
    ---@param name string
    ---@param displayName string|nil
    ---@param description string
    ---@param parameters table
    ---@param action function
    ---@param formatMessage function|nil
    ToolCall = function(self, name, displayName, description, parameters, action, formatMessage)
        assert(type(name) == "string" and name ~= "", "ToolCall 'name' must be a non-empty string")
        assert(type(description) == "string" and description ~= "", "ToolCall 'description' must be a non-empty string")
        assert(type(parameters) == "table", "ToolCall 'parameters' must be a table")
        assert(type(action) == "function", "ToolCall 'action' must be a function")
        self.name = name
        self.displayName = displayName
        self.description = description
        self.parameters = parameters
        self.action = action
        self.formatMessage = formatMessage
    end

}


ToolCalling.ToolCall = ToolCall


return ToolCalling