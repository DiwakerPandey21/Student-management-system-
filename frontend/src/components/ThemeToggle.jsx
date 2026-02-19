import { useContext } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import ThemeContext from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? <FaMoon className="text-xl" /> : <FaSun className="text-xl" />}
        </button>
    );
};

export default ThemeToggle;
