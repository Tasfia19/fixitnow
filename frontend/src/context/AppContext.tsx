'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getClientCookie, setClientCookie, eraseClientCookie, api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: any | null;
  token: string | null;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN' | null;
  loading: boolean;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  login: (token: string, user: any) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<'CUSTOMER' | 'TECHNICIAN' | 'ADMIN' | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const router = useRouter();
  const pathname = usePathname();

  // Load theme and auth token on mount
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // Auth
    const activeToken = getClientCookie('token');
    const activeRole = getClientCookie('user_role') as any;
    
    if (activeToken && activeRole) {
      setToken(activeToken);
      setRole(activeRole);
      
      // Fetch details to ensure token is valid and get full profile
      api.get('/auth/me', { token: activeToken })
        .then(res => {
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          } else {
            // Invalid session
            clearAuth();
          }
        })
        .catch(() => {
          clearAuth();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    eraseClientCookie('token');
    eraseClientCookie('user_role');
  };

  const login = (newToken: string, loggedInUser: any) => {
    setToken(newToken);
    setRole(loggedInUser.role);
    setUser(loggedInUser);
    
    setClientCookie('token', newToken, 7);
    setClientCookie('user_role', loggedInUser.role, 7);
    
    addToast(`Welcome back, ${loggedInUser.name}!`, 'success');
    
    // Redirect based on role
    if (loggedInUser.role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else if (loggedInUser.role === 'TECHNICIAN') {
      router.push('/dashboard/technician');
    } else {
      router.push('/dashboard/customer');
    }
  };

  const logout = () => {
    clearAuth();
    addToast('You have been logged out successfully.', 'info');
    router.push('/');
    router.refresh();
  };

  const refreshUser = async () => {
    const activeToken = token || getClientCookie('token');
    if (!activeToken) return;
    try {
      const res = await api.get('/auth/me', { token: activeToken });
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Error refreshing user profiles:', err);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      role,
      loading,
      toasts,
      addToast,
      removeToast,
      login,
      logout,
      refreshUser,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
