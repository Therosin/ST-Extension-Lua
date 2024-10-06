/**
 * @typedef {Object} LuaCanvasConfig
 * @property {number} [width=300] - The width of the canvas.
 * @property {number} [height=150] - The height of the canvas.
*/

/**
 * @typedef {Object} LuaCanvasEvent
 * @property {'click' | 'mouseenter' | 'mouseleave' | 'mousemove'} type - The type of event.
 * @property {number} x - The x-coordinate of the mouse relative to the canvas.
 * @property {number} y - The y-coordinate of the mouse relative to the canvas.
*/

/**
 * @callback LuaCanvasEventHandler
 * @param {LuaCanvasEvent} event - The event object.
*/

/**
 * Helper function to detect if a point is inside a rectangle.
 * @param {number} x - The x-coordinate of the point.
 * @param {number} y - The y-coordinate of the point.
 * @param {Object} rect - The rectangle object with x, y, width, and height.
 * @returns {boolean} - True if the point is inside the rectangle.
*/
export function isPointInRectangle(x, y, rect) {
    return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    );
}

/**
 * Helper function to detect if a point is inside a circle.
 * @param {number} x - The x-coordinate of the point.
 * @param {number} y - The y-coordinate of the point.
 * @param {Object} circle - The circle object with x, y, and radius.
 * @returns {boolean} - True if the point is inside the circle.
*/
export function isPointInCircle(x, y, circle) {
    const dx = x - circle.x;
    const dy = y - circle.y;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/**
 * Helper function to detect if a point is inside a polygon.
 * @param {number} x - The x-coordinate of the point.
 * @param {number} y - The y-coordinate of the point.
 * @param {Array<{x: number, y: number}>} points - The array of points representing the polygon vertices.
 * @returns {boolean} - True if the point is inside the polygon.
*/
export function isPointInPolygon(x, y, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x;
        const yi = points[i].y;
        const xj = points[j].x;
        const yj = points[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}


/**
 * Helper function to check if a URL is a valid resource URL.
 * @param {string} url - The URL to check.
 * @returns {boolean} - Returns true if the URL is valid.
 * @throws {Error} - Throws an error with a specific reason if invalid.
 */
export function isValidResourceURL(url) {
    const allowedSchemas = [
        'http://', 'https://',
        'data:image/', /* Allow data URLs */
        'blob:' /* Allow blob URLs */
    ];

    const allowedHosts = [
        'localhost',
        '127.0.0.1'
    ];

    // Check if URL starts with one of the allowed schemas
    const schemaMatch = allowedSchemas.some(schema => url.startsWith(schema));
    
    // Function to check if host matches allowed hosts
    const isAllowedHost = (url) => {
        return allowedHosts.some(host => url.includes(`://${host}`));
    };

    // Check for data URLs, which are always allowed
    const isDataURL = url.startsWith('data:image/');

    // For data URLs, no further checks are needed
    if (isDataURL) {
        return true;
    }
    
    // Check for blob URLs
    const isBlobURL = url.startsWith('blob:');

    // Ensure schema is valid
    if (!schemaMatch) {
        throw new Error(`Invalid URL schema. Allowed schemas are: ${allowedSchemas.join(', ')}`);
    }

    // For http and https URLs, ensure the host is allowed
    if ((url.startsWith('http://') || url.startsWith('https://')) && !isAllowedHost(url)) {
        throw new Error(`Invalid host for URL. Allowed hosts for HTTP/HTTPS URLs are: ${allowedHosts.join(', ')}`);
    }

    // For blob URLs, ensure the host is allowed
    if (isBlobURL && !isAllowedHost(url)) {
        throw new Error(`Invalid host for Blob URL. Allowed hosts are: ${allowedHosts.join(', ')}`);
    }

    return true;
}





/**
 * LuaCanvasElement class that encapsulates an HTML5 canvas element, provides 2D drawing methods, and supports interactivity.
 * 
 * @class
 * @extends HTMLElement
*/
export default class LuaCanvasElement extends HTMLElement {
    constructor() {
        super();
        this.config = {}; // Configuration object for the canvas
        this.animationFrameId = null;
        this.shouldAnimate = false;
        this.drawCallback = null; // Store the Lua draw function here

        /** @type {EventTarget} */
        this.eventTarget = new EventTarget(); // Using EventTarget instead of EventEmitter

        this.interactiveShapes = []; // Array to store shapes that can be interacted with
        this.hoveredShape = null; // To track the currently hovered shape
    }

    connectedCallback() {
        // Create and append the canvas only when the element is connected to the DOM
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.config.width || 300;
        this.canvas.height = this.config.height || 150;
        this.appendChild(this.canvas); // Append the canvas to the custom element

        // Attach event listeners for interaction
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.setAttribute('tabindex', '0'); // Make the canvas focusable for keypress events
        this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    disconnectedCallback() {
        // Cleanup event listeners when the element is removed from the DOM
        this.canvas.removeEventListener('click', this.handleClick);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('keydown', this.handleKeyDown);
    }

    // Getters and setters for the width and height attributes

    get width() {
        return this.getAttribute('width');
    }

    set width(value) {
        this.setAttribute('width', value);
        this.canvas.width = value;
    }

    get height() {
        return this.getAttribute('height');
    }

    set height(value) {
        this.setAttribute('height', value);
        this.canvas.height = value;
    }


    static get observedAttributes() {
        return ['width', 'height'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'width') {
            this.canvas.width = parseInt(newValue, 10);
        } else if (name === 'height') {
            this.canvas.height = parseInt(newValue, 10);
        }
    }

    /* check if the element is connected to the DOM */
    get isConnected() {
        return this.isConnected;
    }

    /**
     * Sets the configuration object for the canvas.
     * @param {LuaCanvasConfig} config - The configuration object for the canvas.
     * @returns {void}
     * @example
     * canvasElement.setConfig({ width: 500, height: 300 });
    */
    setConfig(config) {
        this.config = config;
        if (this.isConnected) {
            this.canvas.width = config.width || 300;
            this.canvas.height = config.height || 150;
        }
    }

    /**
     * Gets the configuration object for the canvas.
     * @returns {LuaCanvasConfig} - The configuration object for the canvas.
     * @example
     * const config = canvasElement.getConfig();
     * console.log(config.width, config.height);
    */
    getConfig() {
        return this.config;
    }


    /**
     * Check if a point is inside a rectangle.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @param {Object} rect - The rectangle object with x, y, width, and height.
     * @returns {boolean} - True if the point is inside the rectangle.
     * @example
     * const isInside = canvasElement.isPointInRect(100, 100, { x: 50, y: 50, width: 100, height: 100 });
     * console.log(isInside); // true
    */
    isPointInRect(x, y, rect) {
        return isPointInRectangle(x, y, rect);
    }

    /**
     * Check if a point is inside a circle.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @param {Object} circle - The circle object with x, y, and radius.
     * @returns {boolean} - True if the point is inside the circle.
     * @example
     * const isInside = canvasElement.isPointInCircle(100, 100, { x: 50, y: 50, radius: 50 });
     * console.log(isInside); // true
    */
    isPointInCircle(x, y, circle) {
        return isPointInCircle(x, y, circle);
    }

    /**
     * Check if a point is inside a polygon.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @param {Array<{x: number, y: number}>} points - The array of points representing the polygon vertices.
     * @returns {boolean} - True if the point is inside the polygon.
     * @example
     * const points = [{ x: 50, y: 50 }, { x: 150, y: 50 }, { x: 100, y: 150 }];
     * const isInside = canvasElement.isPointInPolygon(100, 100, points);
     * console.log(isInside); // true
    */
    isPointInPolygon(x, y, points) {
        return isPointInPolygon(x, y, points);
    }

    /**
     * Subscribes to an event emitted by the canvas.
     * @param {string} eventName - The event name to listen to.
     * @param {LuaCanvasEventHandler} callback - The function to call when the event is emitted.
     */
    on(eventName, callback) {
        this.eventTarget.addEventListener(eventName, callback);
    }

    /**
     * Emits an event.
     * @param {string} eventName - The event name to emit.
     * @param {Object} detail - Additional data to pass with the event.
     */
    emit(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.eventTarget.dispatchEvent(event);
    }

    /**
     * Sets the Lua function to be called on each frame.
     * @param {Function} callback - The Lua function to be called on each frame.
    */
    on_draw(callback) {
        this.drawCallback = callback;
    }

    /**
     * Resizes the canvas to the specified width and height.
     * @param {number} width - The new width of the canvas.
     * @param {number} height - The new height of the canvas.
    */
    resize(width, height) {
        this.setAttribute('width', width);
        this.setAttribute('height', height);
        this.canvas.width = width;
        this.canvas.height = height;
    }

    /**
     * Clears the entire canvas.
    */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.interactiveShapes = []; // Clear the list of interactive shapes
    }

    /**
     * Sets the background color of the canvas.
     * @param {string} color - The color to set as the background.
     * @param {number} [opacity=1] - The opacity of the background color.
    */
    setBackgroundColor(color, opacity = 1) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    /**
     * Draws a rectangle on the canvas and optionally makes it interactive.
     * @param {number} x - The x-coordinate of the rectangle's top-left corner.
     * @param {number} y - The y-coordinate of the rectangle's top-left corner.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     * @param {string} [color='black'] - The color of the rectangle.
     * @param {string} [eventName] - The event name to emit when the rectangle is interacted with.
    */
    drawRectangle(x, y, width, height, color = 'black', eventName) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);

        if (eventName) {
            this.interactiveShapes.push({
                type: 'rectangle',
                x,
                y,
                width,
                height,
                eventName
            });
        }
    }

    /**
     * Draws a circle on the canvas.
     * @param {number} x - The x-coordinate of the circle's center.
     * @param {number} y - The y-coordinate of the circle's center.
     * @param {number} radius - The radius of the circle.
     * @param {string} [color='black'] - The color of the circle.
     * @param {string} [eventName] - The event name to emit when the circle is interacted with.
    */
    drawCircle(x, y, radius, color = 'black', eventName) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();

        if (eventName) {
            this.interactiveShapes.push({
                type: 'circle',
                x,
                y,
                radius,
                eventName
            });
        }
    }

    /**
     * Draws a polygon on the canvas.
     * @param {Array<{x: number, y: number}>} points - An array of objects representing the vertices of the polygon.
     * @param {string} [color='black'] - The fill color of the polygon.
     * @param {boolean} [closePath=true] - Whether to close the path (connect the last point to the first).
     * @param {string} [eventName] - The event name to emit when the polygon is interacted with.
    */
    drawPolygon(points, color = 'black', closePath = true, eventName) {
        if (points.length < 2) return; // Need at least two points to draw a polygon

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }

        if (closePath) {
            this.ctx.closePath();
        }

        this.ctx.fillStyle = color;
        this.ctx.fill();

        if (eventName) {
            this.interactiveShapes.push({
                type: 'polygon',
                points,
                eventName
            });
        }
    }

    /**
     * Draws text on the canvas.
     * @param {string} text - The text to draw.
     * @param {number} x - The x-coordinate of the text.
     * @param {number} y - The y-coordinate of the text.
     * @param {string} [color='black'] - The color of the text.
     * @param {string} [font='16px sans-serif'] - The font style of the text.
     * @param {string} [textAlign='left'] - The horizontal alignment of the text.
     * @param {string} [textBaseline='top'] - The vertical alignment of the text.
     * @param {number} [maxWidth] - The maximum width of the text.
     * @param {number} [maxHeight] - The maximum height of the text.
    */
    drawText(text, x, y, color = 'black', font = '16px sans-serif', textAlign = 'left', textBaseline = 'top', maxWidth, maxHeight) {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = textAlign;
        this.ctx.textBaseline = textBaseline;
        this.ctx.fillText(text, x, y, maxWidth, maxHeight);
    }

    /**
     * Handles mouse move events on the canvas, checking if the mouse is hovering over any interactive shapes.
     * @param {MouseEvent} event - The mousemove event.
    */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        let foundShape = null;

        for (let shape of this.interactiveShapes) {
            if (shape.type === 'rectangle' && isPointInRectangle(mouseX, mouseY, shape)) {
                foundShape = shape;
                break;
            } else if (shape.type === 'circle' && isPointInCircle(mouseX, mouseY, shape)) {
                foundShape = shape;
                break;
            } else if (shape.type === 'polygon' && isPointInPolygon(mouseX, mouseY, shape.points)) {
                foundShape = shape;
                break;
            }
        }

        this.handleHoverState(foundShape, mouseX, mouseY);
    }

    /**
     * Handles the hover state changes and emits the appropriate events.
     * @param {Object|null} foundShape - The shape that is currently hovered, or null if none.
     * @param {number} mouseX - The x-coordinate of the mouse.
     * @param {number} mouseY - The y-coordinate of the mouse.
    */
    handleHoverState(foundShape, mouseX, mouseY) {
        if (foundShape) {
            if (this.hoveredShape !== foundShape) {
                if (this.hoveredShape) {
                    this.emit(this.hoveredShape.eventName, { type: 'mouseleave', x: mouseX, y: mouseY });
                }
                this.hoveredShape = foundShape;
                this.emit(foundShape.eventName, { type: 'mouseenter', x: mouseX, y: mouseY });
            } else {
                this.emit(foundShape.eventName, { type: 'mousemove', x: mouseX, y: mouseY });
            }
        } else if (this.hoveredShape) {
            this.emit(this.hoveredShape.eventName, { type: 'mouseleave', x: mouseX, y: mouseY });
            this.hoveredShape = null;
        }
    }


    /**
     * Handles click events on the canvas, checking if the mouse is clicking on any interactive shapes.
     * @param {MouseEvent} event - The click event.
     * @emits {Object} - The event object with type, x, and y properties.
     * @emits {string} - The event name that was clicked.
    */
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        for (let shape of this.interactiveShapes) {
            if (shape.type === 'rectangle' && isPointInRectangle(clickX, clickY, shape)) {
                this.emit(shape.eventName, { type: 'click', x: clickX, y: clickY });
                break;
            } else if (shape.type === 'circle' && isPointInCircle(clickX, clickY, shape)) {
                this.emit(shape.eventName, { type: 'click', x: clickX, y: clickY });
                break;
            } else if (shape.type === 'polygon' && isPointInPolygon(clickX, clickY, shape.points)) {
                this.emit(shape.eventName, { type: 'click', x: clickX, y: clickY });
                break;
            }
        }
    }


    /**
     * Handles keydown events when the canvas is focused.
     * @param {KeyboardEvent} event - The keydown event.
    */
    handleKeyDown(event) {
        this.emit('keydown', { key: event.key, code: event.code });
    }



    /**
     * Starts the animation loop.
     */
    startAnimation() {
        this.shouldAnimate = true;
        const animate = () => {
            if (!this.shouldAnimate) return;

            this.clearCanvas(); // Clear the canvas for redrawing

            if (this.drawCallback) {
                this.drawCallback(this); // Call the Lua draw function
            }

            this.animationFrameId = requestAnimationFrame(animate);
        };
        this.animationFrameId = requestAnimationFrame(animate);
    }

    /**
     * Stops the animation loop.
     */
    stopAnimation() {
        this.shouldAnimate = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }


    /**
     * destroy the canvas and cleanup resources.
     * @returns {void}
    */
    destroy() {
        this.stopAnimation();
        this.clearCanvas();
        this.remove();
    }



    // More Advanced Drawing Methods

    /**
     * Allows registering custom drawing functions on the canvas element.
     * @param {string} name - The name of the function.
     * @param {Function} fn - The drawing function.
     * @returns {void}
     * @example
     * canvasElement.registerDrawingFunction('drawTriangle', (x, y, size, color) => {
     *      this.ctx.beginPath();
     *      this.ctx.moveTo(x, y);
     *      this.ctx.lineTo(x + size, y);
     *      this.ctx.lineTo(x + size / 2, y - size);
     *      this.ctx.closePath();
     *      this.ctx.fillStyle = color;
     *      this.ctx.fill();
     * });
     */
    registerDrawingFunction(name, fn) {
        if (typeof fn === 'function') {
            this[name] = fn.bind(this);
        }
    }


    /**
     * Draws a custom path on the canvas.
     * @param {Array} commands - An array of drawing commands.
     * @param {Object} [options={}] - Drawing options.
     * @param {string} [options.strokeColor='black'] - The stroke color.
     * @param {string} [options.fillColor=null] - The fill color.
     * @param {number} [options.lineWidth=1] - The line width.
     * @returns {void}
     * @example
     * canvasElement.on_draw((canvas) => {
     *       canvas.clearCanvas();
     *       canvas.setBackgroundColor('white');
     *    
     *       canvas.drawPath([
     *           { type: 'moveTo', points: [50, 50] },
     *           { type: 'lineTo', points: [150, 50] },
     *           { type: 'lineTo', points: [100, 150] },
     *           { type: 'closePath' }
     *       ], { fillColor: 'blue', strokeColor: 'black', lineWidth: 2 });
     *   });
     * 
    */
    drawPath(commands, options = {}) {
        const { strokeColor = 'black', fillColor = null, lineWidth = 1 } = options;

        this.ctx.beginPath();

        commands.forEach(command => {
            const { type, points } = command;
            if (type === 'moveTo') {
                this.ctx.moveTo(...points);
            } else if (type === 'lineTo') {
                this.ctx.lineTo(...points);
            } else if (type === 'bezierCurveTo') {
                this.ctx.bezierCurveTo(...points);
            } else if (type === 'quadraticCurveTo') {
                this.ctx.quadraticCurveTo(...points);
            } else if (type === 'arc') {
                this.ctx.arc(...points);
            }
        });

        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }

        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.stroke();
    }


    /**
     * Draws an image onto the canvas.
     * @param {string|HTMLImageElement} source - The image source URL or HTMLImageElement.
     * @param {number} x - The x-coordinate to draw the image.
     * @param {number} y - The y-coordinate to draw the image.
     * @param {number} [width] - The width to draw the image.
     * @param {number} [height] - The height to draw the image.
     * @returns {void}
     * @example
     * canvasElement.on_draw((canvas) => {
     *      canvas.clearCanvas();
     *      canvas.setBackgroundColor('white');
     *      canvas.drawImage('https://example.com/image.jpg', 50, 50, 100, 100);
     * });
    */
    drawImage(source, x, y, width, height) {
        const img = source instanceof HTMLImageElement ? source : new Image();
        if (!(source instanceof HTMLImageElement)) {
            try {
                isValidResourceURL(source);
            } catch (error) {
                console.error(`Error loading image: ${error}`);
                return;
            }

            img.src = source;
        }

        img.onload = () => {
            if (width && height) {
                this.ctx.drawImage(img, x, y, width, height);
            } else {
                this.ctx.drawImage(img, x, y);
            }
        };
    }


    // Animation

    /**
     * Animates a property of an object.
     * @param {Object} target - The target object.
     * @param {string} property - The property to animate.
     * @param {number} toValue - The value to animate to.
     * @param {number} duration - The duration of the animation in milliseconds.
     * @param {Function} [easingFunction] - The easing function to use.
     * @param {Function} [onComplete] - Callback when the animation is complete.
     * @returns {void}
     * @example
     * canvasElement.on_draw((canvas) => {
     *     canvas.clearCanvas();
     *     canvas.setBackgroundColor('white');
     *     canvas.drawRectangle(50, 50, 100, 100, 'blue');
     *     canvas.animateProperty(rect, 'x', 200, 1000, t => t * t, () => {
     *         console.log('Animation complete');
     *     }); // animate the x property of the rectangle to 200 over 1 second using a quadratic easing function
     * });
    */
    animateProperty(target, property, toValue, duration, easingFunction = t => t, onComplete) {
        const startTime = performance.now();
        const fromValue = target[property];
        const changeInValue = toValue - fromValue;

        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            target[property] = fromValue + changeInValue * easingFunction(progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };

        requestAnimationFrame(animate);
    }


    // Layer Management

    /**
     * Creates a new layer and returns it.
     * @param {string} name - The name of the layer.
     * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }} - The layer object.
    */
    createLayer(name) {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = this.canvas.width;
        offscreenCanvas.height = this.canvas.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        const layer = { canvas: offscreenCanvas, ctx: offscreenCtx };
        this.layers[name] = layer;
        return layer;
    }
}

customElements.define('lua-canvas', LuaCanvasElement);