import React, { useState, useEffect } from 'react';
import { loanService } from '../services/loanService';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const LoansDashboard = ({ name, handleLogout }) => {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLoans = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const userLoans = await loanService.getLoansByUserId(user.userId);
            // Filter for active loans only, as per original App.jsx logic for users
            const activeLoans = userLoans.filter(loan => loan.status === 'active');
            setLoans(activeLoans);
        } catch (error) {
            console.error('Error fetching loans:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, [user]);

    const [AllLoans, setAllLoans] = useState(false);

    const handleShowAllLoans = () => {
        setAllLoans(!AllLoans);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Hi, {name}!</h1>
                {loans.length > 0 ? <h2>These are your active loans</h2> : <h2>You have no active loans</h2>}
                <ThemeToggle />
            </div>

            <div>
                <button className="btn-secondary" onClick={handleLogout}>Log out</button>
            </div>

            {loading ? (
                <p>Loading loans...</p>
            ) : loans.length > 0 && (
                <div className="table-container">
                    <table className="loans-table">
                        <thead>
                            <tr>
                                <th className="text-left">Date Obtained</th>
                                <th className="text-center">Status</th>
                                <th className="text-left">Reason</th>
                                <th className="text-center">Amount</th>
                                <th className="text-center">Interest %</th>
                                <th className="text-center">Months Elapsed</th>
                                <th className="text-center">Interest Value</th>
                                <th className="text-center">Total</th>
                                <th className="text-center">Payments</th>
                                <th className="text-center">Last Payment Day</th>
                                <th className="text-center">Remaining to pay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.map((loan) => (
                                <tr key={loan.id}>
                                    <td className="text-left" data-label="Date Obtained">{loan.created_at}</td>
                                    <td className="text-center" data-label="Status">{loan.status}</td>
                                    <td className="text-left" data-label="Reason">{loan.reason}</td>
                                    <td className="text-center font-mono" data-label="Amount">{"$ " + (loan.total).toLocaleString()}</td>
                                    <td className="text-center" data-label="Interest %">{loan.interest_rate + "%"}</td>
                                    <td className="text-center" data-label="Months Elapsed">{loan.elapsedMonths ?? '-'}</td>
                                    <td className="text-center font-mono" data-label="Interest Value">{"$ " + (loan.interestValue ?? 0).toLocaleString()}</td>
                                    <td className="text-center font-mono" data-label="Total">{"$ " + (loan.totalWithInterest ?? 0).toLocaleString()}</td>
                                    <td className="text-center font-mono text-success" data-label="Payments">{"$ " + (loan.payments ?? 0).toLocaleString()}</td>
                                    <td className="text-center" data-label="Last Payment Day">{loan.lastPaymentDate ?? '-'}</td>
                                    {
                                        loan.payments < loan.remaining ?
                                            <td className="text-center font-mono text-danger font-bold" data-label="Remaining">
                                                {"$ " + (loan.remaining ?? 0).toLocaleString()}
                                            </td> :
                                            <td className="text-center font-mono text-success font-bold" data-label="Remaining">
                                                {"$ " + (loan.remaining ?? 0).toLocaleString()}
                                            </td>
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export { LoansDashboard };
