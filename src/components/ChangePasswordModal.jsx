import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '../services/supabaseClient';

const ChangePasswordModal = ({ userId, onPasswordChanged, onCancel }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            
            toast.error('Passwords don\'t match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(newPassword, salt);

            // Update the user's password in Supabase
            const { error } = await supabase
                .from('users')
                .update({
                    password_hash: passwordHash,
                    is_new_user: false,
                    requires_password_change: false,
                    last_password_change: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;

            toast.success('Password updated successfully');
            onPasswordChanged();
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error('Error updating password: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Change Password</h3>
                <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
                    Please set a new password to continue.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                            placeholder="Minimum 6 characters"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                            placeholder="Repeat password"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Change Password'}
                        </button>
                        <button type="button" onClick={onCancel} disabled={loading}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
