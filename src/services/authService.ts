import { LoginRequest, RegisterRequest, AuthResponse, AuthError } from '@/types/auth';
const API_BASE_URL = '/api';

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/auth/${endpoint}`;
    
    console.log('AuthService: Making request to:', url);
    console.log('AuthService: Request options:', {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? 'Present' : 'None'
    });
    
    if (options.body) {
      console.log('AuthService: Request body:', options.body);
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('AuthService: Response status:', response.status);
    console.log('AuthService: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AuthService: Error response body:', errorText);
      
      let errorData: AuthError;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: 'Network error' };
      }
      
      console.error('AuthService: Parsed error data:', errorData);
      
      // Handle validation errors specifically
      if (errorData.errors && typeof errorData.errors === 'object') {
        const errors = errorData.errors as Record<string, string[]>;
        const errorMessages: string[] = [];
        
        if (errors.Password) {
          errorMessages.push(...errors.Password);
        }
        if (errors.Login) {
          errorMessages.push(...errors.Login);
        }
        
        if (errorMessages.length > 0) {
          throw new Error(errorMessages.join('. '));
        }
      }
      
      throw new Error(errorData.message || 'Something went wrong');
    }

    const text = await response.text();
    console.log('AuthService: Success response body:', text);
    
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  private normalizeAuthResponse(result: AuthResponse): { token: string } {
    console.log('AuthService: Normalizing auth response:', result);
    
    if (typeof result === 'string') {
      console.log('AuthService: Result is string, using as token');
      return { token: result };
    }
    if (result && typeof result === 'object' && 'token' in result) {
      console.log('AuthService: Result has token property');
      return { token: (result as { token: string }).token };
    }
    console.error('AuthService: Invalid auth response format:', result);
    throw new Error('Invalid auth response');
  }

  async login(credentials: LoginRequest): Promise<{ token: string }> {
    console.log('AuthService: Attempting login with credentials:', { 
      login: credentials.login, 
      passwordLength: credentials.password?.length || 0 
    });
    
    const result = await this.makeRequest<AuthResponse>('login', {
      method: 'POST',
      body: JSON.stringify({ Login: credentials.login, Password: credentials.password }),
    });
    
    console.log('AuthService: Login successful, result:', result);
    const normalizedResult = this.normalizeAuthResponse(result);
    console.log('AuthService: Normalized result:', { tokenLength: normalizedResult.token.length });
    return normalizedResult;
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
    if (!token) {
      console.log('AuthService: No token for auth check');
      return false;
    }
    
    console.log('AuthService: Checking auth with token length:', token.length);
    
    try {
      const response = await fetch('/api/auth/check-login', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      console.log('AuthService: Auth check response status:', response.status);

      if (response.status === 401) {
        console.log('AuthService: Auth check unauthorized, clearing token');
        this.logout(); // Clear invalid token
        return false;
      }

      if (!response.ok) {
        console.log('AuthService: Auth check failed with status:', response.status);
        return false;
      }

      const data = await response.json();
      console.log('AuthService: Auth check response data:', data);
      
      const isAuthenticated = data && typeof data === 'object' && data.success === true;
      console.log('AuthService: Auth check result:', isAuthenticated);
      
      return isAuthenticated;
    } catch (error) {
      console.error('AuthService: Auth check error:', error);
      // Clear invalid token
      this.logout();
      return false;
    }
  }

  async checkAdminStatus(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      console.log('AuthService: No token available for admin check')
      return false;
    }
    
    console.log('AuthService: Starting admin status check')
    console.log('AuthService: Token length:', token.length)
    
    try {
      const response = await fetch('/api/auth/check-admin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      console.log('AuthService: Admin check response status:', response.status)

      if (response.status === 401) {
        console.log('AuthService: Unauthorized - clearing token')
        this.logout(); // Clear invalid token
        return false;
      }

      if (!response.ok) {
        console.log('AuthService: Admin check failed with status:', response.status)
        return false;
      }

      const data = await response.json();
      console.log('AuthService: Admin check response data:', data)
      
      const isAdmin = data && typeof data === 'object' && data.isAdmin === true;
      console.log('AuthService: Is admin result:', isAdmin)
      
      return isAdmin;
    } catch (error) {
      console.error('AuthService: Admin check error:', error)
      return false;
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      console.log('AuthService: Setting token, length:', token.length);
      localStorage.setItem('auth_token', token);
      console.log('AuthService: Token saved to localStorage');
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      console.log('AuthService: Getting token, present:', !!token, 'length:', token?.length);
      return token;
    }
    return null;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      console.log('AuthService: Logging out, clearing localStorage');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_display_name');
      console.log('AuthService: Logout completed');
    }
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    console.log('AuthService: isAuthenticated check:', hasToken);
    return hasToken;
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