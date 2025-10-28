import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    setIsAuthenticated(!!token);
    
    if (userData) {
      const user = JSON.parse(userData);
      setIsAdmin(user.isAdmin || user.role === 'admin');
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-gray-50 dark:bg-[#0b0f17]">
        <div className="bg-gradient-animate" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? (isAdmin ? <Navigate to="/admin-dashboard" /> : <Navigate to="/dashboard" />) : <Login />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated && !isAdmin ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/admin-dashboard"
          element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
