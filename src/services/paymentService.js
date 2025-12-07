import { supabase } from './supabaseClient';

export const paymentService = {
    async getAllPayments() {
        const { data, error } = await supabase.from('payments').select('*');
        if (error) throw error;
        return data;
    },

    async getPaymentsByLoanId(loanId) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('loan_id', loanId);
        if (error) throw error;
        return data;
    },

    async addPayment(paymentData) {
        const { error } = await supabase
            .from('payments')
            .insert([
                {
                    loan_id: paymentData.loan_id,
                    amount: parseFloat(paymentData.amount),
                    payment_date: paymentData.payment_date
                }
            ]);
        if (error) throw error;
    }
};
