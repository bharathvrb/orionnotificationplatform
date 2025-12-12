import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User, AuthTokens } from '../services/auth';
import {
  getStoredAuth,
  storeAuth,
  clearAuth,
  login as authLogin,
  getValidAccessToken,
} from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: storedUser, tokens } = getStoredAuth();
        
        if (storedUser && tokens) {
          // Check if token is expired
          const validToken = await getValidAccessToken();
          if (validToken) {
            setUser(storedUser);
          } else {
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { user: userInfo, tokens } = await authLogin(username, password);
      
      storeAuth(userInfo, tokens);
      setUser(userInfo);
      
      // Redirect to original destination or home
      const returnTo = sessionStorage.getItem('return_to') || '/';
      sessionStorage.removeItem('return_to');
      navigate(returnTo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setError(null);
    navigate('/login');
  };

  const getAccessToken = async (): Promise<string | null> => {
    return await getValidAccessToken();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getAccessToken,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
