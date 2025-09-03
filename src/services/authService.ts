import { LoginRequest, RegisterRequest, AuthResponse, AuthError } from '@/types/auth';
import logger from '../lib/logger'
const API_BASE_URL = '/api';

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/auth/${endpoint}`;
    
    logger.info('AuthService: Making request to:', url)
    logger.info('AuthService: Request options:', {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? 'Present' : 'None'
    })
    
    if (options.body) {
      logger.info('AuthService: Request body:', options.body)
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

  logger.info('AuthService: Response status:', response.status)
  logger.info('AuthService: Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text();
  logger.error('AuthService: Error response body:', errorText)
      
      let errorData: AuthError;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: 'Network error' };
      }
      
  logger.error('AuthService: Parsed error data:', errorData)
      
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
  logger.info('AuthService: Success response body:', text)
    
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  private normalizeAuthResponse(result: AuthResponse): { token: string } {
  logger.info('AuthService: Normalizing auth response:', result)
    
    if (typeof result === 'string') {
  logger.info('AuthService: Result is string, using as token')
      return { token: result };
    }
    if (result && typeof result === 'object' && 'token' in result) {
  logger.info('AuthService: Result has token property')
      return { token: (result as { token: string }).token };
    }
  logger.error('AuthService: Invalid auth response format:', result)
    throw new Error('Invalid auth response');
  }

  async login(credentials: LoginRequest): Promise<{ token: string }> {
    logger.info('AuthService: Attempting login with credentials:', { 
      login: credentials.login, 
      passwordLength: credentials.password?.length || 0 
    })
    
    const result = await this.makeRequest<AuthResponse>('login', {
      method: 'POST',
      body: JSON.stringify({ Login: credentials.login, Password: credentials.password }),
    });
    
  logger.info('AuthService: Login successful, result:', result)
    const normalizedResult = this.normalizeAuthResponse(result);
  logger.info('AuthService: Normalized result:', { tokenLength: normalizedResult.token.length })
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
  logger.info('AuthService: No token for auth check')
      return false;
    }
    
  logger.info('AuthService: Checking auth with token length:', token.length)
    
    try {
      const response = await fetch('/api/auth/check-login', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

  logger.info('AuthService: Auth check response status:', response.status)

      if (response.status === 401) {
  logger.info('AuthService: Auth check unauthorized, clearing token')
        this.logout(); // Clear invalid token
        return false;
      }

      if (!response.ok) {
  logger.info('AuthService: Auth check failed with status:', response.status)
        return false;
      }

      const data = await response.json();
  logger.info('AuthService: Auth check response data:', data)
      
      const isAuthenticated = data && typeof data === 'object' && data.success === true;
  logger.info('AuthService: Auth check result:', isAuthenticated)
      
      return isAuthenticated;
    } catch (error) {
  logger.error('AuthService: Auth check error:', error)
      // Clear invalid token
      this.logout();
      return false;
    }
  }

  async checkAdminStatus(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      logger.info('AuthService: No token available for admin check')
      return false
    }
    
    logger.info('AuthService: Starting admin status check')
    logger.info('AuthService: Token length:', token.length)
    
    try {
      const response = await fetch('/api/auth/check-admin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

  logger.info('AuthService: Admin check response status:', response.status)

      if (response.status === 401) {
        logger.info('AuthService: Unauthorized - clearing token')
        this.logout(); // Clear invalid token
        return false
      }

      if (!response.ok) {
        logger.info('AuthService: Admin check failed with status:', response.status)
        return false
      }

      const data = await response.json()
      logger.info('AuthService: Admin check response data:', data)
      
      const isAdmin = data && typeof data === 'object' && data.isAdmin === true
      logger.info('AuthService: Is admin result:', isAdmin)
      
      return isAdmin
    } catch (error) {
      console.error('AuthService: Admin check error:', error)
      return false;
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      logger.info('AuthService: Setting token, length:', token.length)
      localStorage.setItem('auth_token', token)
      logger.info('AuthService: Token saved to localStorage')
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      logger.info('AuthService: Getting token, present:', !!token, 'length:', token?.length)
      return token
    }
    return null;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      logger.info('AuthService: Logging out, clearing localStorage')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_display_name')
      logger.info('AuthService: Logout completed')
    }
  }

  isAuthenticated(): boolean {
  const hasToken = !!this.getToken()
  logger.info('AuthService: isAuthenticated check:', hasToken)
  return hasToken
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