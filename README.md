# Extension-Lua
Provides Lua Scripting support for ST

## How to use

After installing the extension, you can find a new section in Extension Settings called `Lua Scripts`. In this section, you can add global scripts and reload the runtime.
Global scripts can be imported by name in any other lua code by using the `require` function. eg:

Global Script Name: `HelloWorld`
```lua
local t = {}
function t.hello(name)
    local message = string.format("Hello, %s!", name or "World")
    print(message)
    return message -- return value is optional, if a table is returned, it will be converted to a json string
end

return t
```
You can either run lua directly using `/lua-run` (alias `/lua`)
```
/lua data="Universe" code="
    local mod = require('HelloWorld')
    return mod.hello(...)
" |
/echo {{pipe}} ||
```
this will print `Hello, Universe!` in the console and echo the same message as a toast.


You can also run specific global scripts using `/lua-script` (alias `/luascript`)
Global Script Name: `HelloWorld`
```lua
local function hello(name)
    local message = string.format("Hello, %s!", name or "World")
    print(message)
    return message
end
return hello(...)
```

You can run the script using the following command: 
```
/luascript script=HelloWorld |
/echo {{pipe}} ||`
```
this will print `Hello, World!` in the console and echo the same message as a toast.
