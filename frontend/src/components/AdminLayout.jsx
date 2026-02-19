import { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaBars } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useContext(AuthContext);

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-500 focus:outline-none md:hidden"
                    >
                        <FaBars className="text-xl" />
                    </button>

                    <div className="flex items-center ml-auto space-x-4">
                        <div className="text-sm text-gray-600">
                            Welcome, <span className="font-semibold text-gray-800">{user?.name}</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
