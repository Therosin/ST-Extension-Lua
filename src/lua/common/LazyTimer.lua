-- Copyright (C) 2024 Theros <https://github.com/therosin>
--
-- This file is part of ST-Extension-Lua.
--
-- ST-Extension-Lua is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- ST-Extension-Lua is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with ST-Extension-Lua.  If not, see <https://www.gnu.org/licenses/>.

---@class LazyTimer
---@field config table timer configuration
---@field instance table timer instance
---@overload fun(config:table):LazyTimer
local LazyTimer = {}
LazyTimer.__index = LazyTimer

LazyTimer.Days = {
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
    Sunday = 7,
}

function LazyTimer:__call(...)
    return self:new(...)
end

--- Create a new LazyTimer instance
---@param config table timer configuration
---@return LazyTimer instance new LazyTimer instance
function LazyTimer:new(config)
    local current_time_ms = os.time() * 1000
    local timer = {
        config = {
            dilation = config.dilation or 1.0,
            time = config.time or 0,
            paused = config.paused or false,
            day = config.day or self:weekdayNumber(os.date("*t").wday),
        },
        instance = {
            time = config.time or 0,
            paused = config.paused or false,
            day = config.day or self:weekdayNumber(os.date("*t").wday),
            last_update_time = current_time_ms,
        }
    }

    ---@diagnostic disable-next-line: param-type-mismatch
    return setmetatable(timer, LazyTimer)
end

--- Convert weekday number to LazyTimer weekday number
---@param wday number|string weekday number from os.date("*t").wday
---@return number weekdayNumber
function LazyTimer:weekdayNumber(wday)
    local adjust_wday = { 2, 3, 4, 5, 6, 7, 1 }
    return adjust_wday[wday]
end

--- Get the name of the weekday
---@param day_number number day number from LazyTimer.Days
---@return string weekday of the weekday
function LazyTimer:weekdayName(day_number)
    for key, value in pairs(self.Days) do
        if value == day_number then
            return key
        end
    end
    return "Unknown"
end

--- Update the timer state based on the elapsed time
function LazyTimer:tick()
    if self.instance.paused then
        return
    end

    local current_time_ms = os.time() * 1000
    local elapsed_real_time = current_time_ms - self.instance.last_update_time
    local elapsed_time = elapsed_real_time * self.config.dilation
    self.instance.time = self.instance.time + elapsed_time
    self.instance.last_update_time = current_time_ms

    local total_days_elapsed = math.floor(self.instance.time / (1000 * 60 * 60 * 24))
    self.instance.day = (self.config.day + total_days_elapsed - 1) % 7 + 1
end

--- Get the current time in various units
---@param unit? string time unit ("ms", "s", "m", "h", "d", "y")
---@return number current time in the specified unit
function LazyTimer:now(unit)
    self:tick()
    local time_in_ms = self.instance.time

    if unit == "s" then
        return math.floor(time_in_ms / 1000)
    elseif unit == "m" then
        return math.floor(time_in_ms / (1000 * 60))
    elseif unit == "h" then
        return math.floor(time_in_ms / (1000 * 60 * 60))
    elseif unit == "d" then
        return math.floor(time_in_ms / (1000 * 60 * 60 * 24))
    elseif unit == "y" then
        return math.floor(time_in_ms / (1000 * 60 * 60 * 24 * 365.25))
    end

    return math.floor(time_in_ms)
end

--- Get the current day of the week
---@param format? string format of the day ("number", "name")
---@return number|string current day of the week in the specified format
function LazyTimer:day(format)
    self:tick()
    if format == "name" then
        return self:weekdayName(self.instance.day)
    end

    return self.instance.day
end

--- Get or set the current time dilation
--- Dilation affects the speed of the timer relative to real time.
--- For example, a dilation of 2.0 makes the timer run twice as fast (1 second of real time equals 2 seconds of timer time),
--- while a dilation of 0.5 makes the timer run half as fast (1 second of real time equals 0.5 seconds of timer time).
--- To calculate the required dilation to simulate a specific time period, use the formula: dilation = simulated_time_period / real_time_period
--- For example, to simulate 1 day in 1 second of real time, use dilation = 86400 (1 day = 86400 seconds).
---@param value number|nil new dilation value (optional)
---@return number current time dilation
function LazyTimer:dilation(value)
    if value then
        self:tick()
        self.config.dilation = value
    end

    return self.config.dilation
end

--- Pause the timer
function LazyTimer:pause()
    self:tick()
    self.instance.paused = true
end

--- Resume the timer
function LazyTimer:resume()
    self.instance.last_update_time = os.time() * 1000
    self.instance.paused = false
end

--- Check if the timer is paused
---@return boolean true if the timer is paused, false otherwise
function LazyTimer:paused()
    return self.instance.paused
end

--- Reset the timer to the initial configuration
function LazyTimer:reset()
    self.instance.time = self.config.time
    self.instance.paused = self.config.paused
    self.instance.day = self.config.day
    self.instance.last_update_time = os.time() * 1000
end

---@diagnostic disable-next-line: param-type-mismatch
return setmetatable(LazyTimer, LazyTimer)

--- Additional Tests ---

-- Function to introduce a cross-platform delay
-- local function sleep(seconds)
--     local command
--     if package.config:sub(1, 1) == '\\' then
--         -- Windows
--         command = string.format("ping -n %d localhost > NUL", seconds + 1)
--     else
--         -- Unix-based systems
--         command = string.format("ping -c %d localhost > /dev/null", seconds)
--     end
--     os.execute(command)
-- end

-- local timer = LazyTimer {
--     dilation = 1.0,
--     time = 0,
--     paused = false,
--     day = LazyTimer.Days.Monday,
-- }

-- -- Initial checks
-- print("Initial time (ms):", timer:now())

-- sleep(1)  -- Delay for 1 second

-- timer:dilation(86400 * 365.25)  -- Set dilation to simulate 1 year in 1 second
-- print("Time after setting dilation to 86400 * 365.25 (ms):", timer:now())

-- sleep(1)  -- Delay for 1 second

-- print("Dilation for 1 year - Current time (ms):", timer:now())
-- print("Dilation for 1 year - Current time (seconds):", timer:now("s"))
-- print("Dilation for 1 year - Current time (minutes):", timer:now("m"))
-- print("Dilation for 1 year - Current time (hours):", timer:now("h"))
-- print("Dilation for 1 year - Current time (days):", timer:now("d"))
-- print("Dilation for 1 year - Current time (years):", timer:now("y"))

-- print("Dilation for 1 year - Current day (number):", timer:day())
-- print("Dilation for 1 year - Current day (name):", timer:day("name"))

-- -- Adding an additional sleep to verify consistency
-- sleep(1)  -- Delay for 1 second

-- print("Dilation for 1 year after additional second - Current time (ms):", timer:now())
-- print("Dilation for 1 year after additional second - Current time (seconds):", timer:now("s"))
-- print("Dilation for 1 year after additional second - Current time (minutes):", timer:now("m"))
-- print("Dilation for 1 year after additional second - Current time (hours):", timer:now("h"))
-- print("Dilation for 1 year after additional second - Current time (days):", timer:now("d"))
-- print("Dilation for 1 year after additional second - Current time (years):", timer:now("y"))

-- print("Dilation for 1 year after additional second - Current day (number):", timer:day())
-- print("Dilation for 1 year after additional second - Current day (name):", timer:day("name"))
