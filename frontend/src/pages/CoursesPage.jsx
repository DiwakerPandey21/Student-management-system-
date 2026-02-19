import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaBook } from 'react-icons/fa';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        courseName: '',
        courseCode: '',
        description: '',
        credits: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/courses', config);
            setCourses(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/courses', formData, config);
            setShowModal(false);
            fetchCourses();
            setFormData({ courseName: '', courseCode: '', description: '', credits: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating course');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this course?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`http://localhost:5000/api/courses/${id}`, config);
                fetchCourses();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaBook className="mr-2 text-emerald-600" /> Course Management
                </h2>
                <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition shadow-md">
                    <FaPlus className="mr-2" /> Add Course
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaSearch className="text-gray-400" />
                        </span>
                        <input type="text" className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search courses..." />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : courses.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-4 text-center">No courses found</td></tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium">{course.courseCode}</td>
                                        <td className="px-6 py-4">{course.courseName}</td>
                                        <td className="px-6 py-4">{course.credits}</td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
                                            <button onClick={() => handleDelete(course._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
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
                            <h3 className="text-lg font-bold text-gray-800">Add New Course</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                    <input required type="text" name="courseName" value={formData.courseName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                                    <input required type="text" name="courseCode" value={formData.courseCode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                                    <input required type="number" name="credits" value={formData.credits} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                                </div>
                                <div className="flex justify-end space-x-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Course</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursesPage;
