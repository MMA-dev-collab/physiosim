import React, { useState, useEffect } from 'react';
import './Modal.css';

const InputModal = ({
    isOpen,
    title,
    message,
    defaultValue = '',
    onSubmit,
    onCancel,
    submitText = 'Submit',
    placeholder = ''
}) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (isOpen) setValue(defaultValue);
    }, [isOpen, defaultValue]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                </div>
                <div className="modal-body">
                    <p style={{ marginTop: 0 }}>{message}</p>
                    <input
                        type="text"
                        className="form-input"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            marginTop: '0.5rem',
                            boxSizing: 'border-box'
                        }}
                        autoFocus
                    />
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-modal btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn-modal btn-confirm"
                        onClick={() => onSubmit(value)}
                        disabled={!value.trim()}
                    >
                        {submitText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputModal;
