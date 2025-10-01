import logger from '../lib/logger';

const API_BASE_URL = 'https://api.sellpoint.pp.ua';

class UserService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    logger.info('UserService: Making request to:', url);
    logger.info('UserService: Request options:', {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? 'Present' : 'None'
    });
    
    const response = await fetch(url, {
      ...options,
    });

    logger.info('UserService: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('UserService: Error response body:', errorText);
      
      try {
        const parsed = JSON.parse(errorText);
        const message = (parsed && parsed.message) ? parsed.message : response.statusText || 'Request failed';
        throw new Error(message);
      } catch {
        const message = errorText?.trim().length ? errorText : (response.statusText || 'Request failed');
        throw new Error(message);
      }
    }

    const text = await response.text();
    logger.info('UserService: Success response body:', text);
    
    try {
      const parsed = JSON.parse(text);
      logger.info('UserService: Parsed response:', parsed);
      return parsed as T;
    } catch {
      logger.info('UserService: Could not parse JSON, returning text');
      return text as unknown as T;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      logger.error('UserService: No authentication token available');
      throw new Error('No authentication token available');
    }
    logger.info('UserService: Using token for auth, length:', token.length);
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  async getUserById(userId: string): Promise<any> {
    return this.makeRequest<any>(`/api/User/GetUserById?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.makeRequest<any>('/api/User/GetUserByMyId', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }
}

export const userService = new UserService();
