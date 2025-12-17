import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../context/ToastContext';

const ChangePasswordModal = ({ userId, onPasswordChanged, onCancel }) => {
    const { addToast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            addToast('Passwords don\'t match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            addToast('Password must be at least 6 characters long', 'error');
            return;
        }

        setLoading(true);

        try {
            // Get current user password hash
            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('password_hash')
                .eq('id', userId)
                .single();

            if (fetchError) throw fetchError;

            // Verify current password
            const isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isCurrentValid) {
                addToast('Incorrect current password', 'error');
                setLoading(false);
                return;
            }

            // Check if new password is same as old
            const isSameAsOld = await bcrypt.compare(newPassword, user.password_hash);
            if (isSameAsOld) {
                
                addToast('New password cannot be the same as the current password', 'error');
                setLoading(false);
                return;
            }

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

            addToast('Password updated successfully', 'success');
            onPasswordChanged();
        } catch (error) {
            console.error('Error updating password:', error);
            addToast('Error updating password: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Change Password</h3>
                <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
                    Please verify your current password and set a new one.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter current password"
                        />
                    </div>
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
