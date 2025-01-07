// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
import { useState } from 'react';

function EditScriptsPopup({ onListChange, initialList }) {
    const [list, setList] = useState(initialList || []);
    const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);

    const handleAdd = () => {
        const newList = [...list, { name: '', code: '' }];
        setList(newList);
        onListChange(newList);
        setSelectedScriptIndex(newList.length - 1); // Select the new script
    };

    const handleDelete = (index) => {
        const newList = list.filter((_, i) => i !== index);
        setList(newList);
        onListChange(newList);
        setSelectedScriptIndex(Math.max(0, selectedScriptIndex - (index <= selectedScriptIndex ? 1 : 0))); // Adjust selection
    };

    const handleNameChange = (event, index) => {
        const newList = [...list];
        newList[index].name = event.target.value;
        setList(newList);
        onListChange(newList);
    };

    const handleCodeChange = (event, index) => {
        const newList = [...list];
        newList[index].code = event.target.value;
        setList(newList);
        onListChange(newList);
    };

    const handleScriptSelect = (index) => {
        setSelectedScriptIndex(index);
    };

    return (
        <div className="flex-container flexFlowColumn extension-lua-scripts-container">
            <div className="flex-container justifySpaceBetween alignItemsCenter extension-lua-scripts-header">
                <h3 className="margin0">Global Scripts</h3>
                <div className="menu_button menu_button_icon" onClick={handleAdd}>
                    <i className="fa-solid fa-plus"></i>
                    <span>Add</span>
                </div>
            </div>
            <hr />
            <div className="extension-lua-scripts-container flex-container">
                <div className="extension-lua-scripts-list" style={{ width: 'auto', minWidth: '150px', padding: '10px' }}>
                    {list.length === 0 && <strong>Click <i className="fa-solid fa-plus"></i> to get started</strong>}
                    {list.map((script, index) => (
                        <div
                            key={index}
                            className={`flex-container extension-lua-scripts-list-script-container ${selectedScriptIndex === index ? 'selected-script' : ''}`}
                        >
                            <div
                                className="flex-container justifySpaceBetween alignItemsCenter extension-lua-scripts-list-script-header"
                                onClick={() => handleScriptSelect(index)}
                            >
                                <i className="fa-solid fa-code"></i>
                                <span>{script.name || `Script ${index + 1}`}</span>
                                <button
                                    className="menu_button menu_button_icon delete_button"
                                    onClick={(event) => {
                                        event.stopPropagation(); // Prevent triggering the selection
                                        handleDelete(index);
                                    }}
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                            <input
                                type="text"
                                value={script.name}
                                onChange={(event) => handleNameChange(event, index)}
                                placeholder="Script Name"
                                className="text_pole extension-lua-scripts-list-script-nameInput"
                                style={{
                                    width: 'calc(100% - 10px)',
                                    padding: '5px',
                                    margin: '5px 0',
                                    boxSizing: 'border-box',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    backgroundColor: '#1e1e1e',
                                    color: '#fff',
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className="extension-lua-scripts-code-editor">
                    {list.length > 0 ? (
                        <textarea
                            value={list[selectedScriptIndex]?.code || ''}
                            onChange={(event) => handleCodeChange(event, selectedScriptIndex)}
                            className="text_pole textarea_compact extension-lua-scripts-list-script-codeInput"
                            placeholder="Script Code"
                            rows="15"
                        />
                    ) : (
                        <p>Select or add a script to start editing.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditScriptsPopup;
