import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserGraduate, FaBook, FaChalkboard, FaSignOutAlt, FaLayerGroup, FaIdCard, FaMoneyBillWave } from 'react-icons/fa';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Sidebar = ({ open, setOpen }) => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const menuItems = [
        { path: '/admin', name: 'Dashboard', icon: <FaHome /> },
        { path: '/admin/students', name: 'Students', icon: <FaUserGraduate /> },
        { path: '/admin/courses', name: 'Courses', icon: <FaBook /> },
        { path: '/admin/batches', name: 'Batches', icon: <FaLayerGroup /> },
        { path: '/admin/id-cards', name: 'ID Cards', icon: <FaIdCard /> },
        { path: '/admin/attendance', name: 'Attendance', icon: <FaChalkboard /> },
        { path: '/admin/payments', name: 'Payments', icon: <FaMoneyBillWave /> },
    ];

    return (
        <div className={`fixed inset-y-0 left-0 bg-gray-900 text-white w-64 transform ${open ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-50 shadow-xl`}>
            <div className="flex items-center h-16 border-b border-gray-800 px-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30 flex-shrink-0">
                        <span className="text-white font-bold text-lg">E</span>
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-wide whitespace-nowrap">
                        EduOne
                    </h1>
                </div>
            </div>

            <nav className="mt-8 px-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === item.path
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="text-lg mr-3">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}

                <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition-all duration-200 mt-8"
                >
                    <span className="text-lg mr-3"><FaSignOutAlt /></span>
                    <span className="font-medium">Logout</span>
                </button>
            </nav>

            <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-800 bg-gray-900">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                        AD
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">Administrator</p>
                        <p className="text-xs text-gray-500">admin@school.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
