import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Auth from './pages/Auth';
import { Dumbbell, BarChart2, LogOut, User } from 'lucide-react';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('logym_token'));
  const username = localStorage.getItem('logym_username') || 'Kullanıcı';

  const handleLogout = () => {
    localStorage.removeItem('logym_token');
    localStorage.removeItem('logym_username');
    setToken(null);
  };

  if (!token) {
    return <Auth setToken={setToken} />;
  }

  return (
    <Router>
      <div className="app-layout">
        <nav className="navbar">
          <h2>LOGYM</h2>
          <div className="nav-links desktop-only">
            <Link to="/" className="nav-link">Antrenman Ekle +</Link>
            <Link to="/history" className="nav-link">Geçmiş</Link>
            <button onClick={handleLogout} className="nav-link btn-logout">Çıkış Yap</button>
          </div>
        </nav>

        <div className="user-welcome-banner">
          <User size={14} />
          <span>Hoş geldin, <strong>{username}</strong></span>
        </div>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <div className="mobile-bottom-nav">
          <Link to="/" className="mobile-nav-item">
            <Dumbbell size={22} />
            <span>Antrenman</span>
          </Link>
          <Link to="/history" className="mobile-nav-item">
            <BarChart2 size={22} />
            <span>Geçmiş</span>
          </Link>
          <button onClick={handleLogout} className="mobile-nav-item mobile-logout-btn">
            <LogOut size={22} />
            <span>Çıkış</span>
          </button>
        </div>
      </div>
    </Router>
  );
}

export default App;