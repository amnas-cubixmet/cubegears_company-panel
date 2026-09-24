import React, { createContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';

export const AuthContext = createContext(null);

const MOCK_USER = {
  id: 'USR_101',
  name: 'Alex Rivera',
  email: 'admin@cubixgear.com',
  role: 'SUPER_ADMIN',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
};

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (USE_MOCK_API) return MOCK_USER;
    return readStoredUser();
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (USE_MOCK_API) return true;
    return Boolean(localStorage.getItem('auth_token'));
  });
  const [loading, setLoading] = useState(!USE_MOCK_API && Boolean(localStorage.getItem('auth_token')));

  useEffect(() => {
    if (USE_MOCK_API) return;

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
      if (USE_MOCK_API) {
        localStorage.setItem('auth_token', 'mock_jwt_token_2026');
        localStorage.setItem('auth_user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
        setIsAuthenticated(true);
        return MOCK_USER;
      }

      const response = await apiClient.post('/auth/login', credentials);
      const token = response?.token || response?.accessToken || response?.access_token;
      const resolvedUser = response?.user || response?.profile;

      if (!token) throw new Error('Login response did not include an access token.');

      localStorage.setItem('auth_token', token);
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
      if (!USE_MOCK_API) await apiClient.post('/auth/logout');
    } catch {
      // Local logout must still succeed if the network/backend is unavailable.
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = useMemo(
    () => ({ user, isAuthenticated, loading, login, logout, isMockMode: USE_MOCK_API }),
    [user, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
