// === Main File ===
import { DrawingFunctions, EventHandlers } from '../utils/canvas-utils';

// === LuaCanvasLayer ===
class LuaCanvasLayer {
    constructor(name, options, index = 0) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = options.width || 300;
        this.canvas.height = options.height || 150;
        this.active = true;
        this.shapes = [];
        this.name = name;
        this.index = index; // Layer index for sorting

        // bind methods
        this.clear = DrawingFunctions.clear.bind(this);
        this.setBackgroundColor = DrawingFunctions.setBackgroundColor.bind(this);
        this.drawRectangle = DrawingFunctions.drawRectangle.bind(this);
        this.drawCircle = DrawingFunctions.drawCircle.bind(this);
        this.drawPolygon = DrawingFunctions.drawPolygon.bind(this);
        this.drawPath = DrawingFunctions.drawPath.bind(this);
        this.drawImage = DrawingFunctions.drawImage.bind(this);
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;

        return this;
    }

    setActive(active) {
        this.active = active;
        return this;
    }

    on_draw(callback) {
        this.drawCallback = callback.bind(this);
        return this;
    }

    executeDraw(deltaTime) {
        if (this.drawCallback) {
            this.clear();
            this.drawCallback(this, deltaTime);
        }
    }
}

// === LuaCanvasElement ===
class LuaCanvasElement extends HTMLElement {
    constructor() {
        super();
        this.layers = [];
        this.currentLayer = null;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 300;
        this.canvas.height = 150;
        this.appendChild(this.canvas);
        this.events = {};
        this.hoveredShape = null;
        this.shouldAnimate = false;
        this.animationFrameId = null;

        // configure the element for keyboard&mouse events
        this.tabIndex = 0;
        this.setAttribute('pointer-events', 'auto'); // Enable pointer events
    }

    connectedCallback() {
        this.createLayer('default', { width: this.canvas.width, height: this.canvas.height }, Infinity); // Default layer with highest index
        this.setCurrentLayer('default');
        this.canvas.addEventListener('pointerenter', () => {
            console.log('Pointer entered canvas');
            this.canvas.focus(); // Ensure the canvas is focused when the pointer enters
        });
        this.canvas.addEventListener('pointerleave', () => {
            console.log('Pointer left canvas');
            this.canvas.blur(); // Ensure the canvas is blurred when the pointer leaves
        });
        this.canvas.addEventListener('pointermove', (event) => EventHandlers.handleMouseMove(event, this));
        this.canvas.addEventListener('click', (event) => EventHandlers.handleClick(event, this));
        this.canvas.addEventListener('keydown', (event) => EventHandlers.handleKeyDown(event, this));
        this.canvas.addEventListener('keyup', (event) => EventHandlers.handleKeyUp(event, this));
        this.canvas.setAttribute('tabindex', '0'); // Enable keyboard focus
        this.focus();
    }

    disconnectedCallback() {
        this.stopAnimation();
        this.canvas.removeEventListener('pointermove', (event) => EventHandlers.handleMouseMove(event, this));
        this.canvas.removeEventListener('click', (event) => EventHandlers.handleClick(event, this));
        this.canvas.removeEventListener('keydown', (event) => EventHandlers.handleKeyDown(event, this));
        this.canvas.removeEventListener('keyup', (event) => EventHandlers.handleKeyUp(event, this));
    }

    createLayer(name, options = { width: this.canvas.width, height: this.canvas.height }, index = 0) {
        const existingLayer = this.layers.find((layer) => layer.name === name);
        if (existingLayer) return existingLayer;

        const layer = new LuaCanvasLayer(name, options, index);
        this.layers.push(layer);
        this.sortLayers();
        return layer;
    }

    getLayer(name) {
        return this.layers.find((layer) => layer.name === name);
    }

    setCurrentLayer(name) {
        const layer = this.getLayer(name);
        if (!layer) throw new Error(`Layer '${name}' does not exist.`);
        this.currentLayer = layer;
        return this;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.layers.forEach((layer) => layer.resize(width, height));
        this.drawLayers();
        return this.currentLayer;
    }

    drawLayers(deltaTime = 0) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.layers.forEach((layer) => {
            if (layer.active) {
                layer.executeDraw(deltaTime);
                this.ctx.drawImage(layer.canvas, 0, 0);
            }
        });
        return this;
    }

    sortLayers() {
        this.layers.sort((a, b) => a.index - b.index);
        return this;
    }

    moveLayerToFront(name) {
        const layer = this.getLayer(name);
        if (layer) {
            layer.index = Math.max(...this.layers.map((l) => l.index)) + 1;
            this.sortLayers();
        }
        return this;
    }

    moveLayerToBack(name) {
        const layer = this.getLayer(name);
        if (layer) {
            layer.index = Math.min(...this.layers.map((l) => l.index)) - 1;
            this.sortLayers();
        }
        return this;
    }

    on_draw(callback) {
        if (!this.currentLayer) throw new Error('No current layer set for drawing.');
        this.currentLayer.on_draw(callback);
        return this;
    }

    on(eventName, callback) {
        if (!this.events[eventName]) this.events[eventName] = [];
        this.events[eventName].push(callback);
        return this;
    }

    emit(eventName, event) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach((callback) => callback(event));
        return this;
    }

    startAnimation() {
        this.shouldAnimate = true;
        const animate = (deltaTime) => {
            if (!this.shouldAnimate) return;
            this.drawLayers(deltaTime);
            this.animationFrameId = requestAnimationFrame(animate);
        };
        this.animationFrameId = requestAnimationFrame(animate);
        return this;
    }

    stopAnimation() {
        this.shouldAnimate = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        return this;
    }
}

customElements.define('lua-canvas', LuaCanvasElement);
