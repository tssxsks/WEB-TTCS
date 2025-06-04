import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Import components
import Navbar from './components/Navbar';

// Import pages
import About from './pages/About';
import Home from './pages/Home';
import DocumentDetail from './pages/DocumentDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadDocument from './pages/UploadDocument';
import ManageDocument from './pages/ManageDocument';
import ManageUsers from './pages/ManageUsers';
import ManageSubjects from './pages/ManageSubjects';
import Statistics from './pages/Statistics';

// Route requiring authentication
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Route requiring admin role
const AdminRoute = ({ children }) => {
  const { currentUser, loading, isAdmin } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }
  
  if (!currentUser || !isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes for all authenticated users */}
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/documents/:id" element={
          <PrivateRoute>
            <DocumentDetail />
          </PrivateRoute>
        } />        
        <Route path="/upload" element={
          <PrivateRoute>
            <UploadDocument />
          </PrivateRoute>
        } />
        <Route path="/manage-documents" element={
          <PrivateRoute>
            <ManageDocument />
          </PrivateRoute>
        } />
        
        {/* Admin only routes */}
        <Route path="/manage-users" element={
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        } />
        <Route path="/manage-subjects" element={
          <AdminRoute>
            <ManageSubjects />
          </AdminRoute>
        } />
        <Route path="/statistics" element={
          <AdminRoute>
            <Statistics />
          </AdminRoute>
        } />
        
        {/* Fallback route for invalid paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;