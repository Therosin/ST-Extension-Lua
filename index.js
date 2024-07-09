// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
/* global jQuery */
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { executeLuaScript, executeLuaCode, Context, setup } from './dist/main.js';
const MODULE_NAME = 'Extension-Lua';
export { MODULE_NAME };

// ========= Register Slash Commands =========
function registerSlashCommands() {

    /* run script for character */
    async function luaScriptSlashCommand(namedArgs, args) {

        let scriptId
        if (namedArgs.script) {
            if (namedArgs.scriptId) throw new Error("Cannot use scriptId with script argument");
            const script = Context.findGlobalScriptByName(namedArgs.script);
            if (!script) throw new Error(`Script not found: ${namedArgs.script}`);
            const { index } = script;
            scriptId = index;
        } else {
            if (!namedArgs.scriptId) throw new Error("No script or scriptId provided");
            scriptId = namedArgs.scriptId;
        }

        let data;
        if (namedArgs.data) {
            if (namedArgs.json) {
                try {
                    data = JSON.parse(namedArgs.data);
                } catch (error) {
                    throw new Error(`Error parsing data as json: ${error} for data: ${namedArgs.data}`);
                }
            } else data = namedArgs.data;
        }

        const context = { data, args }
        const result = await executeLuaScript(scriptId, context);
        if (result === undefined || result === null) return '';
        if (typeof result === 'object') return JSON.stringify(result);
        return result;
    }

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'lua-script',
        callback: luaScriptSlashCommand,
        helpString: `Execute a lua script for a character.\n
        Example:
        \n/lua script="test" data="Hello, World!" json=true
        \n/lua scriptId=0 data="Hello, World!" json=true
        `,
        aliases: ["luascript"],
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'script',
                description: 'Name of the script to run, if not provided, scriptId must be used.',
                type: ARGUMENT_TYPE.STRING,
                required: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'scriptId',
                description: 'Id of the script to run, if not provided, script must be used.',
                typeList: [ARGUMENT_TYPE.STRING, ARGUMENT_TYPE.NUMBER],
                required: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'data',
                description: 'Optional data to pass to the script. must be a string, if json is true, must be a json string to parse.',
                type: ARGUMENT_TYPE.STRING,
                required: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'json',
                description: 'If true, data will be parsed as json.',
                type: ARGUMENT_TYPE.BOOLEAN,
                required: false,
            }),
        ],
    }));

    /* run raw lua code */
    async function luaRunSlashCommand(namedArgs, args) {
        try {
            if (!namedArgs.code) throw new Error("Missing code argument");
            const luaCode = namedArgs.code;
            let data;
            if (namedArgs.data) {
                if (namedArgs.json) {
                    data = JSON.parse(namedArgs.data);
                } else data = namedArgs.data;
            }

            const context = { data, args }
            const result = await executeLuaCode(luaCode, context);
            if (result === undefined || result === null) return '';
            if (typeof result === 'object') return JSON.stringify(result);
            return result;
        } catch (error) {
            throw new Error(`Error running lua code: ${error}`);
        }
    }

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'lua-run',
        callback: luaRunSlashCommand,
        helpString: `Execute raw lua code.
        Example: /lua code='print("Hello, World!")'
        `,
        aliases: ["lua"],
        argumentList: [
            SlashCommandArgument.fromProps({
                name: 'code',
                description: 'The lua code to run.',
                type: ARGUMENT_TYPE.STRING,
                required: true,
            }),
            SlashCommandArgument.fromProps({
                name: 'data',
                description: 'Optional data to pass to the script. must be a string, if json is true, must be a json string to parse.',
                type: ARGUMENT_TYPE.STRING,
                required: false,
            }),
            SlashCommandArgument.fromProps({
                name: 'json',
                description: 'If true, data will be parsed as json.',
                type: ARGUMENT_TYPE.BOOLEAN,
                required: false,
            }),
        ],
    }));

    console.log("Extension-Lua: Registered slash commands");
}

jQuery(function () {
    setup()
        .then(() => {
            registerSlashCommands();
            console.log("Extension-Lua: loaded");
        })
        .catch((error) => {
            console.error("Extension-Lua: Error setting up extension", error);
        });
});
