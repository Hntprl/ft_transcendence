import { createContext, useCallback, useEffect, useState } from 'react';
import type { AuthContextType, User, LoginDto, RegisterDto } from '../types/auth.types';
import { loginApi, registerApi, logoutApi, getMeApi, loginWithGoogleApi } from '../api/auth.api';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      const userData = await getMeApi();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginDto) => {
    try {
      await loginApi(data);
      const userData = await getMeApi();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async (token: string) => {
    try {
      await loginWithGoogleApi(token);
      const userData = await getMeApi();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterDto) => {
    try {
      await registerApi(data);
      const userData = await getMeApi();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Register failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, checkAuth, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
