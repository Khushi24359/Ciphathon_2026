import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

// ─── THEME HOOK ────────────────────────────────────────────────────────────
const useTheme = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('pt-theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  const toggle = () => setDark(d => {
    const next = !d;
    localStorage.setItem('pt-theme', next ? 'dark' : 'light');
    return next;
  });

  return { dark, toggle };
};

function App() {
  const { dark, toggle: toggleTheme } = useTheme();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing dark={dark} toggleTheme={toggleTheme} />} />
        <Route path="/scan" element={<Dashboard dark={dark} toggleTheme={toggleTheme} />} />
        {/* Redirect unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
