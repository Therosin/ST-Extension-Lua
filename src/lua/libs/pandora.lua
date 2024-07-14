-- Copyright 2019-2020 Pablo Blanco Celdrán
--
-- Permission is hereby granted, free of charge, to any person obtaining a copy 
-- of this software and associated documentation files (the "Software"), to deal 
-- in the Software without restriction, including without limitation the rights 
-- to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
-- copies of the Software, and to permit persons to whom the Software is 
-- furnished to do so, subject to the following conditions:
--
-- The above copyright notice and this permission notice shall be included in 
-- all copies or substantial portions of the Software.
--
-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
-- IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
-- FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
-- AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
-- LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
-- OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
-- SOFTWARE.

---
-- Clones the table
---
local function clone(value)
    if type(value) ~= 'table' then return value end
    local tbl = {}
    for k, v in pairs(value) do
      tbl[k] = clone(v)
    end
    return tbl
  end
  
  ---
  -- Extension symbol
  ---
  local extends = {}
  
  ---
  -- Builds the class prototype.
  ---
  local function class(name)
    return function(def)
      local Class = {}
      Class.__name__ = name
      local defaultValues = {}
      local base = nil
      for name, value in pairs(def) do
        if type(name) == 'table' and name.static then
          Class[name.static or name] = value
        elseif name == extends then
          base = value
        elseif type(value) == 'function' then
          Class[name] = value
        elseif type(name) == 'string' then
          defaultValues[name] = value
        end
      end
      Class.__constructor__ = Class[name]
      local ctor = Class[name]
      Class[name] = nil
      Class.__index = Class
      if base then
        Class.super = function(this, ...)
          base.__constructor__(this, ...)
        end
        return setmetatable(Class, {
          __index = base,
          __call = function(_, ...)
            local self = setmetatable(clone(defaultValues), Class)
            ctor(self, ...)
            return self
          end
        })
      else
        return setmetatable(Class, {
          __call = function(_, ...)
            local self = setmetatable(clone(defaultValues), Class)
            ctor(self, ...)
            return self
          end
        })
      end
    end
  end
  
  ---
  -- Marks the field to not be added to the new instances but to the class itself.
  ---
  local function static(name)
    return { static = true, name = name }
  end
  
  local operators = {
    ['=='] = '__eq',
    ['<'] = '__lt',
    ['<='] = '__le',
    ['..'] = '__concat',
    ['%'] = '__mod',
    ['/'] = '__div',
    ['*'] = '__mul',
    ['-'] = '__sub',
    ['(-)'] = '__unm',
    ['+'] = '__add',
    ['^'] = '__pow',
    ['()'] = '__call',
    ['string'] = '__tostring',
    ['='] = '__newindex',
    ['[]'] = '__index',
    ['&'] = '__band',
    ['|'] = '__bor',
    ['~'] = '__bxor',
    ['!'] = '__bnot',
    ['<<'] = '__shl',
    ['>>'] = '__shr',
    ['//'] = '__idiv',
    ['#'] = '__len'
  }
  
  ---
  -- Operator overload sugar translator
  ---
  local function operator(symbol)
    return operators[symbol] or symbol
  end
  
  return {
    class = class,
    operator = operator,
    static = static,
    extends = extends
  }