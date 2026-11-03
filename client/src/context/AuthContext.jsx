import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('logiconnect_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('logiconnect_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('logiconnect_token');
      if (storedToken) {
        try {
          const res = await axiosClient.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('logiconnect_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out');
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password, role) => {
    const res = await axiosClient.post('/auth/login', { email, password, role });
    if (res.data?.token && res.data?.user) {
      localStorage.setItem('logiconnect_token', res.data.token);
      localStorage.setItem('logiconnect_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Invalid login response from server');
  };

  const register = async (formData) => {
    const res = await axiosClient.post('/auth/register', formData);
    if (res.data?.token && res.data?.user) {
      localStorage.setItem('logiconnect_token', res.data.token);
      localStorage.setItem('logiconnect_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Registration failed');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('logiconnect_user', JSON.stringify(updatedUserData));
  };

  const logout = () => {
    localStorage.removeItem('logiconnect_token');
    localStorage.removeItem('logiconnect_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
