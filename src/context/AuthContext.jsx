import { createContext, useEffect, useMemo, useState } from "react";
import apiClient from '../api/apiClient';

export const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Authentication always requires a real account and a valid Django JWT.
  // Optional mock data for other modules must never grant a login session.
  const [user, setUser] = useState(readStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('auth_token')));
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('auth_token')));

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    let active = true;

    apiClient.get('/auth/me')
      .then((profile) => {
        if (!active) return;
        const resolvedUser = profile?.user || profile;
        setUser(resolvedUser);
        setIsAuthenticated(true);
        localStorage.setItem('auth_user', JSON.stringify(resolvedUser));
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_user');
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', credentials);
      const token = response?.access || response?.token || response?.accessToken || response?.access_token;
      const refreshToken = response?.refresh || response?.refreshToken || response?.refresh_token;
      const resolvedUser = response?.user || response?.profile;

      if (!token || !resolvedUser?.id || !resolvedUser?.email) {
        throw new Error('Login response did not include a verified user session.');
      }

      localStorage.setItem('auth_token', token);
      if (refreshToken) {
        localStorage.setItem('auth_refresh_token', refreshToken);
      }
      if (resolvedUser) {
        localStorage.setItem('auth_user', JSON.stringify(resolvedUser));
      }

      setUser(resolvedUser || null);
      setIsAuthenticated(true);

      return resolvedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('auth_refresh_token');
      await apiClient.post('/auth/logout', refresh ? { refresh } : {});
    } catch {
      // Local logout must still succeed if the network/backend is unavailable.
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = useMemo(
    () => ({ user, isAuthenticated, loading, login, logout, isMockMode: false }),
    [user, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
