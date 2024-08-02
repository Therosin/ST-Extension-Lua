const DomManipulator = (function () {

    function sanitizeString(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    /**
     * Find an element in the DOM
     * @param {string} selector - The selector to search for
     * @returns {Element} - The element found
     * @throws {Error} - If the element is not found
     * @throws {Error} - If the selector is not a string
    */
    function findElement(selector) {
        if (typeof selector !== 'string') throw new Error('Selector must be a string');
        if (document.querySelector(selector) === null) throw new Error('Element not found');
        return document.querySelector(selector);
    }


    /**
     * Creates an element with the specified tag, attributes, and text content.
     * 
     * @param {string} tag - The tag of the element to create.
     * @param {Object} attributes - An object containing the attributes to add to the element.
     * @param {string} textContent - The text content to add to the element.
     * @returns {HTMLElement} - The created element.
     * @throws {Error} - If the attributes parameter is not an object.
     * @throws {Error} - If the tag is not a string.
     * @throws {Error} - If the textContent is not a string.
     * 
     * @example
     * ```js
     * const div = DomManipulator.createElement('div', { id: 'my-div', class: 'container', style: 'color: red' }, 'Hello, World!');
     * document.body.appendChild(div);
    */
    function createElement(tag, attributes = {}, textContent = '') {
        if (typeof attributes !== 'object') throw new Error('Attributes must be an object');
        if (typeof tag !== 'string') throw new Error('Tag must be a string');
        if (typeof textContent !== 'string') throw new Error('Text content must be a string');
        const element = document.createElement(tag);

        for (let key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                element.setAttribute(sanitizeString(key), sanitizeString(attributes[key]));
            }
        }

        if (textContent) {
            element.textContent = sanitizeString(textContent);
        }

        return element;
    }


    /**
     * Modifies an element by adding attributes and text content.
     *
     * @param {HTMLElement} element - The element to modify.
     * @param {Object} attributes - An object containing the attributes to add to the element.
     * @param {string} textContent - The text content to add to the element.
     * @throws {Error} - If the element is not an instance of HTMLElement.
     * @throws {Error} - If the attributes parameter is not an object.
    */
    function modifyElement(element, attributes = {}, textContent = null) {
        for (let key in attributes) {
            if (typeof attributes !== 'object') throw new Error('Attributes must be an object');
            if (!(element instanceof HTMLElement)) throw new Error('Element must be an instance of HTMLElement');
            if (attributes.hasOwnProperty(key)) {
                element.setAttribute(sanitizeString(key), sanitizeString(attributes[key]));
            }
        }

        if (textContent !== null) {
            element.textContent = sanitizeString(textContent);
        }
    }


    /**
     * Adds an event listener to the specified element.
     *
     * @param {HTMLElement} element - The element to attach the event listener to.
     * @param {string} event - The name of the event to listen for.
     * @param {Function} handler - The function to be called when the event is triggered.
     * @throws {Error} - If the element is not an instance of HTMLElement
     * @throws {Error} - If the event is not a string
     * @throws {Error} - If the handler is not a function
    */
    function addEventListener(element, event, handler) {
        if (!(element instanceof HTMLElement)) throw new Error('Element must be an instance of HTMLElement');
        if (typeof event !== 'string') throw new Error('Event must be a string');
        if (typeof handler !== 'function') throw new Error('Handler must be a function');
        element.addEventListener(event, handler);
    }

    /**
     * Create a css string from an object
     * @param {Object} css - The css object to convert
     * @returns {string} - The css string
     * @throws {Error} - If the css parameter is not an object
     * @example
     * ```js
     * const css = DomManipulator.createStyle({ color: 'red', backgroundColor: 'blue' });
     * console.log(css); // 'color: red; background-color: blue;'
     * ```
    */
    function createStyle(css) {
        if (typeof css !== 'object') throw new Error('Css must be an object');
        return Object.keys(css).map(key => `${key}: ${css[key]};`).join(' ');
    }

    return {
        findElement,
        createElement,
        modifyElement,
        addEventListener,
        createStyle
    };
})();

export default DomManipulator;