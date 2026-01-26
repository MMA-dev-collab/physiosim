import React from 'react'
import './HintModal.css'

/**
 * Modal component that displays contextual hints to students
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {string} props.hint - The hint text to display
 * @param {function} props.onClose - Callback when modal is dismissed
 */
export default function HintModal({ isOpen, hint, onClose }) {
    if (!isOpen || !hint) return null

    return (
        <div className="hint-modal-overlay" onClick={onClose}>
            <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                <div className="hint-modal-header">
                    <div className="hint-modal-icon">💡</div>
                    <h3>Need a hint?</h3>
                </div>
                <div className="hint-modal-content">
                    <p>{hint}</p>
                </div>
                <div className="hint-modal-footer">
                    <button className="btn-primary" onClick={onClose}>
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    )
}
