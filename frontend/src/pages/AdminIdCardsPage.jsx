import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaIdCard, FaPrint, FaSearch } from 'react-icons/fa';
import IdCard from '../components/IdCard';
import { useReactToPrint } from 'react-to-print';

const AdminIdCardsPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const componentRef = useRef();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/students', config);
            setStudents(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Student-ID-Cards',
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaIdCard className="mr-2 text-indigo-600" /> Student ID Cards
                </h2>
                <button onClick={handlePrint} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center transition shadow-md">
                    <FaPrint className="mr-2" /> Print All Cards
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                {loading ? (
                    <p className="text-center text-gray-500">Loading students...</p>
                ) : students.length === 0 ? (
                    <p className="text-center text-gray-500">No students found to generate ID cards.</p>
                ) : (
                    <div ref={componentRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 p-4">
                        <style type="text/css" media="print">
                            {`
                                @page { size: auto; margin: 10mm; }
                                body { -webkit-print-color-adjust: exact; }
                            `}
                        </style>
                        {students.map((student) => (
                            <div key={student._id} className="flex justify-center break-inside-avoid">
                                <IdCard student={student} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminIdCardsPage;
