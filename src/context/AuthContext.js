import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI, usersAPI } from '../api/client';
import { extractErrorMessage } from '../utils/errors';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  const clearError = () => setAuthError(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await usersAPI.getMyProfile();
      setUser(res.data);
      return res.data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await fetchProfile();
      setIsInitializing(false);
    };
    initAuth();
  }, [fetchProfile]);

  const login = async (username, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await authAPI.login(username, password);
      await fetchProfile();
      return true;
    } catch (e) {
      setAuthError(extractErrorMessage(e, 'Login failed. Please check your credentials.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, username, email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await authAPI.register(name, username, email, password);
      await fetchProfile();
      return true;
    } catch (e) {
      setAuthError(extractErrorMessage(e, 'Registration failed.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch { }
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitializing,
        authError,
        clearError,
        login,
        register,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
