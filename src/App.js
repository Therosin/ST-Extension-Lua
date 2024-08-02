// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import Context from './Context';
import Lua from './lib/LuaEnv';
import EditScriptsPopup from './components/EditScriptsPopup';
import './main.scss';

function App() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);
    const [settings, setSettings] = useState({
        enableTimers: false,
        enableLocalStorage: false
    });

    useEffect(() => {
        // Retrieve initial settings from Context
        const initialSettings = {
            enableTimers: Context.getSetting('enableTimers'),
            enableLocalStorage: Context.getSetting('enableLocalStorage')
        };
        setSettings(initialSettings);
    }, []);

    function toggleDrawer() {
        setIsDrawerOpen(!isDrawerOpen);
    }

    function handleClick() {
        const context = SillyTavern.getContext();
        const element = document.createElement('div');
        const debouncedListChangeHandler = _.debounce(handleListChange, 500);
        ReactDOM.render(<EditScriptsPopup onListChange={debouncedListChangeHandler} initialList={Context.getGlobalScripts()} />, element);
        context.callPopup(element, 'text', '', { wide: true, large: true });
    }

    function handleReload() {
        Lua.shutdown()
            .then(() => {
                Lua.init()
                    .then(() => {
                        console.log('Extension-Lua: Environment reloaded');
                    })
                    .catch((error) => {
                        throw new Error(`Extension-Lua: Error reloading environment: ${error}`);
                    });
            })
            .catch((error) => {
                console.error('Error reloading global scripts', error);
            });
    }

    function handleDevToggle() {
        if (isDevMode) {
            delete window.Lua;
            console.log('Dev mode disabled');
        } else {
            window.Lua = Lua;
            console.log('Dev mode enabled');
        }
        setIsDevMode(!isDevMode);
    }

    function handleListChange(list) {
        console.log('Saving global scripts', list.map(script => script.name));
        Context.setGlobalScripts(list);
    }

    function handleSettingChange(setting, value) {
        setSettings(prevSettings => ({ ...prevSettings, [setting]: value }));
        Context.setSetting(setting, value);
    }

    return (
        <div className="extension-lua-scripts-settings">
            <div className="inline-drawer">
                <div className="inline-drawer-toggle inline-drawer-header" onClick={toggleDrawer}>
                    <b>Lua Scripts</b>
                    <div className={`inline-drawer-icon fa-solid fa-circle-chevron-${isDrawerOpen ? 'up' : 'down'} down`}></div>
                </div>
                {isDrawerOpen && (
                    <div className="inline-drawer-content">
                        <div className="flex-container extension-lua-scripts-menu">
                            <div onClick={handleClick} className="menu_button menu_button_icon flexGap5" title="Lua Scripts">
                                <i className="fa-solid fa-code"></i>
                                <span>Scripts</span>
                            </div>
                            <div onClick={handleReload} className="menu_button menu_button_icon flexGap5" title="Lua Reload">
                                <i className="fa-solid fa-rotate-right"></i>
                                <span>Reload Runtime</span>
                            </div>
                            <div onClick={handleDevToggle} className="menu_button menu_button_icon flexGap5" title="Toggle Dev Mode">
                                <i className={`fa-solid ${isDevMode ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                                <span>Dev</span>
                            </div>
                        </div>
                        <div className="flex-container extension-lua-scripts-settings-container">
                            <div className="extension-lua-scripts-settings-header">
                                <b>Settings</b><br />
                                <span style={{ fontSize: '0.8em' }}>affects all scripts, reload runtime to apply changes.</span>
                            </div>
                            <div className="extension-lua-scripts-settings-row">
                                <div className="extension-lua-scripts-setting">
                                    <label htmlFor="enableTimers">
                                        <input type="checkbox" id="enableTimers" checked={settings.enableTimers} onChange={(e) => handleSettingChange('enableTimers', e.target.checked)} />
                                        Timers
                                    </label>
                                    <span className="extension-lua-scripts-settings-description">Allow the use of Interval and Timeout functions, use with caution. this can cause performance issues.</span>
                                </div>

                                <div className="extension-lua-scripts-setting">
                                    <label htmlFor="enableLocalStorage">
                                        <input type="checkbox" id="enableLocalStorage" checked={settings.enableLocalStorage} onChange={(e) => handleSettingChange('enableLocalStorage', e.target.checked)} />
                                        Local Storage
                                    </label>
                                    <span className="extension-lua-scripts-settings-description">Allow scripts to persist data between sessions using local storage.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
