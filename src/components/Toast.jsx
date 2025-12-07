import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return 'var(--success-500)';
            case 'error': return 'var(--danger-500)';
            case 'warning': return 'var(--warning-500)';
            default: return 'var(--info-500)';
        }
    };

    const styles = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: getBackgroundColor(),
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '300px',
        fontSize: '0.95rem',
        fontWeight: '500'
    };

    return (
        <div style={styles}>
            <span>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '0 0 0 10px',
                    fontSize: '1.2rem',
                    lineHeight: 1
                }}
            >
                &times;
            </button>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Toast;
