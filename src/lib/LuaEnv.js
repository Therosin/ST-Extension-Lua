// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
import { createLuaBridge } from './LuaBridge';
import Context from '../Context';

/**
 * Custom LuaBridge Environment
 * Use this to modify the lua environment available to ST.
*/


export class LuaEnv {
    constructor() {
        this.Lua = null;
        this.GlobalScripts = [];
    }

    /**
     * Initializes the Lua environment
     * @returns {Promise<void>}
     * @throws {string} If the global scripts cannot be registered
    */
    async init() {
        if (this.Lua == null) {
            this.Lua = await createLuaBridge();
            this.GlobalScripts = Context.getGlobalScripts();
            for (const script of this.GlobalScripts) {
                await this.Lua.loadModule(script.name, script.code);
            }
            
            SetupEnv(this.Lua)
        }
    }

    /**
     * Shuts down the Lua environment
     * @returns {Promise<void>}
     * @throws {string} If Lua is not initialized
    */
    shutdown() {
        return new Promise((resolve, reject) => {
            if (this.Lua == null) reject('Lua is not initialized');
            this.Lua.close();
            this.Lua = null;
            resolve();
        });
    }

    async execute(script, data) {
        if (this.Lua == null) throw new Error('Lua is not initialized');
        return this.Lua.execute(script, data);
    }

    /**
     * Register lua module code with the Lua environment
     * @param {string} name The name of the module
     * @param {string} modulecode The module code
     * @returns {Promise<void>}
     * @throws {string} If Lua is not initialized
     * @throws {string} If the module cannot be registered
    */
    async registerModule(name, modulecode) {
        if (this.Lua == null) throw new Error('Lua is not initialized');
        return await this.Lua.loadModule(name, modulecode);
    }


    /**
     * Register JavaScript function with the Lua environment
     * @param {string} name The name of the function
     * @param {Function} func The function to register
     * @returns {Promise<void>}
     * @throws {string} If Lua is not initialized
     * @throws {string} If the function cannot be registered
    */
    async registerFunction(name, func) {
        if (this.Lua == null) throw new Error('Lua is not initialized');
        return this.Lua.setGlobal(name, func);
    }
}

const SetupEnv = (env) => { // Modify the Lua State Available to ST here
    
    // get js type information. eg: if (type(ctx) == "userdata") and jstype(ctx) == "object" then ... end
    env.setGlobal('jstype', (obj) => typeof obj)
    
    // SillyTavern Interop
    env.setGlobal("SillyTavern",{
        /** Returns ST Context for use in lua. */
        GetContext: () => SillyTavern.getContext(),
    })

}



const Lua = new LuaEnv();
Lua.init()
export default Lua;
