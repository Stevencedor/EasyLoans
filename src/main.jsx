import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';
import Footer from './components/Footer.jsx';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Inicializar tema desde localStorage
const initTheme = () => {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    } else {
        // Detectar preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('appTheme', 'dark');
        }
    }
};

initTheme();

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <ToastProvider>
            <AuthProvider>
                <App />
                <Footer />
            </AuthProvider>
        </ToastProvider>
    </React.StrictMode>
);