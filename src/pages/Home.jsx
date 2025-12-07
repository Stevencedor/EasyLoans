import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '../services/supabaseClient';
import ThemeToggle from '../components/ThemeToggle';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { addToast } = useToast();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoading(true);

        try {
            // Query the user from Supabase
            const { data: users, error: dbError } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .limit(1);

            if (dbError) throw dbError;

            if (!users || users.length === 0) {
                addToast('Incorrect username or password', 'error');
                setLoading(false);
                return;
            }

            const user = users[0];

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                addToast('Incorrect username or password', 'error');
                setLoading(false);
                return;
            }

            // Detect browser language
            const browserLanguage = navigator.language || navigator.userLanguage || 'en';

            // Update user's preferredLanguage if different or not set
            if (user.preferredLanguage !== browserLanguage) {
                await supabase
                    .from('users')
                    .update({ preferredLanguage: browserLanguage })
                    .eq('id', user.id);
            }

            // Successful login
            const isAdmin = user.role === 'admin';
            const requiresPasswordChange = user.is_new_user || user.requires_password_change;

            // Pass user data to parent component
            login({
                username: user.username,
                isAdmin: isAdmin,
                userId: user.id,
                requiresPasswordChange: requiresPasswordChange
            });

        } catch (error) {
            console.error('Error during login:', error);
            addToast('Error logging in: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <ThemeToggle />
            </div>

            <div className="login-header">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏦</div>
                <h1>Welcome to Easy Loans</h1>
                <p>Manage your loans efficiently and securely.</p>
            </div>

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className="login-footer">
                <p>Forgot password? <a href="#" onClick={(e) => { e.preventDefault(); addToast('Contact administrator', 'info'); }}>Recover it</a></p>
            </div>

            <div className="footer-links">
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
                <a href="#">Cookies</a>
            </div>
        </div>
    );
};

export default Home;
