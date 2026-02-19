import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaUserGraduate, FaBook, FaLayerGroup, FaUsers } from 'react-icons/fa';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalCourses: 0,
        totalBatches: 0,
        totalUsers: 0
    });
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5000/api/stats', config);
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        };

        fetchStats();
    }, [user]);

    const StatCard = ({ title, value, icon, color }) => (
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
                </div>
                <div className={`p-4 rounded-xl ${color} text-white text-xl shadow-lg`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-500">
                <span>+2.5%</span>
                <span className="text-gray-400 ml-2">from last month</span>
            </div>
        </div>
    );

    return (
        <>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
                <p className="text-gray-500 mt-1">Here's what's happening in your school today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={<FaUserGraduate />}
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Total Courses"
                    value={stats.totalCourses}
                    icon={<FaBook />}
                    color="bg-gradient-to-r from-emerald-500 to-emerald-600"
                />
                <StatCard
                    title="Active Batches"
                    value={stats.totalBatches}
                    icon={<FaLayerGroup />}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<FaUsers />}
                    color="bg-gradient-to-r from-orange-500 to-orange-600"
                />
            </div>

            {/* Quick Actions / Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Enrollments</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="pb-3">Student</th>
                                    <th className="pb-3">Course</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-50">
                                <tr>
                                    <td className="py-4 text-gray-600">No recent enrollments</td>
                                    <td className="py-4"></td>
                                    <td className="py-4"></td>
                                    <td className="py-4"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">System Notices</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <h4 className="font-semibold text-blue-800 text-sm">System Update</h4>
                            <p className="text-blue-600 text-xs mt-1">Dashboard updated to version 2.0 with new premium UI.</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                            <h4 className="font-semibold text-yellow-800 text-sm">Action Required</h4>
                            <p className="text-yellow-600 text-xs mt-1">Please review pending student applications.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
