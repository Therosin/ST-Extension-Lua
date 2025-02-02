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


/**
 * @typedef {Object} LuaFileOptions
 * @property {boolean} [module] - Whether the file should be treated as a module.
 * @property {string} [namespace] - The namespace under which the module should be registered.
 * @property {string[]} [dependencies] - An array of dependencies that must be loaded before this file.
 * @property {string} [initCode] - Additional Lua code to run before the file's main content.
*/

/**
 * Creates a file map based on the given array of lua files.
 * The file map is a Map object where each key represents a file path and the corresponding value is an array of dependencies.
 *
 * @param {Array<string | [string, LuaFileOptions]>} files - Array of file paths or file paths with options
 * @returns {Map<string, string[]>} - filemap.
 */
export function createLuaFileMap(files) {
    const fileMap = new Map();
    files.forEach(file => {
        let filePath, options;
        if (Array.isArray(file)) {
            [filePath, options] = file;
        } else {
            filePath = file;
            options = {};
        }
        fileMap.set(filePath, options.dependencies || []);
    });
    return fileMap;
}


/**
 * Perform topological sort on the given map of lua files and their dependencies.
 * @param {Map<string, string[]>} fileMap - The file map
 * @returns {Array<[string, object]> | null} - Sorted array of file paths and options or null if cyclic dependency is detected
 */
export function topologicalLuaFileSort(fileMap) {
    const sorted = [];
    const visited = new Set();
    const stack = new Set();

    function visit(file) {
        if (stack.has(file)) {
            return false; // Cycle detected
        }
        if (!visited.has(file)) {
            stack.add(file);
            const dependencies = fileMap.get(file) || [];
            for (const dep of dependencies) {
                if (!visit(dep)) {
                    return false; // Cycle detected
                }
            }
            stack.delete(file);
            visited.add(file);
            sorted.push(file);
        }
        return true;
    }

    for (const file of fileMap.keys()) {
        if (!visit(file)) {
            return null; // Cycle detected
        }
    }

    return sorted;
}