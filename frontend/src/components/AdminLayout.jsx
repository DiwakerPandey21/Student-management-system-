import { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaBars, FaPalette } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import ThemeSelector from './ThemeSelector';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const { user } = useContext(AuthContext);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200">
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {showThemeSelector && <ThemeSelector onClose={() => setShowThemeSelector(false)} />}

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6 z-10 transition-colors duration-200">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-500 dark:text-gray-300 focus:outline-none md:hidden"
                    >
                        <FaBars className="text-xl" />
                    </button>

                    <div className="flex items-center ml-auto space-x-4">
                        <button
                            onClick={() => setShowThemeSelector(true)}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            title="Change Theme"
                        >
                            <FaPalette />
                        </button>
                        <ThemeToggle />
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Welcome, <span className="font-semibold text-gray-800 dark:text-white">{user?.name}</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 md:p-10 transition-colors duration-200">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
