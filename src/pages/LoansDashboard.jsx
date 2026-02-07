import React, { useState, useEffect } from 'react';
import { loanService } from '../services/loanService';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const LoansDashboard = ({ name, handleLogout }) => {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [codebtorLoans, setCodebtorLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLoans = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const userLoans = await loanService.getLoansByUserId(user.userId);
            // Filter for active loans only
            const activeLoans = userLoans.filter(loan => loan.status === 'active');

            const myLoans = activeLoans.filter(loan => loan.user_id === user.userId);
            const guaranteedLoans = activeLoans.filter(loan => loan.codebtor_id === user.userId);

            setLoans(myLoans);
            setCodebtorLoans(guaranteedLoans);
        } catch (error) {
            console.error('Error fetching loans:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, [user]);

    const handlePaymentPSE = () => {
        const url = "https://clientes.nequi.com.co/recargas"; // change for bank url
        window.open(url, "_blank")
    };

    const LoansTable = ({ loansData, title, showEmptyMessage = true }) => {
        if (loansData.length === 0 && !showEmptyMessage) return null;

        if (loansData.length === 0 && showEmptyMessage) {
            return <h2>You have no active loans</h2>;
        }

        return (
            <div className="table-container mb-8">
                {title && <h2 className="mb-4 text-xl font-bold">{title}</h2>}
                <table className="loans-table">
                    <thead>
                        <tr>
                            <th className="text-left">Date Obtained</th>
                            {title ? <th className="text-left bg-blue-100 text-blue-800">Borrower</th> : null}
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
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loansData.map((loan) => (
                            <tr key={loan.id}>
                                <td className="text-left" data-label="Date Obtained">{loan.created_at}</td>
                                {title ? <td className="text-left font-bold text-blue-600" data-label="Borrower">{loan.user}</td> : null}
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
                                <td className="text-center" data-label="Action">
                                    {loan.status === 'active' ? <button className="btn-pay" type="submit" onClick={handlePaymentPSE}>Make a Payment</button> : 'Paid'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Hi, {name}!</h1>
                {/* Main header managed by LoansTable logic if needed, but keeping personal loans message here effectively */}
                {loans.length > 0 ? <h2>These are your active loans</h2> : null}
                <ThemeToggle />
            </div>
            
            <div>
                <button className="btn-secondary" onClick={handleLogout}>Log out</button>
            </div>

            {loading ? (
                <p>Loading loans...</p>
            ) : (
                <>
                    <LoansTable loansData={loans} showEmptyMessage={true} />
                    {codebtorLoans.length > 0 && (
                        <>
                            <hr className="my-8 border-gray-300" />
                            <LoansTable
                                loansData={codebtorLoans}
                                title="Loans you are guaranteeing"
                                showEmptyMessage={false}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export { LoansDashboard };
