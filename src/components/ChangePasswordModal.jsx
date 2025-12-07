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
            alert('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
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

            alert('Contraseña actualizada exitosamente');
            onPasswordChanged();
        } catch (error) {
            console.error('Error updating password:', error);
            alert('Error al actualizar contraseña: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Cambiar Contraseña</h3>
                <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
                    Por favor, establece una nueva contraseña para continuar.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nueva Contraseña</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                            placeholder="Repite la contraseña"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                        </button>
                        <button type="button" onClick={onCancel} disabled={loading}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
