import { supabase } from './supabaseClient';
import { calculateMonthsElapsed } from '../utils/dateUtils';

export const loanService = {
    async getAllLoansWithDetails() {
        const { data: loansData, error: loansError } = await supabase
            .from('loans')
            .select('*, users(name, codebtor_id)')
            .order('id', { ascending: true });

        if (loansError) throw loansError;

        const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*');

        if (paymentsError) throw paymentsError;

        const paymentsByLoanId = {};
        if (paymentsData) {
            paymentsData.forEach(payment => {
                if (!paymentsByLoanId[payment.loan_id]) {
                    paymentsByLoanId[payment.loan_id] = [];
                }
                paymentsByLoanId[payment.loan_id].push(payment);
            });
        }

        return loansData.map(loan => {
            const loanPayments = paymentsByLoanId[loan.id] || [];
            let lastPaymentDate = null;
            if (loanPayments.length > 0) {
                lastPaymentDate = loanPayments.reduce((latest, p) => {
                    const d = new Date(p.payment_date);
                    return d > latest ? d : latest;
                }, new Date(0));
            }

            const months = calculateMonthsElapsed(
                loan.created_at,
                loan.status === 'active' ? new Date() : (lastPaymentDate || new Date())
            );

            const interest = loan.amount * (loan.interest_rate / 100) * months;
            const totalToPay = loan.amount + interest;
            const totalPayments = loanPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
            const remaining = Math.max(0, totalToPay - totalPayments);

            return {
                id: loan.id,
                user: loan.users.name,
                codebtor_id: loan.users.codebtor_id,
                created_at: new Date(loan.created_at).toLocaleString(),
                reason: loan.reason,
                total: loan.amount,
                totalWithInterest: totalToPay,
                interest_rate: loan.interest_rate,
                interestValue: interest,
                payments: totalPayments,
                elapsedMonths: months,
                remaining,
                lastPaymentDate: lastPaymentDate ? lastPaymentDate.toLocaleString() : 'No payments yet',
                user_id: loan.user_id,
                is_request: loan.is_request,
                status: loan.status,
                original_created_at: loan.created_at // Keep original for calculations if needed
            };
        });
    },

    async addLoan(loanData) {
        const { error } = await supabase.from('loans').insert([
            {
                user_id: loanData.user_id,
                amount: parseFloat(loanData.amount),
                reason: loanData.reason,
                interest_rate: parseFloat(loanData.interest_rate),
                created_at: loanData.created_at,
                status: 'active',
                is_request: false,
                request_approved: true
            }
        ]);
        if (error) throw error;
    },

    async updateLoanStatus(loanId, status) {
        const { error } = await supabase
            .from('loans')
            .update({ status })
            .eq('id', loanId);
        if (error) throw error;
    },

    async getLoanById(id) {
        const { data, error } = await supabase
            .from('loans')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async getLoansByUserId(userId) {
        const allLoans = await this.getAllLoansWithDetails();
        return allLoans.filter(loan => loan.user_id === userId || loan.codebtor_id === userId);
    }
};
