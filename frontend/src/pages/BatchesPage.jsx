import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaLayerGroup } from 'react-icons/fa';

const BatchesPage = () => {
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        batchName: '',
        course: '',
        year: new Date().getFullYear(),
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchBatches();
        fetchCourses();
    }, []);

    const fetchBatches = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/batches', config);
            setBatches(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/courses', config);
            setCourses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/batches', formData, config);
            setShowModal(false);
            fetchBatches();
            setFormData({ batchName: '', course: '', year: new Date().getFullYear(), startDate: '', endDate: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating batch');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this batch?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`http://localhost:5000/api/batches/${id}`, config);
                fetchBatches();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaLayerGroup className="mr-2 text-purple-600" /> Batch Management
                </h2>
                <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition shadow-md">
                    <FaPlus className="mr-2" /> Add Batch
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaSearch className="text-gray-400" />
                        </span>
                        <input type="text" className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Search batches..." />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : batches.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center">No batches found</td></tr>
                            ) : (
                                batches.map((batch) => (
                                    <tr key={batch._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium">{batch.batchName}</td>
                                        <td className="px-6 py-4">{batch.course?.courseName || 'N/A'}</td>
                                        <td className="px-6 py-4">{batch.year}</td>
                                        <td className="px-6 py-4">{new Date(batch.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button className="text-brand-600 hover:text-brand-900"><FaEdit /></button>
                                            <button onClick={() => handleDelete(batch._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Add New Batch</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                                    <input required type="text" name="batchName" value={formData.batchName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                                    <select required name="course" value={formData.course} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none">
                                        <option value="">Select Course</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>{course.courseName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input required type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                                </div>
                                <div className="flex justify-end space-x-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Save Batch</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchesPage;
