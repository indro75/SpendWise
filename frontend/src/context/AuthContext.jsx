import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('spendwise_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('spendwise_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('spendwise_user', JSON.stringify(userData));
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('spendwise:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('spendwise:unauthorized', handleUnauthorized);
    };
  }, [refreshUser, logout]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.access_token) {
      localStorage.setItem('spendwise_token', data.access_token);
      setToken(data.access_token);
      // Fetch profile
      try {
        const userData = await authService.getMe();
        setUser(userData);
        localStorage.setItem('spendwise_user', JSON.stringify(userData));
        return { success: true, user: userData };
      } catch (err) {
        return { success: true };
      }
    }
    return { success: false, error: 'No access token received' };
  };

  const register = async (fullName, email, password) => {
    return await authService.register({
      full_name: fullName,
      email,
      password,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
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

