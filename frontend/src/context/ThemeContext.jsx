import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  }, []);

  // Update localStorage and apply theme
  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [isDark]);

  const toggleTheme = () => {
    // Show coming soon modal instead of switching to light theme
    setShowComingSoonModal(true);
  };

  const closeComingSoonModal = () => {
    setShowComingSoonModal(false);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, showComingSoonModal, closeComingSoonModal }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
