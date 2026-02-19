import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { FaSearch, FaPrint, FaPlus, FaMoneyBillWave, FaHistory, FaFileInvoiceDollar, FaCreditCard } from 'react-icons/fa';

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ totalCollected: 0, totalDueRecorded: 0 });
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null); // For receipt

    // Filters
    const [studentId, setStudentId] = useState('');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        paymentType: 'Monthly Fee',
        year: new Date().getFullYear(),
        month: 'January',
        status: 'Paid'
    });

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Payment-Receipt',
    });

    const user = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchPayments();
        fetchStats();
        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            let query = `?pageNumber=1`;
            if (studentId) query += `&studentId=${studentId}`;
            if (year) query += `&year=${year}`;
            if (month) query += `&month=${month}`;

            const { data } = await axios.get(`http://localhost:5000/api/payments${query}`, config);
            setPayments(data.payments);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/payments/stats', config);
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPayments();
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/payments', formData, config);
            setShowModal(false);
            fetchPayments();
            fetchStats();
            setFormData({ ...formData, studentId: '', amount: '' });
            alert('Payment recorded successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error recording payment');
        }
    };

    const handleRazorpayPayment = async (e) => {
        e.preventDefault();
        if (!formData.studentId || !formData.amount) {
            alert('Please fill in Student ID and Amount');
            return;
        }

        try {
            // 1. Create Order
            const { data: order } = await axios.post('http://localhost:5000/api/payments/order', {
                amount: formData.amount,
                receipt: `REC-${Date.now()}`
            }, config);

            // 2. Initialize Razorpay Options
            const options = {
                key: "rzp_test_SHvyg3w2dN78OH", // Enter the Key ID generated from the Dashboard
                amount: order.amount,
                currency: order.currency,
                name: "EduOne School",
                description: `${formData.paymentType} - ${formData.month} ${formData.year}`,
                image: "https://via.placeholder.com/150",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await axios.post('http://localhost:5000/api/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            paymentData: formData // Pass form data to save on success
                        }, config);

                        setShowModal(false);
                        fetchPayments();
                        fetchStats();
                        setFormData({ ...formData, studentId: '', amount: '' });
                        alert('Payment Successful!');
                    } catch (error) {
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: "Student Name", // Could fetch student name here
                    email: "student@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp1.open();
        } catch (error) {
            console.error(error);
            alert('Error initiating Razorpay payment');
        }
    };

    const openReceipt = (payment) => {
        setSelectedPayment(payment);
        setTimeout(() => {
            handlePrint();
        }, 500);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <FaMoneyBillWave className="mr-2 text-green-600" /> Payment Managment
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Collected</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">${stats.totalCollected}</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                            <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-xl" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Due Recorded</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">${stats.totalDueRecorded}</p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                            <FaFileInvoiceDollar className="text-red-600 dark:text-red-400 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Student ID..."
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"><FaSearch /></button>
                </form>
                <button onClick={() => setShowModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
                    <FaPlus className="mr-2" /> Add Payment
                </button>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Receipt No</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Student</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Type</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Date</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Amount</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Status</th>
                                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-300">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? <tr><td colSpan="7" className="p-4 text-center dark:text-white">Loading...</td></tr> :
                                payments.map(payment => (
                                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="p-4 text-sm font-mono dark:text-gray-300">{payment.receiptNo}</td>
                                        <td className="p-4 dark:text-white">
                                            <div className="font-medium">{payment.student?.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{payment.student?.studentId}</div>
                                        </td>
                                        <td className="p-4 dark:text-gray-300">{payment.paymentType} <span className="text-xs text-gray-500">({payment.month} {payment.year})</span></td>
                                        <td className="p-4 dark:text-gray-300">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold dark:text-white">${payment.amount}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${payment.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => openReceipt(payment)} className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400">
                                                <FaPrint />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Record New Payment</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1 dark:text-gray-300">Student ID</label>
                                <input type="text" required className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 dark:text-gray-300">Type</label>
                                    <select className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.paymentType} onChange={e => setFormData({ ...formData, paymentType: e.target.value })}>
                                        <option>Monthly Fee</option>
                                        <option>Admission Fee</option>
                                        <option>Exam Fee</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 dark:text-gray-300">Amount</label>
                                    <input type="number" required className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 dark:text-gray-300">Month</label>
                                    <select className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })}>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 dark:text-gray-300">Year</label>
                                    <input type="number" required className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm mb-1 dark:text-gray-300">Status</label>
                                <select className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option>Paid</option>
                                    <option>Due</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>

                                {/* Manual Save Button */}
                                <button type="button" onClick={handleCreatePayment} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Save Offline</button>

                                {/* Razorpay Button */}
                                <button type="button" onClick={handleRazorpayPayment} className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 flex items-center">
                                    <FaCreditCard className="mr-2" /> Pay Online
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Hidden Receipt for Printing */}
            <div style={{ display: 'none' }}>
                <div ref={componentRef} className="p-8 bg-white text-gray-800 font-sans" style={{ width: '800px', margin: '0 auto' }}>
                    {selectedPayment && (
                        <div className="border-2 border-gray-800 p-8 relative">
                            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-brand-600 text-white flex items-center justify-center text-3xl font-bold rounded mr-4">E</div>
                                    <div>
                                        <h1 className="text-2xl font-bold uppercase tracking-wide">EduOne School</h1>
                                        <p className="text-sm">123 Education Lane, Knowledge City</p>
                                        <p className="text-sm">Phone: 123-456-7890 | Email: info@eduone.com</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-bold uppercase mb-1">Payment Receipt</h2>
                                    <p className="text-sm">Receipt No: <span className="font-mono font-bold">{selectedPayment.receiptNo}</span></p>
                                    <p className="text-sm">Date: {new Date(selectedPayment.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p><span className="font-bold">Student ID:</span> {selectedPayment.student?.studentId}</p>
                                        <p><span className="font-bold">Name:</span> {selectedPayment.student?.name}</p>
                                        <p><span className="font-bold">Class/Batch:</span> {selectedPayment.course?.courseName || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p><span className="font-bold">Payment Type:</span> {selectedPayment.paymentType}</p>
                                        <p><span className="font-bold">Period:</span> {selectedPayment.month} {selectedPayment.year}</p>
                                        <p><span className="font-bold">Received By:</span> {selectedPayment.receivedBy || 'Admin'}</p>
                                    </div>
                                </div>
                            </div>

                            <table className="w-full mb-8 border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2 text-left">Description</th>
                                        <th className="border p-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border p-2">{selectedPayment.paymentType} - {selectedPayment.month} {selectedPayment.year}</td>
                                        <td className="border p-2 text-right">${selectedPayment.amount}</td>
                                    </tr>
                                    <tr className="bg-gray-50 font-bold">
                                        <td className="border p-2 text-right">Total Received</td>
                                        <td className="border p-2 text-right">${selectedPayment.amount}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="flex justify-between items-end mt-16">
                                <div className="text-center">
                                    <div className="border-t border-gray-400 w-40"></div>
                                    <p className="text-sm mt-1">Cashier Signature</p>
                                </div>
                                <div className="text-center">
                                    <div className="border-t border-gray-800 w-40"></div>
                                    <p className="text-sm mt-1">Authority Signature</p>
                                </div>
                            </div>

                            <div className="mt-8 text-center text-xs text-gray-500">
                                Thank you for your payment. This is a computer generated receipt.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;
