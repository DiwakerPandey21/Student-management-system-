import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { FaPrint, FaSearch, FaFilter } from 'react-icons/fa';

const AttendancePage = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [attendanceReport, setAttendanceReport] = useState([]);
    const [loading, setLoading] = useState(false);

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Attendance-Report',
    });

    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
        { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    const years = [2023, 2024, 2025, 2026];

    // Fetch batches on mount
    useEffect(() => {
        const fetchBatches = async () => {
            const user = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                const { data } = await axios.get('http://localhost:5000/api/batches', config);
                setBatches(data);
                if (data.length > 0) setSelectedBatch(data[0]._id);
            } catch (error) {
                console.error('Error fetching batches', error);
            }
        };
        fetchBatches();
    }, []);

    // Fetch report logic
    const fetchReport = async () => {
        if (!selectedBatch) return;
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        try {
            const { data } = await axios.get(`http://localhost:5000/api/attendance/report?batchId=${selectedBatch}&month=${selectedMonth}&year=${selectedYear}`, config);
            setAttendanceReport(data);
        } catch (error) {
            console.error('Error fetching report', error);
            alert('Failed to fetch attendance report');
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
                    <p className="text-sm text-gray-500">Generate monthly attendance reports</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchReport}
                        className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                    >
                        <FaSearch className="mr-2" /> View Report
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
                    >
                        <FaPrint className="mr-2" /> Print Report
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500"
                    >
                        <option value="">Select Batch</option>
                        {batches.map(batch => (
                            <option key={batch._id} value={batch._id}>{batch.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500"
                    >
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Report View */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" ref={componentRef}>
                <div className="p-8 text-center border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-center mb-2">
                        <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">E</div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">EduOne School Management</h2>
                    <p className="text-gray-500">Excellence in Education</p>
                    <h3 className="text-xl font-semibold mt-4 text-blue-800">Monthly Attendance Report</h3>
                    <p className="text-sm font-medium text-gray-600">
                        {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                    </p>
                </div>

                <div className="overflow-x-auto p-4">
                    <table className="w-full text-xs border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 w-10">ID</th>
                                <th className="border border-gray-300 p-2 text-left w-40">Name</th>
                                {daysArray.map(day => (
                                    <th key={day} className="border border-gray-300 p-1 w-6 text-center">{day}</th>
                                ))}
                                <th className="border border-gray-300 p-2 w-10 bg-green-50 text-green-800">T.P.</th>
                                <th className="border border-gray-300 p-2 w-10 bg-red-50 text-red-800">T.A.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={daysInMonth + 4} className="p-4 text-center">Loading data...</td></tr>
                            ) : attendanceReport.length > 0 ? (
                                attendanceReport.map(student => (
                                    <tr key={student.studentId} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-2 text-center font-medium">{student.studentId}</td>
                                        <td className="border border-gray-300 p-2 font-medium">{student.name}</td>
                                        {daysArray.map(day => {
                                            const status = student.attendance[day];
                                            let cellClass = "";
                                            let cellContent = "";

                                            if (status === 'Present') {
                                                cellClass = "bg-green-100 text-green-700 font-bold";
                                                cellContent = "P";
                                            } else if (status === 'Absent') {
                                                cellClass = "bg-red-100 text-red-700 font-bold";
                                                cellContent = "A";
                                            }

                                            return (
                                                <td key={day} className={`border border-gray-300 p-1 text-center ${cellClass}`}>
                                                    {cellContent}
                                                </td>
                                            );
                                        })}
                                        <td className="border border-gray-300 p-2 text-center font-bold text-green-700 bg-green-50">{student.totalPresent}</td>
                                        <td className="border border-gray-300 p-2 text-center font-bold text-red-700 bg-red-50">{student.totalAbsent}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={daysInMonth + 4} className="p-8 text-center text-gray-500">No records found. Click 'View Report'.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 text-right text-xs text-gray-400 border-t border-gray-200">
                    Generated by EduOne System
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
