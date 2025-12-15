import React, { useState, useEffect } from 'react';
import { loanService } from '../services/loanService';
import { userService } from '../services/userService';
import { paymentService } from '../services/paymentService';
import ThemeToggle from '../components/ThemeToggle';
import { calculateMonthsElapsed } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';

const LoansDashboardAdmin = ({ name, handleLogout }) => {
    const { addToast } = useToast();
    const [loans, setLoans] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddingLoan, setIsAddingLoan] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [isAddingPayment, setIsAddingPayment] = useState(false);
    const [selectedLoanId, setSelectedLoanId] = useState(null);
    const [selectedLoanData, setSelectedLoanData] = useState(null);
    const [paymentPreview, setPaymentPreview] = useState(null);

    const [newPayment, setNewPayment] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [newLoan, setNewLoan] = useState({
        user_id: '',
        created_at: new Date().toISOString(), //current date time
        amount: '',
        reason: 'No reason',
        interest_rate: 7
    });
    const [newUser, setNewUser] = useState({
        username: '',
        password_hash: '',
        name: '',
        email: '',
        phone: '',
        preferred_language: 'es'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [loansData, usersData] = await Promise.all([
                loanService.getAllLoansWithDetails(),
                userService.getAllUsers()
            ]);
            setLoans(loansData);
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching data:', error);
            addToast('Error loading data: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddUserClick = () => {
        setIsAddingUser(true);
    };

    const handleCancelAddUser = () => {
        setIsAddingUser(false);
        setNewUser({ username: '', password_hash: '', name: '', email: '', phone: '', preferred_language: 'es' });
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            await userService.addUser(newUser);

            addToast('User added successfully!', 'success');
            setIsAddingUser(false);
            setNewUser({ username: '', password_hash: '', name: '', email: '', phone: '', preferred_language: 'es' });
            fetchData();
        } catch (error) {
            console.error('Error adding user:', error);
            addToast('Error adding user: ' + error.message, 'error');
        }
    };

    const handleAddLoanClick = () => {
        setIsAddingLoan(true);
    };

    const handleCancelAddLoan = () => {
        setIsAddingLoan(false);
        setNewLoan({ user_id: '', amount: '', reason: 'No reason', interest_rate: 7 });
    };

    const handleSaveLoan = async (e) => {
        e.preventDefault();
        try {
            await loanService.addLoan(newLoan);

            addToast('Loan added successfully!', 'success');
            setIsAddingLoan(false);
            setNewLoan({ user_id: '', amount: '', reason: 'No reason', interest_rate: 7 });
            fetchData();
        } catch (error) {
            console.error('Error adding loan:', error);
            addToast('Error adding loan: ' + error.message, 'error');
        }
    };

    const handlePaymentClick = async (loanId) => {
        try {
            // Get loan details
            const loanData = await loanService.getLoanById(loanId);

            // Get payments related to the loan
            const paymentsData = await paymentService.getPaymentsByLoanId(loanId);

            // Add payments to the loan object
            loanData.payments = paymentsData || [];

            setSelectedLoanId(loanId);
            setSelectedLoanData(loanData);
            setIsAddingPayment(true);
            setNewPayment({
                amount: '',
                date: new Date().toISOString().split('T')[0]
            });
            setPaymentPreview(null);
        } catch (error) {
            console.error('Error loading loan:', error);
            addToast('Error loading loan: ' + error.message, 'error');
        }
    }

    const handleCancelPayment = () => {
        setIsAddingPayment(false);
        setSelectedLoanId(null);
        setSelectedLoanData(null);
        setPaymentPreview(null);
        setNewPayment({ amount: '', date: new Date().toISOString().split('T')[0] });
    }

    // Calculate payment preview in real-time
    const calculatePaymentPreview = (paymentDate, paymentAmount) => {
        if (!selectedLoanData || !paymentDate) return null;

        try {
            const monthsUntilPayment = calculateMonthsElapsed(selectedLoanData.created_at, paymentDate);
            const interestAtPayment = selectedLoanData.amount * (selectedLoanData.interest_rate / 100) * monthsUntilPayment;
            const totalWithInterest = selectedLoanData.amount + interestAtPayment;

            // Get previous payments: selectedLoanData includes payment_data if it exists
            const previousPayments = selectedLoanData.payments || [];
            const totalPreviousPayments = previousPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            const remainingBeforePayment = totalWithInterest - totalPreviousPayments;
            const paymentAmountNum = parseFloat(paymentAmount) || 0;
            const remainingAfterPayment = remainingBeforePayment - paymentAmountNum;
            const willBePaidOff = paymentAmountNum >= remainingBeforePayment;

            return {
                monthsUntilPayment,
                interestAtPayment,
                totalWithInterest,
                totalPreviousPayments,
                remainingBeforePayment,
                remainingAfterPayment,
                willBePaidOff
            };
        } catch (error) {
            console.error('Error calculating preview:', error);
            return null;
        }
    };

    // Update preview when date or amount changes
    React.useEffect(() => {
        if (isAddingPayment && selectedLoanData && (newPayment.date || newPayment.amount)) {
            const preview = calculatePaymentPreview(newPayment.date, newPayment.amount);
            setPaymentPreview(preview);
        }
    }, [newPayment.date, newPayment.amount, isAddingPayment, selectedLoanData]);

    const handleSavePayment = async (e) => {
        e.preventDefault();
        if (!selectedLoanId || !newPayment.amount || !newPayment.date) {
            addToast('Please complete all fields', 'warning');
            return;
        }

        if (!paymentPreview) {
            addToast('Error calculating payment. Please try again.', 'error');
            return;
        }

        try {
            // Insert new payment into payments table
            await paymentService.addPayment({
                loan_id: selectedLoanId,
                amount: newPayment.amount,
                payment_date: newPayment.date
            });

            // Determine the new loan status if fully paid
            const newStatus = paymentPreview.willBePaidOff ? 'paid' : 'active';

            // Update loan status if necessary
            if (paymentPreview.willBePaidOff) {
                await loanService.updateLoanStatus(selectedLoanId, newStatus);
            }

            const message = paymentPreview.willBePaidOff
                ? 'Payment registered successfully! The loan has been fully paid.'
                : 'Payment registered successfully!';

            addToast(message, 'success');
            handleCancelPayment();
            fetchData();
        } catch (error) {
            console.error('Error saving payment:', error);
            addToast('Error registering payment: ' + error.message, 'error');
        }
    };

    if (loading) {
        return <div className="dashboard-container"><p>Loading dashboard...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Hi, {name}!</h1>
                <h2>Loans</h2>
                <ThemeToggle />
            </div>

            <div>
                <button className="btn-secondary" onClick={handleLogout}>Log out</button>
                <button className="btn-primary" onClick={handleAddLoanClick}>Add Loan</button>
                <button className="btn-primary" onClick={handleAddUserClick}>Add User</button>
            </div>

            {isAddingLoan && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Add New Loan</h3>
                        <form onSubmit={handleSaveLoan}>
                            <div className="form-group">
                                <label>User</label>
                                <select
                                    value={newLoan.user_id}
                                    onChange={(e) => setNewLoan({ ...newLoan, user_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select User</option>
                                    {users
                                        .filter(u => u.role !== 'admin')
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="datetime-local"
                                    value={newLoan.created_at}
                                    onChange={(e) => setNewLoan({ ...newLoan, created_at: e.target.value })}
                                    required
                                    min={`${new Date().getFullYear()}-01-01T00:00`} // it can not be less than current year
                                />
                            </div>
                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    value={newLoan.amount}
                                    onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                                    required
                                    min="1000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <input
                                    type="text"
                                    value={newLoan.reason}
                                    onChange={(e) => setNewLoan({ ...newLoan, reason: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Interest Rate (%)</label>
                                <input
                                    type="number"
                                    value={newLoan.interest_rate}
                                    onChange={(e) => setNewLoan({ ...newLoan, interest_rate: e.target.value })}
                                    required
                                    min="0"
                                    max="50"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit">Save</button>
                                <button type="button" onClick={handleCancelAddLoan}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAddingUser && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Add New User</h3>
                        <form onSubmit={handleSaveUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Codebtor</label>
                                <select
                                    value={newUser.codebtor || ''}
                                    onChange={(e) => setNewUser({ ...newUser, codebtor: e.target.value })}
                                >
                                    <option value="">Select Codebtor</option>
                                    {users
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .filter(u => u.role !== 'admin')
                                        .map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Language</label>
                                <select
                                    value={newUser.preferred_language}
                                    onChange={(e) => setNewUser({ ...newUser, preferred_language: e.target.value })}
                                    required
                                >
                                    <option value="">Select Language</option>
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit">Save</button>
                                <button type="button" onClick={handleCancelAddUser}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAddingPayment && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Add Payment</h3>
                        <form onSubmit={handleSavePayment}>
                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    value={newPayment.amount}
                                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                                    required
                                    min="10000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Payment Date</label>
                                <input
                                    type="datetime-local" // keep datetime format
                                    value={newPayment.date}
                                    onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                                    required
                                    min={selectedLoanData?.created_at ? new Date(selectedLoanData.created_at).toISOString().split('T')[0] : ''}
                                />
                            </div>

                            {paymentPreview && (
                                <div style={{
                                    backgroundColor: '#f0f9ff',
                                    padding: '1rem',
                                    marginTop: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #0ea5e9'
                                }}>
                                    <h4 style={{ marginTop: 0, color: '#0369a1' }}>Payment Preview</h4>
                                    <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                        <p><strong>Months elapsed at payment:</strong> {paymentPreview.monthsUntilPayment}</p>
                                        <p><strong>Interest at payment date:</strong> $ {paymentPreview.interestAtPayment.toLocaleString()}</p>
                                        <p><strong>Total with interest:</strong> $ {paymentPreview.totalWithInterest.toLocaleString()}</p>
                                        <p><strong>Previous payments:</strong> $ {paymentPreview.totalPreviousPayments.toLocaleString()}</p>
                                        <p><strong>Remaining before payment:</strong> $ {paymentPreview.remainingBeforePayment.toLocaleString()}</p>
                                        <p><strong>Remaining after payment:</strong> $ {paymentPreview.remainingAfterPayment.toLocaleString()}</p>
                                        {paymentPreview.willBePaidOff && (
                                            <p style={{ color: '#16a34a', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                                ✓ This payment will fully pay off the loan!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="submit" >Submit Payment</button>
                                <button type="button" onClick={handleCancelPayment}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="table-container">
                <table className="loans-table">
                    <thead>
                        <tr>
                            <th className="text-left">ID</th>
                            <th className="text-left">User</th>
                            <th className="text-left">Date Obtained</th>
                            <th className="text-left">Reason</th>
                            <th className="text-right">Amount</th>
                            <th className="text-center">Interest %</th>
                            <th className="text-center">Months Elapsed</th>
                            <th className="text-right">Interest Value</th>
                            <th className="text-right">Total</th>
                            <th className="text-right">Payments</th>
                            <th className="text-center">Last Payment Day</th>
                            <th className="text-right">Remaining</th>
                            <th className='text-center'>Action</th>
                            {/*<th className="text-center">Request</th>*/ /*future implementation */}
                        </tr>
                    </thead>
                    <tbody>
                        {loans.sort((a, b) => a.id - b.id).map((loan) => (
                            <tr key={loan.id}>
                                <td className="text-left" data-label="ID">{loan.id}</td>
                                <td className="text-left" data-label="User">{loan.user}</td>
                                <td className="text-left" data-label="Date Obtained">{loan.created_at}</td>
                                <td className="text-left" data-label="Reason">{loan.reason}</td>
                                <td className="text-right font-mono" data-label="Amount">{"$ " + loan.total.toLocaleString()}</td>
                                <td className="text-center" data-label="Interest %">{loan.interest_rate + "%"}</td>
                                <td className="text-center" data-label="Months Elapsed">{Number.isFinite(loan?.elapsedMonths) ? loan.elapsedMonths : "-"}</td>
                                <td className="text-right font-mono" data-label="Interest Value">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(loan?.interestValue) || 0)}</td>
                                <td className="text-right font-mono" data-label="Total to Pay">{"$ " + loan.totalWithInterest.toLocaleString()}</td>
                                <td className="text-right font-mono text-success" data-label="Payments">{"$ " + loan.payments.toLocaleString()}</td>
                                <td className="text-center" data-label="Last Payment Day">{loan.lastPaymentDate}</td>
                                {loan.status === 'active' ?
                                    <td className="text-right font-mono text-danger font-bold" data-label="Remaining">
                                        {"$" + (loan.totalWithInterest - loan.payments).toLocaleString()}
                                    </td> :
                                    <td className="text-right font-mono text-success font-bold" data-label="Remaining">{"$0"}</td>}
                                <td className="text-center" data-label="Action">
                                    {loan.status === 'active' ? <button className="btn-pay" type="submit" onClick={() => handlePaymentClick(loan.id)}>Make a Payment</button> : 'Paid'}
                                </td>
                                {/*<td className="text-center">
                                        {loan.is_request == true ? (<><button type="submit" onClick={() => handleApproveRequest(loan.id)}>Approve</button> <button type="submit" onClick={() => handleRejectRequest(loan.id)}>Reject</button></>) : 'Non-request'}
                                    </td>*/ /*future implementation */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export { LoansDashboardAdmin };