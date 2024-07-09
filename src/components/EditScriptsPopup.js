// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
import { useState } from 'react';

function EditScriptsPopup({ onListChange, initialList }) {
    const [list, setList] = useState(initialList || []);

    const handleAdd = () => {
        const newList = [...list, { name: '', code: '' }];
        setList(newList);
        onListChange(newList);
    };

    const handleDelete = (index) => {
        const newList = list.filter((_, i) => i !== index);
        setList(newList);
        onListChange(newList);
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
            <div className="extension-lua-scripts-list">
                {list.length === 0 && <strong>Click <i className="fa-solid fa-plus"></i> to get started</strong>}
                {list.map((script, index) => (
                    <div key={index}>
                        <div className="flex-container justifySpaceBetween extension-lua-scripts-list-script-container">
                            <div className="flex-container alignItemsCenter extension-lua-scripts-list-script-header">
                                <i className="fa-solid fa-code"></i>
                                <span>Script {index + 1}</span>
                            </div>
                            <div className="menu_button menu_button_icon" onClick={() => handleDelete(index)}>
                                <i className="fa-solid fa-trash"></i>
                                <span>Delete</span>
                            </div>
                        </div>
                        <input type="text" value={script.name} onChange={(event) => handleNameChange(event, index)} placeholder="Script Name" className="text_pole extension-lua-scripts-list-script-nameInput" />
                        <textarea value={script.code} onChange={(event) => handleCodeChange(event, index)} className="text_pole textarea_compact extension-lua-scripts-list-script-codeInput" placeholder="Script Code" rows="15" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EditScriptsPopup;
