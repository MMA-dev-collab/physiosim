import React from 'react';
import './Modal.css';

const ConfirmationModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => {
            // Close on backdrop click if needed, or keeping it strict
            if (e.target === e.currentTarget) onCancel();
        }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                </div>
                <div className="modal-body">
                    {message}
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-modal btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`btn-modal ${isDanger ? 'btn-danger' : 'btn-confirm'}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
