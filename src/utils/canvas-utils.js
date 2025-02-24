// Copyright (C) 2025 Theros <https://github.com/therosin>
// 
// This file is part of ST-Extension-Lua.
// 
// ST-Extension-Lua is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// ST-Extension-Lua is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with ST-Extension-Lua.  If not, see <https://www.gnu.org/licenses/>.

export class ConfigValidator {
    static validateResourceURL(url) {
        const allowedSchemas = ['http://', 'https://', 'data:image/', 'blob:'];
        const isAllowedSchema = allowedSchemas.some((schema) => url.startsWith(schema));
        if (!isAllowedSchema) {
            throw new Error(`Invalid URL schema: ${url}`);
        }

        const allowedHosts = [
            'localhost',
            '127.0.0.1',
            '192.*.*.*',
        ];

        const isAllowedHost = allowedHosts.some((host) => {
            const regex = new RegExp(host.replace(/\*/g, '.*'));
            return regex.test(url);
        });

        if (!isAllowedHost) {
            throw new Error(`Invalid URL host: ${url} (allowed hosts: ${allowedHosts.join(', ')})`);
        }

        return true;
    }
}

export class ShapeUtils {
    static isPointInRectangle(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    }

    static isPointInCircle(x, y, circle) {
        const dx = x - circle.x;
        const dy = y - circle.y;
        return dx * dx + dy * dy <= circle.radius * circle.radius;
    }

    static isPointInPolygon(x, y, points) {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x, yi = points[i].y;
            const xj = points[j].x, yj = points[j].y;
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    static isPointInPath(x, y, path) {
        const ctx = path.ctx;
        if (!ctx) return false;
        ctx.beginPath();
        path.commands.forEach(({ type, points }) => {
            if (!points || points.length === 0) return; // Validate points
            if (type === 'moveTo') ctx.moveTo(...points);
            else if (type === 'lineTo') ctx.lineTo(...points);
            else if (type === 'arc') ctx.arc(...points);
        });
        ctx.closePath();
        return ctx.isPointInPath(x, y);
    }
}

export class DrawingFunctions {
    static clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return this;
    }

    static setBackgroundColor(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        return this;
    }

    static drawRectangle(x, y, width, height, color = 'black', eventName = null) {
        const ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);

        if (eventName) {
            this.shapes.push({
                type: 'rectangle', x, y, width, height, color, eventName
            });
        }
        return this;
    }

    static drawCircle(x, y, radius, color = 'black', eventName = null) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();

        if (eventName) {
            this.shapes.push({
                type: 'circle', x, y, radius, color, eventName
            });
        }
        return this;
    }

    static drawPolygon(points, color = 'black', eventName = null) {
        if (points.length < 2) return this;

        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        if (eventName) {
            this.shapes.push({
                type: 'polygon', points, color, eventName
            });
        }
        return this;
    }

    static drawPath(commands, options = {}, eventName = null) {
        const { strokeColor = 'black', fillColor = null, lineWidth = 1 } = options;

        const ctx = this.ctx;
        ctx.beginPath();

        commands.forEach(({ type, points }) => {
            if (!points || points.length === 0) return; // Validate points
            if (type === 'moveTo') ctx.moveTo(...points);
            else if (type === 'lineTo') ctx.lineTo(...points);
            else if (type === 'arc') ctx.arc(...points);
            else if (type === 'bezierCurveTo') ctx.bezierCurveTo(...points);
            else if (type === 'quadraticCurveTo') ctx.quadraticCurveTo(...points);
        });

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
        ctx.closePath();

        if (eventName) {
            this.shapes.push({
                type: 'path', commands, strokeColor, fillColor, lineWidth, eventName
            });
        }
        return this;
    }

    static drawImage(source, x, y, width, height, eventName = null) {
        const ctx = this.ctx;
        const img = new Image();
        if (ConfigValidator.validateResourceURL(source) === false) {
            console.error('Invalid image source:', source);
            return this
        }
        img.src = source;

        img.onload = () => {
            if (width && height) {
                ctx.drawImage(img, x, y, width, height);
                this.shapes.push({
                    type: 'image', x, y, width, height, source, eventName
                }); // Add shape after image load
            } else {
                ctx.drawImage(img, x, y);
            }
        };
        return this;
    }
}

// === EventHandlers ===

export class EventHandlers {
    static handleMouseMove(event, canvasElement) {
        const rect = canvasElement.canvas.getBoundingClientRect();
        const scaleX = canvasElement.canvas.width / rect.width;
        const scaleY = canvasElement.canvas.height / rect.height;

        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;

        let foundShape = null;
        Object.values(canvasElement.layers).forEach((layer) => {
            for (let shape of layer.shapes) {
                if (
                    (shape.type === 'rectangle' && ShapeUtils.isPointInRectangle(mouseX, mouseY, shape)) ||
                    (shape.type === 'circle' && ShapeUtils.isPointInCircle(mouseX, mouseY, shape)) ||
                    (shape.type === 'polygon' && ShapeUtils.isPointInPolygon(mouseX, mouseY, shape.points)) ||
                    (shape.type === 'path' && ShapeUtils.isPointInPath(mouseX, mouseY, { ctx: layer.ctx, commands: shape.commands })) ||
                    (shape.type === 'image' && ShapeUtils.isPointInRectangle(mouseX, mouseY, shape))
                ) {
                    foundShape = shape;
                    break;
                }
            }
        });

        if (canvasElement.hoveredShape !== foundShape) {
            EventHandlers.handleHoverState(foundShape, mouseX, mouseY, canvasElement);
        }

        canvasElement.emit('mousemove', { x: mouseX, y: mouseY });
    }

    static handleClick(event, canvasElement) {
        const rect = canvasElement.canvas.getBoundingClientRect();
        const scaleX = canvasElement.canvas.width / rect.width;
        const scaleY = canvasElement.canvas.height / rect.height;

        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;

        Object.values(canvasElement.layers).forEach((layer) => {
            for (let shape of layer.shapes) {
                if (
                    (shape.type === 'rectangle' && ShapeUtils.isPointInRectangle(clickX, clickY, shape)) ||
                    (shape.type === 'circle' && ShapeUtils.isPointInCircle(clickX, clickY, shape)) ||
                    (shape.type === 'polygon' && ShapeUtils.isPointInPolygon(clickX, clickY, shape.points)) ||
                    (shape.type === 'path' && ShapeUtils.isPointInPath(clickX, clickY, { ctx: layer.ctx, commands: shape.commands })) ||
                    (shape.type === 'image' && ShapeUtils.isPointInRectangle(clickX, clickY, shape))
                ) {
                    canvasElement.emit(shape.eventName, { type: 'click', x: clickX, y: clickY });
                    break;
                }
            }
        });

        canvasElement.emit('click', { x: clickX, y: clickY });
    }

    static handleKeyDown(event, canvasElement) {
        canvasElement.emit('keydown', { key: event.key, code: event.code });
    }

    static handleKeyUp(event, canvasElement) {
        canvasElement.emit('keyup', { key: event.key, code: event.code });
    }

    static handleHoverState(foundShape, mouseX, mouseY, canvasElement) {
        if (foundShape) {
            if (canvasElement.hoveredShape !== foundShape) {
                if (canvasElement.hoveredShape) {
                    canvasElement.emit(canvasElement.hoveredShape.eventName, { type: 'mouseleave', x: mouseX, y: mouseY });
                }
                canvasElement.hoveredShape = foundShape;
                canvasElement.emit(foundShape.eventName, { type: 'mouseenter', x: mouseX, y: mouseY });
            } else {
                canvasElement.emit(foundShape.eventName, { type: 'mousemove', x: mouseX, y: mouseY });
            }
        } else if (canvasElement.hoveredShape) {
            canvasElement.emit(canvasElement.hoveredShape.eventName, { type: 'mouseleave', x: mouseX, y: mouseY });
            canvasElement.hoveredShape = null;
        }
    }
}
