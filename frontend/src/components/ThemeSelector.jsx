import { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';
import { FaCheck, FaTimes } from 'react-icons/fa';

const themes = [
    { id: 'default', name: 'Default Blue', color: '#2563eb' },
    { id: 'red', name: 'Red', color: '#dc2626' },
    { id: 'green', name: 'Green', color: '#16a34a' },
    { id: 'purple', name: 'Purple', color: '#9333ea' },
    { id: 'orange', name: 'Orange', color: '#ea580c' },
    { id: 'black', name: 'Black', color: '#1f2937' },
];

const ThemeSelector = ({ onClose }) => {
    const { colorTheme, changeColorTheme } = useContext(ThemeContext);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Select Theme</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => changeColorTheme(theme.id)}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 group
                                ${colorTheme === theme.id
                                    ? 'border-brand-600 bg-brand-50 dark:bg-gray-700'
                                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-700'
                                }
                            `}
                        >
                            <div
                                className="w-12 h-12 rounded-full shadow-md flex items-center justify-center text-white text-lg"
                                style={{ backgroundColor: theme.color }}
                            >
                                {colorTheme === theme.id && <FaCheck />}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{theme.name}</span>
                        </button>
                    ))}
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium shadow-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeSelector;
