import React, { createContext, useContext, useState } from 'react';

interface AuthUser {
  id: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Dummy default user so the dashboard is reachable during Phase 2 (no real auth yet).
const DEFAULT_USER: AuthUser = { id: 'u-1', name: 'Isha', role: 'ADMIN' };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_USER);

  const login = (u: AuthUser) => setUser(u);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
