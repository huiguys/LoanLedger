const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface User {
  id: string;
  mobileNumber: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Authentication methods
  async register(mobileNumber: string): Promise<ApiResponse<{ userId: string; mobileNumber: string; otpExpiry: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  }

  async sendOTP(mobileNumber: string): Promise<ApiResponse<{ mobileNumber: string; otpExpiry: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Failed to send OTP' };
    }
  }

  async verifyOTP(mobileNumber: string, otp: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ mobileNumber, otp }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.tokens) {
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      }
      
      return data;
    } catch (error) {
      return { success: false, message: 'OTP verification failed' };
    }
  }

  async login(mobileNumber: string, password: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ mobileNumber, password }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.tokens) {
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      }
      
      return data;
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  }

  async setPassword(password: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Failed to set password' };
    }
  }

  async resetPassword(mobileNumber: string, otp: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ mobileNumber, otp, newPassword }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Password reset failed' };
    }
  }

  async refreshAccessToken(): Promise<ApiResponse<{ tokens: AuthTokens }>> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return { success: false, message: 'No refresh token available' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.tokens) {
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      }
      
      return data;
    } catch (error) {
      return { success: false, message: 'Token refresh failed' };
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      const data = await response.json();
      return data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return { success: false, message: 'Logout failed' };
    }
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Failed to get profile' };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Get current tokens
  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
  }
}

export const apiService = new ApiService();