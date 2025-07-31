import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';

function GlobalScriptsPopup({ onListChange, initialList }) {
  const [list, setList] = useState(initialList || []);
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
  const [unsavedCode, setUnsavedCode] = useState(list[0]?.code || '');

  // Keep unsavedCode in sync when switching scripts
  useEffect(() => {
    setUnsavedCode(list[selectedScriptIndex]?.code || '');
  }, [selectedScriptIndex, list]);

  // Save button handler
  const handleSave = () => {
    const newList = [...list];
    newList[selectedScriptIndex].code = unsavedCode;
    setList(newList);
    onListChange?.(newList);
  };

  // Add new script
  const handleAdd = () => {
    const newList = [...list, { name: '', code: '' }];
    setList(newList);
    setSelectedScriptIndex(newList.length - 1);
    setUnsavedCode('');
    onListChange?.(newList);
  };

  // Delete script
  const handleDelete = (index) => {
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
    const newIndex = Math.max(0, selectedScriptIndex === index ? 0 : selectedScriptIndex > index ? selectedScriptIndex - 1 : selectedScriptIndex);
    setSelectedScriptIndex(newIndex);
    setUnsavedCode(newList[newIndex]?.code || '');
    onListChange?.(newList);
  };

  // Change script name
  const handleNameChange = (e, idx) => {
    const newList = [...list];
    newList[idx].name = e.target.value;
    setList(newList);
    onListChange?.(newList);
  };

  // Select a script for editing
  const handleScriptSelect = (idx) => {
    setSelectedScriptIndex(idx);
    setUnsavedCode(list[idx]?.code || '');
  };

  return (
    <>
      <div className="globalscripts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Global Scripts</h3>
        <button onClick={handleAdd}>Add Script</button>
      </div>
      <hr />
      <div className="globalscripts-container">
        <div className="globalscripts-list">
          {list.length === 0 && <strong>Click Add to get started</strong>}
          {list.map((script, idx) => (
            <div
              key={idx}
              className={`globalscripts-list-script-container${selectedScriptIndex === idx ? ' selected-script' : ''}`}
              onClick={() => handleScriptSelect(idx)}
            >
              <div className="globalscripts-list-script-header">
                <span style={{ flex: 1 }}>{script.name || `Script ${idx + 1}`}</span>
                <button
                  style={{
                    marginLeft: 8,
                    background: 'none',
                    border: 'none',
                    color: '#ccc',
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(idx);
                  }}
                  title="Delete"
                >
                  🗑
                </button>
              </div>
              <input
                className="globalscripts-list-script-nameInput"
                type="text"
                value={script.name}
                onChange={e => handleNameChange(e, idx)}
                placeholder="Script Name"
                onClick={e => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
        <div className="globalscripts-code-editor">
          {list.length > 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CodeMirror
                value={unsavedCode}
                height="100%"
                minHeight="300px"
                maxHeight="400px"
                extensions={[loadLanguage('lua')]}
                theme="dark"
                basicSetup={true}
                onChange={setUnsavedCode}
                style={{
                  fontSize: '16px',
                  borderRadius: '6px',
                  flex: 1,
                  border: '1px solid #333',
                  background: '#1e1e1e',
                  color: '#fff',
                }}
                options={{
                  lineNumbers: true,
                  tabSize: 2,
                  indentWithTabs: false,
                }}
              />
              <button
                onClick={handleSave}
                style={{
                  marginTop: '10px',
                  alignSelf: 'flex-end',
                  padding: '6px 18px',
                  fontSize: '15px',
                  borderRadius: '4px',
                  background: '#2c7',
                  color: '#222',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px #0002'
                }}
                title="Save changes to this script"
              >
                Save
              </button>
            </div>
          ) : (
            <div style={{ padding: 16 }}>Select or add a script to start editing.</div>
          )}
        </div>
      </div>
    </>
  );
}

export default GlobalScriptsPopup;
