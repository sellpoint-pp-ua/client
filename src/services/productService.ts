import logger from '../lib/logger';
import { Product, ProductInput, ProductListResponse, ProductUpdateInput } from '@/types/product';

const API_BASE_URL = 'https://api.sellpoint.pp.ua';

class ProductService {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) throw new Error('No authentication token available');
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    logger.info('ProductService: Request', { url, method: options.method || 'GET' });
    const res = await fetch(url, options);
    logger.info('ProductService: Status', res.status);
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 404) {
        logger.info('ProductService: 404 response (expected for some endpoints)', text);
      } else {
        logger.error('ProductService: Error body', text);
      }
      try {
        const parsed = JSON.parse(text);
        throw new Error(parsed?.message || res.statusText || 'Request failed');
      } catch {
        throw new Error(text || res.statusText || 'Request failed');
      }
    }
    const text = await res.text();
    try { logger.info('ProductService: Success body', text?.slice(0, 1000)); } catch {}
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  async getAll(): Promise<Product[] | ProductListResponse> {
    return this.request<Product[] | ProductListResponse>('/api/Product/get-all', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({}),
    });
  }

  async getById(id: string): Promise<Product> {
    return this.request<Product>(`/api/Product/get-by-id/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getByName(name: string): Promise<Product[] | ProductListResponse> {
    return this.request<Product[] | ProductListResponse>(`/api/Product/get-by-name/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({}),
    });
  }

  async getBySellerId(sellerId: string, payload?: Record<string, unknown>): Promise<Product[] | ProductListResponse> {
    const body = payload ?? {};
    return this.request<Product[] | ProductListResponse>(`/api/Product/get-by-seller-id/${encodeURIComponent(sellerId)}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });
  }

  async create(product: ProductInput): Promise<Product> {
    const response = await this.request<any>('/api/Product', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product),
    });
    
    logger.info('ProductService: Create response', response);
    console.log('ProductService: Full create response:', JSON.stringify(response, null, 2));
    
    if (response && typeof response === 'object') {
      if (response.id) {
        console.log('ProductService: Found ID in response.id:', response.id);
        return response as Product;
      } else if (response.data && response.data.id) {
        console.log('ProductService: Found ID in response.data.id:', response.data.id);
        return response.data as Product;
      } else if (response.product && response.product.id) {
        console.log('ProductService: Found ID in response.product.id:', response.product.id);
        return response.product as Product;
      } else if (response.result && response.result.id) {
        console.log('ProductService: Found ID in response.result.id:', response.result.id);
        return response.result as Product;
      } else if (response.item && response.item.id) {
        console.log('ProductService: Found ID in response.item.id:', response.item.id);
        return response.item as Product;
      } else {
        console.log('ProductService: No ID found in response structure:', Object.keys(response));
        console.log('ProductService: Response values:', Object.values(response));
        
        for (const [key, value] of Object.entries(response)) {
          if (value && typeof value === 'object' && 'id' in value) {
            console.log(`ProductService: Found nested ID in response.${key}.id:`, (value as any).id);
            return value as Product;
          }
        }
      }
    }
    
    console.log('ProductService: Returning response as-is:', response);
    return response as Product;
  }

  async update(product: ProductUpdateInput): Promise<Product> {
    const response = await this.request<any>('/api/Product', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product),
    });
    
    logger.info('ProductService: Update response', response);
    
    if (response && typeof response === 'object') {
      if (response.id) {
        return response as Product;
      } else if (response.data && response.data.id) {
        return response.data as Product;
      } else if (response.product && response.product.id) {
        return response.product as Product;
      }
    }
    
    return response as Product;
  }

  async addMedia(productId: string, files: File[]): Promise<any> {
    if (!files || files.length === 0) return { success: true };
    const token = this.getToken();
    if (!token) throw new Error('No authentication token available');

    const form = new FormData();
    
    files.forEach((f, idx) => {
      form.append('files', f, f.name || `file_${idx}`);
      
      const isVideo = f.type.startsWith('video/') || 
        /\.(mp4|webm|mov|avi|mkv|m4v|ogg)$/i.test(f.name);
      
      if (isVideo) {
        form.append('type', '1'); 
      } else {
        form.append('type', '0'); 
      }
    });
    
    const url = `${API_BASE_URL}/api/ProductMedia/many?productId=${encodeURIComponent(productId)}`;
    
    try {
      console.log('ProductService: Starting media upload...');
      console.log('ProductService: URL:', url);
      console.log('ProductService: ProductId:', productId);
      console.log('ProductService: Files:', files.map(f => ({ 
        name: f.name, 
        size: f.size, 
        type: f.type,
        isVideo: f.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv|m4v|ogg)$/i.test(f.name)
      })));
      
      logger.info('ProductService: Uploading media via PUT /api/ProductMedia/many', { 
        productId, 
        fileCount: files.length,
        fileNames: files.map(f => f.name)
      });
      
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });
      
      const responseText = await res.text();
      console.log('ProductService: Media upload response status:', res.status);
      console.log('ProductService: Media upload response body:', responseText);
      
      logger.info('ProductService: Media upload response', { 
        status: res.status, 
        body: responseText?.slice(0, 500) 
      });
      
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} - ${responseText}`);
      }
      
      console.log('ProductService: Media upload successful');
      return { success: true };
    } catch (e) {
      console.error('ProductService: Media upload error:', e);
      logger.error('ProductService: Media upload failed', e as any);
      throw e;
    }
  }

  async delete(id: string): Promise<any> {
    const params = new URLSearchParams({ id });
    return this.request<any>(`/api/Product?${params.toString()}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  async search(name: string): Promise<any> {
    const params = new URLSearchParams({ name });
    return this.request<any>(`/api/Product/search?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async random(): Promise<any> {
    return this.request<any>('/api/Product/random', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }
}

export const productService = new ProductService();


