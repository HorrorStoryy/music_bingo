import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getCurrentUser, login as loginUser, register as registerUser, logout as logoutUser, ensureDefaultAdmin, createDemoPlaylists } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => User | null;
  register: (username: string, password: string, displayName: string, role?: 'admin' | 'player') => User | null;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize default admin and demo playlists
    ensureDefaultAdmin();
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // Create demo playlists if this is the first admin
      createDemoPlaylists(currentUser.id);
    }
  }, []);

  const login = (username: string, password: string): User | null => {
    const loggedIn = loginUser(username, password);
    if (loggedIn) {
      setUser(loggedIn);
      createDemoPlaylists(loggedIn.id);
    }
    return loggedIn;
  };

  const register = (username: string, password: string, displayName: string, role: 'admin' | 'player' = 'player'): User | null => {
    const newUser = registerUser(username, password, displayName, role);
    if (newUser) {
      setUser(newUser);
    }
    return newUser;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
