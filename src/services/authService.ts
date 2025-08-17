import { LoginRequest, RegisterRequest, AuthResponse, AuthError } from '@/types/auth';
const API_BASE_URL = '/api';

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/auth/${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: AuthError = await response.json().catch(() => ({ 
        message: 'Network error' 
      }));
      throw new Error(errorData.message || 'Something went wrong');
    }

    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  private normalizeAuthResponse(result: AuthResponse): { token: string } {
    if (typeof result === 'string') {
      return { token: result };
    }
    if (result && typeof result === 'object' && 'token' in result) {
      return { token: (result as { token: string }).token };
    }
    throw new Error('Invalid auth response');
  }

  async login(credentials: LoginRequest): Promise<{ token: string }> {
    const result = await this.makeRequest<AuthResponse>('login', {
      method: 'POST',
      body: JSON.stringify({ login: credentials.login, password: credentials.password }),
    });
    return this.normalizeAuthResponse(result);
  }

  async register(userData: RegisterRequest): Promise<{ token: string }> {
    const result = await this.makeRequest<AuthResponse>('register', {
      method: 'POST',
      body: JSON.stringify({ fullName: userData.fullName, email: userData.email, password: userData.password }),
    });
    return this.normalizeAuthResponse(result);
  }

  async checkAuth(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;
    try {
      await this.makeRequest('check-login', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch {
    }
    return true;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_display_name');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async sendVerificationCode(language: string = 'uk'): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');
    await this.makeRequest(`send-email-verification-code?language=${encodeURIComponent(language)}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }

  async verifyEmailCode(code: string): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');
    await this.makeRequest(`verify-email-code?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }

  async serverLogout(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return;
    }
    try {
      await this.makeRequest('logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } finally {
      this.logout();
    }
  }
}

export const authService = new AuthService(); 