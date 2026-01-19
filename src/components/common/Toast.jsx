import React, { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay to allow enter animation
        requestAnimationFrame(() => setIsVisible(true));

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    return (
        <div className={`toast toast-${type} ${isVisible ? 'show' : ''}`}>
            <div className="toast-icon">{icons[type]}</div>
            <div className="toast-content">{message}</div>
            <button className="toast-close" onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }}>×</button>
        </div>
    );
};

export default Toast;
