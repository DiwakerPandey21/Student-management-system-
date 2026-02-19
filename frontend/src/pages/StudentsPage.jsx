import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserGraduate } from 'react-icons/fa';

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { user } = useContext(AuthContext);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        studentId: '',
        phone: '',
        address: '',
        gender: 'Male',
        dob: '',
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/students', config);
            setStudents(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching students", error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
            };

            // 1. Create User first
            const userRes = await axios.post('http://localhost:5000/api/users', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'student'
            }, config);

            // 2. Create Student Profile
            await axios.post('http://localhost:5000/api/students', {
                user: userRes.data._id,
                studentId: formData.studentId,
                name: formData.name, // Redundant but kept in schema
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                gender: formData.gender,
                dob: formData.dob
            }, config);

            setShowModal(false);
            fetchStudents();
            setFormData({
                name: '', email: '', password: '', studentId: '',
                phone: '', address: '', gender: 'Male', dob: ''
            });
            alert('Student Created Successfully');
        } catch (error) {
            console.error("Error creating student", error);
            alert(error.response?.data?.message || 'Error creating student');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                await axios.delete(`http://localhost:5000/api/students/${id}`, config);
                fetchStudents();
            } catch (error) {
                console.error("Error deleting student", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaUserGraduate className="mr-2 text-blue-600" /> Student Management
                </h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition shadow-md"
                >
                    <FaPlus className="mr-2" /> Add Student
                </button>
            </div>

            {/* Student List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaSearch className="text-gray-400" />
                        </span>
                        <input
                            type="text"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search students..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No students found</td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900"><FaEdit /></button>
                                            <button onClick={() => handleDelete(student._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Student Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Add New Student</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                    <input required type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                                </div>

                                <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow">Save Student</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsPage;
