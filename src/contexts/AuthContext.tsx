import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (mobileNumber: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (mobileNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (mobileNumber: string, otp: string) => Promise<{ success: boolean; message: string }>;
  sendOTP: (mobileNumber: string) => Promise<{ success: boolean; message: string }>;
  setPassword: (password: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (mobileNumber: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const response = await apiService.getProfile();
        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          // Token might be expired, try to refresh
          const refreshResponse = await apiService.refreshAccessToken();
          if (refreshResponse.success) {
            const profileResponse = await apiService.getProfile();
            if (profileResponse.success && profileResponse.data) {
              setUser(profileResponse.data.user);
            }
          } else {
            // Clear invalid tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    setIsLoading(false);
  };

  const login = async (mobileNumber: string, password: string) => {
    try {
      const response = await apiService.login(mobileNumber, password);
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (mobileNumber: string) => {
    try {
      const response = await apiService.register(mobileNumber);
      return { success: response.success, message: response.message };
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const verifyOTP = async (mobileNumber: string, otp: string) => {
    try {
      const response = await apiService.verifyOTP(mobileNumber, otp);
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'OTP verification failed. Please try again.' };
    }
  };

  const sendOTP = async (mobileNumber: string) => {
    try {
      const response = await apiService.sendOTP(mobileNumber);
      return { success: response.success, message: response.message };
    } catch (error) {
      return { success: false, message: 'Failed to send OTP. Please try again.' };
    }
  };

  const setPassword = async (password: string) => {
    try {
      const response = await apiService.setPassword(password);
      return { success: response.success, message: response.message };
    } catch (error) {
      return { success: false, message: 'Failed to set password. Please try again.' };
    }
  };

  const resetPassword = async (mobileNumber: string, otp: string, newPassword: string) => {
    try {
      const response = await apiService.resetPassword(mobileNumber, otp, newPassword);
      return { success: response.success, message: response.message };
    } catch (error) {
      return { success: false, message: 'Password reset failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    verifyOTP,
    sendOTP,
    setPassword,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};