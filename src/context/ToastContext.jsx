import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';
import '../components/common/Toast.css';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        info: (msg, duration) => addToast(msg, 'info', duration)
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <Toast
                        key={t.id}
                        {...t}
                        onClose={() => removeToast(t.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
