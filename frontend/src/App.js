import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import HomePage from './components/Home/HomePage';
import ProfileEditPage from './components/Profile/ProfileEditPage';
import AdminPage from './components/Admin/AdminPage';
import BuilderPage from './components/Builder/BuilderPage';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>Loading...</div>;
  if (!token) return <Navigate to="/auth" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { token, user, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>Loading...</div>;
  if (!token) return <Navigate to="/auth" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/cv-builder" element={<ProtectedRoute><BuilderPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

