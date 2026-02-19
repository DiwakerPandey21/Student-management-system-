import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { FaUser, FaMoneyBillWave, FaPrint, FaArrowLeft, FaPlus, FaCreditCard, FaExchangeAlt, FaIdCard } from 'react-icons/fa';
import Barcode from 'react-barcode';

const StudentPaymentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ totalPaid: 0, totalDue: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Form Data for New Payment
    const [formData, setFormData] = useState({
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
        const fetchData = async () => {
            try {
                // 1. Fetch Student Profile
                const { data: studentData } = await axios.get(`http://localhost:5000/api/students/${id}`, config);
                setStudent(studentData);

                // 2. Fetch Payments (using MongoDB ID)
                const { data: paymentData } = await axios.get(`http://localhost:5000/api/payments?studentId=${id}`, config);
                setPayments(paymentData.payments);

                // 3. Fetch Stats
                const { data: statsData } = await axios.get(`http://localhost:5000/api/payments/stats/${id}`, config);
                setStats(statsData);

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        fetchData();

        return () => {
            document.body.removeChild(script);
        }
    }, [id]);

    const refreshData = async () => {
        const { data: paymentData } = await axios.get(`http://localhost:5000/api/payments?studentId=${id}`, config);
        setPayments(paymentData.payments);
        const { data: statsData } = await axios.get(`http://localhost:5000/api/payments/stats/${id}`, config);
        setStats(statsData);
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/payments', {
                ...formData,
                studentId: student.studentId // Use the looked-up student ID
            }, config);
            setShowModal(false);
            refreshData();
            setFormData({ ...formData, amount: '' });
            alert('Payment recorded successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error recording payment');
        }
    };

    const handleRazorpayPayment = async (e) => {
        e.preventDefault();
        if (!formData.amount) {
            alert('Please enter Amount');
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
                key: "rzp_test_SHvyg3w2dN78OH",
                amount: order.amount,
                currency: order.currency,
                name: "EduOne School",
                description: `${formData.paymentType} - ${formData.month} ${formData.year}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await axios.post('http://localhost:5000/api/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            paymentData: {
                                ...formData,
                                studentId: student.studentId
                            }
                        }, config);

                        setShowModal(false);
                        refreshData();
                        setFormData({ ...formData, amount: '' });
                        alert('Payment Successful!');
                    } catch (error) {
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: student.name,
                    email: student.email,
                    contact: student.phone
                },
                theme: { color: "#3399cc" }
            };

            const rzp1 = new window.Razorpay(options);
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

    if (loading) return <div className="p-10 text-center dark:text-white">Loading...</div>;
    if (!student) return <div className="p-10 text-center dark:text-white">Student not found</div>;

    const totalFee = stats.totalPaid + stats.totalDue;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-brand-600 mb-4">
                <FaArrowLeft className="mr-2" /> Back to Students
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Student Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center border-t-4 border-brand-500">
                        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                            {student.profilePicture ? (
                                <img src={student.profilePicture} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <FaUser className="text-4xl text-gray-400" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold dark:text-white">{student.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-mono">{student.studentId}</p>

                        <div className="mt-4 flex justify-center">
                            <Barcode value={student.studentId} height={40} width={1.5} displayValue={false} />
                        </div>

                        <div className="mt-6 text-left space-y-2 border-t pt-4 dark:border-gray-700">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Class/Course</span>
                                <span className="font-medium dark:text-white">N/A</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Section</span>
                                <span className="font-medium dark:text-white">A</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Phone</span>
                                <span className="font-medium dark:text-white">{student.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment Panel */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Stats Panel */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold dark:text-white flex items-center">
                                <FaCreditCard className="mr-2 text-brand-500" /> Payment Panel
                            </h3>
                            <button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                                <FaPlus className="mr-2" /> Receive Payment
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-300 uppercase">Total Fee</p>
                                <p className="text-xl font-bold dark:text-white">${totalFee}</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                <p className="text-xs text-green-600 dark:text-green-400 uppercase">Total Paid</p>
                                <p className="text-xl font-bold text-green-700 dark:text-green-400">${stats.totalPaid}</p>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                <p className="text-xs text-red-600 dark:text-red-400 uppercase">Total Due</p>
                                <p className="text-xl font-bold text-red-700 dark:text-red-400">${stats.totalDue}</p>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 font-bold dark:text-white">
                            Transaction History
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500 dark:text-gray-300">
                                <tr>
                                    <th className="p-4">Receipt</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {payments.length === 0 ? (
                                    <tr><td colSpan="6" className="p-4 text-center text-gray-500">No transactions found</td></tr>
                                ) : (
                                    payments.map(pay => (
                                        <tr key={pay._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="p-4 font-mono text-xs dark:text-gray-300">{pay.receiptNo}</td>
                                            <td className="p-4 text-sm dark:text-gray-300">{new Date(pay.createdAt).toLocaleDateString()}</td>
                                            <td className="p-4 text-sm dark:text-gray-300">
                                                {pay.paymentType} <br />
                                                <span className="text-xs text-gray-500">{pay.month} {pay.year}</span>
                                            </td>
                                            <td className="p-4 font-bold dark:text-white">${pay.amount}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${pay.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {pay.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button onClick={() => openReceipt(pay)} className="text-gray-500 hover:text-brand-600 dark:text-gray-400">
                                                    <FaPrint />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Receive Payment</h3>
                        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">For Student: <span className="font-bold text-gray-800 dark:text-white">{student.name} ({student.studentId})</span></p>

                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 dark:text-gray-300">Type</label>
                                    <select className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500"
                                        value={formData.paymentType} onChange={e => setFormData({ ...formData, paymentType: e.target.value })}>
                                        <option>Monthly Fee</option>
                                        <option>Admission Fee</option>
                                        <option>Exam Fee</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 dark:text-gray-300">Amount</label>
                                    <input type="number" required className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500"
                                        value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 dark:text-gray-300">Month</label>
                                    <select className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500"
                                        value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })}>
                                        {months.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 dark:text-gray-300">Year</label>
                                    <input type="number" required className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-500"
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
                                <button type="button" onClick={handleCreatePayment} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Save Offline</button>
                                <button type="button" onClick={handleRazorpayPayment} className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 flex items-center">
                                    <FaCreditCard className="mr-2" /> Pay Online
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Hidden Receipt */}
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
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-bold uppercase mb-1">Payment Receipt</h2>
                                    <p className="text-sm">Receipt No: <span className="font-mono font-bold">{selectedPayment.receiptNo}</span></p>
                                    <p className="text-sm">Date: {new Date(selectedPayment.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div>
                                    <p><span className="font-bold">Student Name:</span> {student.name}</p>
                                    <p><span className="font-bold">Student ID:</span> {student.studentId}</p>
                                </div>
                                <div className="text-right">
                                    <p><span className="font-bold">Payment Type:</span> {selectedPayment.paymentType}</p>
                                    <p><span className="font-bold">Period:</span> {selectedPayment.month} {selectedPayment.year}</p>
                                </div>
                            </div>
                            <table className="w-full mb-8 border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr><th className="border p-2 text-left">Description</th><th className="border p-2 text-right">Amount</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td className="border p-2">{selectedPayment.paymentType}</td><td className="border p-2 text-right">${selectedPayment.amount}</td></tr>
                                    <tr className="bg-gray-50 font-bold"><td className="border p-2 text-right">Total</td><td className="border p-2 text-right">${selectedPayment.amount}</td></tr>
                                </tbody>
                            </table>
                            <div className="mt-8 text-center text-xs text-gray-500">Computer Generated Receipt</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentPaymentDetails;
