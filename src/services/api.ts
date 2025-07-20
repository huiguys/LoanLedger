const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  // Helper function to handle API responses
  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Starts the registration process by sending an OTP
  async sendOTP(phoneNumber: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    return this.handleResponse(response);
  }

  // Verifies the OTP
  async verifyOTP(phoneNumber: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, otp }),
    });
    return this.handleResponse(response);
  }

  // Completes registration by setting the password
  async completeRegistration(phoneNumber: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password }),
    });
    return this.handleResponse(response);
  }

  // Handles user login
  async login(phoneNumber: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password }),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();