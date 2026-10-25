import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentAdmin, login as loginRequest, logout as logoutRequest } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  // 'loading' | 'authenticated' | 'anonymous'
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;

    fetchCurrentAdmin()
      .then((currentAdmin) => {
        if (!active) return;
        setAdmin(currentAdmin);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        setAdmin(null);
        setStatus('anonymous');
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials) => {
    const { admin: signedInAdmin } = await loginRequest(credentials);
    setAdmin(signedInAdmin);
    setStatus('authenticated');
    return signedInAdmin;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setAdmin(null);
      setStatus('anonymous');
    }
  }, []);

  const value = useMemo(
    () => ({
      admin,
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      signIn,
      signOut,
    }),
    [admin, status, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}

export default AuthContext;
