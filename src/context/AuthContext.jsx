import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(() => storage.getUser());
  const [token, setToken]       = useState(() => storage.getToken());
  const [loading, setLoading]   = useState(!!storage.getToken()); // verify on mount if token exists

  // Validate the stored token and refresh the user profile on load
  useEffect(() => {
    if (!token) return;
    authApi.me()
      .then(({ data }) => { setUser(data); storage.setUser(data); })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((tokenData, userData) => {
    storage.setToken(tokenData.access_token);
    storage.setUser(userData);
    setToken(tokenData.access_token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data };
    storage.setUser(updated);
    setUser(updated);
  }, [user]);

  const value = { user, token, loading, isAuthenticated: !!token, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Convenience hook — throws if used outside AuthProvider */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
