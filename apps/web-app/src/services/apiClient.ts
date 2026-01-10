// API Client for REST API (replacement for Firebase)
// Use VITE_API_URL from env, or try to detect the correct backend URL

import { ApiSubscription, ApiInsurance, ApiLoan, ApiAI, ApiUser } from '~/types/api';
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If frontend is not on localhost, backend is likely on the same IP
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:3015/api`;
  }
  return 'http://localhost:3015/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    // Clerk manages tokens automatically, but we keep this for compatibility
    if (token && typeof window !== 'undefined') {
      // Token is managed by Clerk, but we can store it for API calls
      // Clerk token is automatically included in requests via Clerk SDK
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Use token set by AuthChecker (from Clerk)
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    termsAndPrivacyPolicy: boolean;
    lang?: string;
    timezone?: string;
    ip?: string;
    phoneNumber?: string;
  }) {
    const result = await this.request<{ success: boolean; user: ApiUser; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ success: boolean; user: ApiUser; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async getCurrentUser() {
    return this.request<Record<string, unknown>>('/users/me');
  }

  async updateUser(data: Partial<Record<string, unknown>>) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Subscriptions
  async getSubscriptions() {
    return this.request<ApiSubscription[]>('/subscriptions');
  }

  async createSubscription(data: Partial<ApiSubscription>) {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubscription(id: string, data: Partial<ApiSubscription>) {
    return this.request(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubscription(id: string) {
    return this.request(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  // Insurances
  async getInsurances() {
    return this.request<ApiInsurance[]>('/insurances');
  }

  async createInsurance(data: Partial<ApiInsurance>) {
    return this.request('/insurances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInsurance(id: string, data: Partial<ApiInsurance>) {
    return this.request(`/insurances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInsurance(id: string) {
    return this.request(`/insurances/${id}`, {
      method: 'DELETE',
    });
  }

  // Loans
  async getLoans() {
    return this.request<ApiLoan[]>('/loans');
  }

  async createLoan(data: Partial<ApiLoan>) {
    return this.request('/loans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLoan(id: string, data: Partial<ApiLoan>) {
    return this.request(`/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLoan(id: string) {
    return this.request(`/loans/${id}`, {
      method: 'DELETE',
    });
  }

  // AI
  async getAI() {
    return this.request<ApiAI[]>('/ai');
  }

  async createAI(data: Partial<ApiAI>) {
    return this.request('/ai', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAI(id: string, data: Partial<ApiAI>) {
    return this.request(`/ai/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAI(id: string) {
    return this.request(`/ai/${id}`, {
      method: 'DELETE',
    });
  }

  // API Tokens
  async getApiTokens() {
    // TODO: Implement when endpoint is available
    // return this.request('/api-tokens');
    return [];
  }

  // Notifications
  async getNotifications(onlyUnread = false) {
    // TODO: Implement when endpoint is available
    // return this.request(`/notifications${onlyUnread ? '?status=unread' : ''}`);
    return [];
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

