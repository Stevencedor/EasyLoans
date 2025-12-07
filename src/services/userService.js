import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

export const userService = {
    async getAllUsers() {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return data;
    },

    async addUser(userData) {
        const hashed = await bcrypt.hash(userData.username + new Date().getFullYear().toString() + '!', 10);
        const { error } = await supabase.from('users').insert([
            {
                username: userData.username,
                password_hash: hashed,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                codebtor_id: userData.codebtor || null,
                preferred_language: userData.preferred_language
            }
        ]);
        if (error) throw error;
    },

    async updateUserLanguage(userId, language) {
        const { error } = await supabase
            .from('users')
            .update({ preferredLanguage: language })
            .eq('id', userId);
        if (error) throw error;
    }
};
