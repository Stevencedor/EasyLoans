import React from 'react';
import Home from './pages/Home';
import { LoansDashboard } from './pages/LoansDashboard';
import { LoansDashboardAdmin } from './pages/LoansDashboardAdmin';
import ChangePasswordModal from './components/ChangePasswordModal';
import { useAuth } from './context/AuthContext';

const App = () => {
    const { user, logout, updatePasswordChangeStatus } = useAuth();

    const handlePasswordChanged = () => {
        updatePasswordChangeStatus(false);
    };

    const handleCancelPasswordChange = () => {
        // Force logout if user cancels mandatory password change
        alert('You must change your password to continue');
        logout();
    };

    return (
        <div className="app-container">
            {!user ? (
                <Home />
            ) : user.requiresPasswordChange ? (
                <ChangePasswordModal
                    userId={user.userId}
                    onPasswordChanged={handlePasswordChanged}
                    onCancel={handleCancelPasswordChange}
                />
            ) : user.isAdmin ? (
                <LoansDashboardAdmin
                    name="Admin"
                    handleLogout={logout}
                />
            ) : (
                <LoansDashboard
                    name={user.username}
                    handleLogout={logout}
                />
            )}
        </div>
    );
};

export default App;
