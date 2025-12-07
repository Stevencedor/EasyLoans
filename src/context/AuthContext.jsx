import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { username, isAdmin, userId, requiresPasswordChange }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSession = () => {
            try {
                const session = localStorage.getItem('loanAppSession');
                if (session) {
                    const parsedSession = JSON.parse(session);
                    if (parsedSession.isLoggedIn) {
                        setUser({
                            username: parsedSession.currentUser,
                            isAdmin: parsedSession.isAdmin,
                            userId: parsedSession.userId,
                            requiresPasswordChange: parsedSession.requiresPasswordChange
                        });
                    }
                }
            } catch (e) {
                console.error('Error loading session:', e);
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, []);

    const login = (userData) => {
        // userData: { username, isAdmin, userId, requiresPasswordChange }
        const sessionData = {
            isLoggedIn: true,
            currentUser: userData.username,
            isAdmin: userData.isAdmin,
            userId: userData.userId,
            requiresPasswordChange: userData.requiresPasswordChange
        };

        localStorage.setItem('loanAppSession', JSON.stringify(sessionData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('loanAppSession');
        setUser(null);
    };

    const updatePasswordChangeStatus = (status) => {
        if (user) {
            const updatedUser = { ...user, requiresPasswordChange: status };
            setUser(updatedUser);

            // Update localStorage as well
            const session = localStorage.getItem('loanAppSession');
            if (session) {
                const parsedSession = JSON.parse(session);
                parsedSession.requiresPasswordChange = status;
                localStorage.setItem('loanAppSession', JSON.stringify(parsedSession));
            }
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        updatePasswordChangeStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
