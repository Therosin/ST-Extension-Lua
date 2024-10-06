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

---@class LuaCanvasEvent
---@field public type string The type of event ('click', 'mouseenter', 'mouseleave', 'mousemove').
---@field public x number The x-coordinate of the mouse relative to the canvas.
---@field public y number The y-coordinate of the mouse relative to the canvas.

---@class LuaCanvasOptions
---@field public width number The width of the canvas element.
---@field public height number The height of the canvas element.

---@class LuaCanvasPoint
---@field public x number The x-coordinate of the point.
---@field public y number The y-coordinate of the point.


---@class LuaCanvas : HTMLElement
---@field public width number The width of the canvas element.
---@field public height number The height of the canvas element.
---@field public ctx any The 2D drawing context of the canvas.
---@field public interactiveShapes table List of shapes that can be interacted with.
---@field public hoveredShape any The shape that is currently hovered, if any.
local LuaCanvas = {}

--- Clears the entire canvas.
function LuaCanvas.clearCanvas() end

--- Draws a rectangle on the canvas and optionally makes it interactive.
---@param x number The x-coordinate of the rectangle's top-left corner.
---@param y number The y-coordinate of the rectangle's top-left corner.
---@param width number The width of the rectangle.
---@param height number The height of the rectangle.
---@param color string The color of the rectangle.
---@param eventName string|nil The event name to emit when the rectangle is interacted with.
function LuaCanvas.drawRectangle(x, y, width, height, color, eventName) end

--- Draws a circle on the canvas.
---@param x number The x-coordinate of the circle's center.
---@param y number The y-coordinate of the circle's center.
---@param radius number The radius of the circle.
---@param color string The color of the circle.
---@param eventName string|nil The event name to emit when the circle is interacted with.
function LuaCanvas.drawCircle(x, y, radius, color, eventName) end

--- Draws a polygon on the canvas.
---@param points LuaCanvasPoint[] An array of LuaCanvasPoint objects representing the vertices of the polygon.
---@param color string The fill color of the polygon.
---@param closePath boolean|nil Whether to close the path (connect the last point to the first).
---@param eventName string|nil The event name to emit when the polygon is interacted with.
function LuaCanvas.drawPolygon(points, color, closePath, eventName) end

--- Subscribes to an event emitted by the canvas.
---@param eventName string The event name to listen to.
---@param callback fun(event: LuaCanvasEvent) The function to call when the event is emitted.
function LuaCanvas.on(eventName, callback) end


--- sets the draw function that will be called on each frame.
---@param drawFunction fun() The function to call on each frame.
function LuaCanvas.on_draw(drawFunction) end

--- Starts the animation loop.
--- The draw function set with `on_draw` will be called on each frame.
--- The animation will continue until `stopAnimation` is called.
function LuaCanvas.startAnimation() end

--- Stops the animation loop.
--- The draw function set with `on_draw` will no longer be called.
--- The animation can be resumed by calling `startAnimation`.
function LuaCanvas.stopAnimation() end

--- Create a new LuaCanvas element.
---@param options? LuaCanvasOptions A table of configuration options.
---@return LuaCanvas LuaCanvasElement The created LuaCanvas element.
function CreateLuaCanvas(options) end
