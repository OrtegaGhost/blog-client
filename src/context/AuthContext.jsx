import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Pre-populate from storage for instant first render (non-sensitive profile data only).
  // JWT lives exclusively in an HttpOnly cookie — never in state or localStorage.
  const [user, setUser]       = useState(() => storage.getUser());
  // Only show the loading spinner when we need to validate the cookie on mount.
  const [loading, setLoading] = useState(!!storage.getUser());

  useEffect(() => {
    if (!storage.getUser()) return; // no cached user → definitely not logged in
    authApi.me()
      .then(({ data }) => { setUser(data); storage.setUser(data); })
      .catch(() => { storage.clear(); setUser(null); })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Called after a successful login. The JWT cookie is already set by the server. */
  const login = useCallback((userData) => {
    if (!userData?.id) return; // guard: never set null/undefined as authenticated user
    storage.setUser(userData);
    setUser(userData);
  }, []);

  /** Clears the HttpOnly cookie server-side, then wipes local profile cache. */
  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* cookie cleared client-side regardless */ }
    storage.clear();
    setUser(null);
  }, []);

  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data };
    storage.setUser(updated);
    setUser(updated);
  }, [user]);

  const value = { user, loading, isAuthenticated: !!user, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Convenience hook — throws if used outside AuthProvider */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
