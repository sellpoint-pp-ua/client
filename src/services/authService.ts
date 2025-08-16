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

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('login', {
      method: 'POST',
      body: JSON.stringify({ login: credentials.login, password: credentials.password }),
    })
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('register', {
      method: 'POST',
      body: JSON.stringify({ fullName: userData.fullName, email: userData.email, password: userData.password }),
    })
  }

  async checkAuth(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      await this.makeRequest('check-login', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return true;
    } catch {
      this.logout();
      return false;
    }
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
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService(); 