import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getSession, onAuthStateChange } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  setAuth: (user: User | null, accessToken: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    getSession().then((session) => {
      if (session) {
        setUser(session.user);
        setAccessToken(session.accessToken);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user, token) => {
      setUser(user);
      setAccessToken(token);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const setAuth = (user: User | null, accessToken: string | null) => {
    setUser(user);
    setAccessToken(accessToken);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
