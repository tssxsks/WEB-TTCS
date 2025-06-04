import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, register } from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra xem đã đăng nhập chưa khi load trang
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Lỗi xác thực:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Đăng nhập
  const handleLogin = async (credentials) => {
    setError(null);
    try {
      const data = await login(credentials);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đăng nhập thất bại');
      throw error;
    }
  };

  // Đăng ký
  const handleRegister = async (userData) => {
    setError(null);
    try {
      const data = await register(userData);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đăng ký thất bại');
      throw error;
    }
  };

  // Đăng xuất
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAdmin: currentUser?.role?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};