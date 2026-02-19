import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import IdCard from '../components/IdCard';
import { useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { FaUserGraduate, FaMoneyBillWave, FaChalkboardTeacher, FaCalendarAlt, FaPrint, FaCreditCard } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';
import ThemeSelector from '../components/ThemeSelector';
import { FaPalette } from 'react-icons/fa';

const StudentDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [studentProfile, setStudentProfile] = useState(null);
    const [attendance, setAttendance] = useState({ percentage: 0, totalClasses: 0, totalPresent: 0 });
    const [fees, setFees] = useState({ totalDue: 0, totalPaid: 0 });
    const [loading, setLoading] = useState(true);
    const [showThemeSelector, setShowThemeSelector] = useState(false);

    const componentRef = useRef();

    // Function to handle image download
    const handleDownload = async () => {
        if (!componentRef.current) return;

        try {
            const dataUrl = await htmlToImage.toPng(componentRef.current, { cacheBust: true, });

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Student-ID-${studentProfile?.studentId || 'Card'}.png`;
            link.click();
        } catch (error) {
            console.error("Error generating ID card image:", error);
            alert(`Failed to download ID card: ${error.message}`);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };

                // 1. Fetch Profile
                const { data: profile } = await axios.get('http://localhost:5000/api/students/profile', config);
                setStudentProfile(profile);

                // 2. Fetch Attendance
                try {
                    const { data: att } = await axios.get('http://localhost:5000/api/attendance/my-attendance', config);
                    setAttendance(att);
                } catch (err) {
                    console.error("Error fetching attendance", err);
                }

                // 3. Fetch Fees (Need student ID from profile)
                if (profile && profile._id) {
                    try {
                        const { data: feeStats } = await axios.get(`http://localhost:5000/api/payments/stats/${profile._id}`, config);
                        setFees(feeStats);
                    } catch (err) {
                        console.error("Error fetching fees", err);
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200">
            {/* Header */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
                                EduOne <span className="text-brand-600">Student</span>
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowThemeSelector(true)}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                title="Change Theme"
                            >
                                <FaPalette />
                            </button>
                            <ThemeToggle />
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.name}</span>
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-2 rounded-full">Active Student</span>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {showThemeSelector && <ThemeSelector onClose={() => setShowThemeSelector(false)} />}

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Profile & ID */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* ID Card Widget */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center overflow-hidden">
                                <div className="flex justify-between w-full mb-4 items-center">
                                    <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                                        <FaUserGraduate className="mr-2 text-brand-600" /> My ID Card
                                    </h2>
                                    <button onClick={handleDownload} className="text-gray-400 hover:text-brand-600 transition" title="Download ID">
                                        <FaPrint />
                                    </button>
                                </div>

                                <div className="w-full flex justify-center overflow-x-auto pb-2">
                                    <div className="transform scale-90 sm:scale-100 transition-transform origin-top">
                                        {studentProfile ? (
                                            <div ref={componentRef}>
                                                <IdCard student={studentProfile} />
                                            </div>
                                        ) : (
                                            <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">Profile loading or not found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {studentProfile && (
                                    <button
                                        onClick={handleDownload}
                                        className="mt-4 w-full py-2.5 px-4 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium shadow-lg shadow-brand-500/20 flex items-center justify-center"
                                    >
                                        <FaPrint className="mr-2" /> Download / Print ID
                                    </button>
                                )}
                            </div>

                            {/* Detailed Profile Info */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Personal Details</h3>
                                {studentProfile ? (
                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                                            <span className="text-gray-500 dark:text-gray-400">Student ID</span>
                                            <span className="font-mono font-medium text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{studentProfile.studentId}</span>
                                        </div>
                                        <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                                            <span className="text-gray-500 dark:text-gray-400">Email</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-200">{studentProfile.email}</span>
                                        </div>
                                        <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                                            <span className="text-gray-500 dark:text-gray-400">Phone</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-200">{studentProfile.phone}</span>
                                        </div>
                                        <div className="flex justify-between border-b dark:border-gray-700 pb-2">
                                            <span className="text-gray-500 dark:text-gray-400">Gender</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-200">{studentProfile.gender || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between pt-1">
                                            <span className="text-gray-500 dark:text-gray-400">Address</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-200 text-right max-w-[60%]">{studentProfile.address || 'N/A'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No details available.</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Widgets & Dashboard */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Attendance Widget */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-brand-50 dark:bg-brand-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-xl text-brand-600 dark:text-brand-400">
                                                <FaChalkboardTeacher className="text-xl" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Attendance</span>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <h3 className="text-4xl font-bold text-gray-800 dark:text-white">{attendance.percentage}%</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Present</p>
                                        </div>
                                        <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-brand-600 h-2 rounded-full transition-all duration-1000"
                                                style={{ width: `${attendance.percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            {attendance.totalPresent} out of {attendance.totalClasses} classes attended
                                        </p>
                                    </div>
                                </div>

                                {/* Fees Widget */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-red-50 dark:bg-red-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${fees.totalDue > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                <FaMoneyBillWave className="text-xl" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Financials</span>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <h3 className={`text-4xl font-bold ${fees.totalDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                ${fees.totalDue}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Due</p>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Total Paid: <span className="font-semibold text-gray-800 dark:text-gray-200">${fees.totalPaid}</span>
                                        </p>
                                        {fees.totalDue > 0 && (
                                            <button className="mt-4 w-full py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition shadow-sm">
                                                Pay Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Academic Overview (Courses) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                        <FaCalendarAlt className="mr-2 text-brand-600" /> Academic Overview
                                    </h3>
                                    <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 text-xs font-semibold px-2.5 py-0.5 rounded">Current Term</span>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Mock Course Card 1 */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition bg-gradient-to-br from-white to-brand-50/30 dark:from-gray-800 dark:to-brand-900/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded-lg text-brand-600 dark:text-brand-400">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                                </div>
                                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">In Progress</span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 dark:text-white">Advanced Mathematics</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Code: MTH-401</p>
                                            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">75% Complete</p>
                                        </div>

                                        {/* Mock Course Card 2 */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Upcoming</span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 dark:text-white">Physics Lab</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Code: PHY-202</p>
                                            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '10%' }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">10% Complete</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
