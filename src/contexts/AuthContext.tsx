import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

// Define the shape of the context state
interface AuthContextType {
  isAuthenticated: boolean;
  user: any; // You can define a proper user type later
  login: (phoneNumber: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  // Functions for the multi-step registration
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  completeRegistration: (phoneNumber: string, password: string) => Promise<{ success: boolean; message?: string; token?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // Check for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Here you would typically verify the token with the backend
      // For simplicity, we'll just assume it's valid if it exists.
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (phoneNumber: string, password: string) => {
    try {
      const data = await apiService.login(phoneNumber, password);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        setIsAuthenticated(true);
        // You might want to fetch user data here
        return { success: true };
      }
      return { success: false, message: 'Login failed: No token received.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  const sendOTP = async (phoneNumber: string) => {
    try {
      await apiService.sendOTP(phoneNumber);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to send OTP.' };
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    try {
      await apiService.verifyOTP(phoneNumber, otp);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'OTP verification failed.' };
    }
  };
  
  const completeRegistration = async (phoneNumber: string, password: string) => {
    try {
      const data = await apiService.completeRegistration(phoneNumber, password);
      // The backend returns a token upon successful registration completion
      if (data.token) {
        // You can choose to log the user in directly or have them log in manually
        // For now, we just confirm success.
        return { success: true, token: data.token };
      }
      return { success: false, message: 'Registration failed to complete.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed.' };
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    sendOTP,
    verifyOTP,
    completeRegistration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};