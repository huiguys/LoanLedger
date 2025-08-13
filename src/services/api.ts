const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No auth token found');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // --- Auth Methods ---
  async sendOTP(phoneNumber: string) { /* ... no changes ... */ }
  async verifyOTP(phoneNumber: string, otp: string) { /* ... no changes ... */ }
  async completeRegistration(phoneNumber: string, password: string) { /* ... no changes ... */ }
  async login(phoneNumber: string, password: string) { /* ... no changes ... */ }

  // NEW function to get current user's data
  async getMe() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }


  // --- Data Methods ---
  async getAllData() { /* ... no changes ... */ }
  async addPerson(person: { name: string, phoneNumber?: string }) { /* ... no changes ... */ }
  async addLoan(loan: any) { /* ... no changes ... */ }
  async addPayment(payment: any) { /* ... no changes ... */ }
}

export const apiService = new ApiService();
