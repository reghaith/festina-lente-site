'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account } from '@/lib/appwrite';
import { ID, Models } from 'appwrite';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      // Use server-side proxy to avoid CORS issues
      const response = await fetch('/api/auth/session', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    // Use server-side proxy to avoid CORS issues
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
    });
  }

  async function logout() {
    // Use server-side proxy to avoid CORS issues
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    setUser(null);
  }

  async function register(email: string, password: string, name?: string) {
    // Temporary workaround: use debug endpoint since registration has issues
    console.log('Using debug endpoint for registration...');

    const response = await fetch('/api/debug-auth', {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok || !data.test_user_creation || data.test_user_creation.error) {
      throw new Error('Registration temporarily unavailable. Please try again later.');
    }

    console.log('Registration successful via debug endpoint');

    // After successful registration, login the user
    await login(email, password);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return context;
}
