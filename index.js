// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
/* global jQuery */
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { executeLuaScript, executeLuaCode, Context, setup } from './dist/main.js';
const MODULE_NAME = 'Extension-Lua';
export { MODULE_NAME };

// ========= Register Slash Commands =========
function registerSlashCommands() {

    /* run global script */
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
        helpString: `
        <h4>Execute a lua globalscript.</h4>
        <br> - Must provide either script or scriptId. (not both) used to find the script to run.
        <br> - script is the name of the script as defined in the globalscripts menu. scriptId is the index of the script.
        <br> - You can provide data to pass to the script, this should be string/number/boolean or you can pass a jsonstring.
        <br> - If json is true, the data will be parsed from json string to a lua table.
        <br> - If the script returns a value, it will be returned, if it returns a table, it will be stringified to jsonstring.
        <br> Examples:
        <ul>
            <li> <code>/lua script="test" data="Hello, World!" json=true</code> </li>
            <li> <code>/lua scriptId=0 data="Hello, World!" json=true</code> </li>
        </ul>
        <br> returned tables will be stringified, this means you can return a table from lua and pipe it directly into a variable and it just works.
        `,
        aliases: ["luascript"],
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'script',
                description: 'Name of the script to run, if not provided, scriptId must be used.',
                typeList: [ARGUMENT_TYPE.STRING],
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
                description: `Optional data to pass to the script. must be a string, if json is true it must be a json string to parse.
                `,
                typeList: [ARGUMENT_TYPE.STRING],
                required: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'json',
                description: 'If true, data will be parsed as json.',
                typeList: [ARGUMENT_TYPE.BOOLEAN],
                required: false,
            }),
        ],
        returns: "a single return value from lua, if a vailable."
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
        helpString: `
        <h4>Execute raw lua code</h4>
        <br> - Provide the lua code to run.
        <br> - You can provide data to pass to the script, this should be string/number/boolean or you can pass a jsonstring.
        <br> - If json is true, the data will be parsed from json string to a lua table.
        <br> - If the script returns a value, it will be returned, if it returns a table, it will be stringified to jsonstring.
        <br> Examples:
        <ul>
            <li> Example: <code>/lua code='print("Hello, World!")'</code> </li>
            <li> Example: <code>/lua code='return "Hello, World!"' | /echo {{pipe}}</code> </li>
        </ul>
        <br> returned tables will be stringified, this means you can return a table from lua and pipe it directly into a variable and it just works.
        `,
        aliases: ["lua"],
        namedArgumentList: [
            SlashCommandNamedArgument.fromProps({
                name: 'code',
                description: 'The lua code to run.',
                typeList: [ARGUMENT_TYPE.STRING],
                required: true,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'data',
                description: `Optional data to pass to the script. must be a string, if json is true it must be a json string to parse.
                `,
                typeList: [ARGUMENT_TYPE.STRING],
                required: false,
            }),
            SlashCommandNamedArgument.fromProps({
                name: 'json',
                description: 'If true, data will be parsed as json.',
                typeList: [ARGUMENT_TYPE.BOOLEAN],
                required: false,
            }),
        ],
        returns: "a single return value from lua, if available."
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
