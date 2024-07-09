// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
import ReactDOM from 'react-dom';
import React, { useState } from 'react';
import _ from 'lodash';
import Context from './Context';
import Lua from './lib/LuaEnv';
import EditScriptsPopup from './components/EditScriptsPopup';
import './main.scss';

const {
    eventSource,
    eventTypes,
} = SillyTavern.getContext();

eventSource.on(eventTypes.CHAT_CHANGED, handleAppEvent);

async function handleAppEvent(args) {
    //const context = SillyTavern.getContext();
    const scripts = args.character?.data?.extensions?.scripts;
    if (Array.isArray(scripts) && scripts.length > 0) {
        // Handle script execution logic here if needed
    }
}

function App() {

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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


    function handleListChange(list) {
        console.log('Saving global scripts', list.map(script => script.name));
        Context.setGlobalScripts(list);
    }

    return (
        <div className="scripts-settings">
            <div className="inline-drawer">
                <div className="inline-drawer-toggle inline-drawer-header" onClick={toggleDrawer}>
                    <b>Lua Scripts</b>
                    <div className={`inline-drawer-icon fa-solid fa-circle-chevron-${isDrawerOpen ? 'up' : 'down'} down`}></div>
                </div>
                {isDrawerOpen && (
                    <div className="inline-drawer-content">
                        <div className="flex-container">
                            <div onClick={handleClick} className="menu_button menu_button_icon flexGap5" title="Lua Scripts">
                                <i className="fa-solid fa-code"></i>
                                <span>Scripts</span>
                            </div>
                            <div onClick={handleReload} className="menu_button menu_button_icon flexGap5" title="Lua Reload">
                                <i className="fa-solid fa-rotate-right"></i>
                                <span>Reload Runtime</span>
                            </div>
                        </div>
                        <hr className="sysHR" />
                    </div>
                )}
            </div>
        </div>
    );
}


export default App;
