import { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Dark Mode State
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    // Color Theme State
    const [colorTheme, setColorTheme] = useState(() => {
        return localStorage.getItem("colorTheme") || "default";
    });

    useEffect(() => {
        // Toggle Dark Class
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    useEffect(() => {
        // Set Data Theme Attribute
        document.documentElement.setAttribute('data-theme', colorTheme);
        localStorage.setItem('colorTheme', colorTheme);
    }, [colorTheme]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const changeColorTheme = (theme) => {
        setColorTheme(theme);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme, colorTheme, changeColorTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
