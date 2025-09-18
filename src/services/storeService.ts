import { StoreCreateRequest, StoreRequest, Store, StoreResponse, StoreListResponse } from '@/types/store';
import logger from '../lib/logger';

const API_BASE_URL = 'https://api.sellpoint.pp.ua';

class StoreService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    logger.info('StoreService: Making request to:', url);
    logger.info('StoreService: Request options:', {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? 'Present' : 'None'
    });
    
    const response = await fetch(url, {
      ...options,
    });

    logger.info('StoreService: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('StoreService: Error response body:', errorText);
      
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
    logger.info('StoreService: Success response body:', text);
    
    try {
      const parsed = JSON.parse(text);
      logger.info('StoreService: Parsed response:', parsed);
      return parsed as T;
    } catch {
      logger.info('StoreService: Could not parse JSON, returning text');
      return text as unknown as T;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
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

  async createStore(storeData: StoreCreateRequest): Promise<StoreResponse> {
    const formData = new FormData();
    formData.append('Name', storeData.name);
    formData.append('Plan', storeData.plan.toString());
    
    if (storeData.file) {
      formData.append('File', storeData.file);
    }

    return this.makeRequest<StoreResponse>('/api/Store/CreateStore', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });
  }



  async deleteStore(storeId: string): Promise<StoreResponse> {
    return this.makeRequest<StoreResponse>(`/api/Store/DeleteStore?storeId=${storeId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  async getAllRequests(): Promise<StoreListResponse> {
    return this.makeRequest<StoreListResponse>('/api/Store/GetAllRequests', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getRequestsByUserId(userId: string): Promise<StoreListResponse> {
    return this.makeRequest<StoreListResponse>(`/api/Store/GetRequestsByUserId/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getRequestById(requestId: string): Promise<StoreResponse> {
    return this.makeRequest<StoreResponse>(`/api/Store/GetRequestById/${requestId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getRequestApprovedByAdminId(adminId: string): Promise<StoreListResponse> {
    return this.makeRequest<StoreListResponse>(`/api/Store/GetRequestApprovedByAdminId/${adminId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getRequestRejectedByAdminId(adminId: string): Promise<StoreListResponse> {
    return this.makeRequest<StoreListResponse>(`/api/Store/GetRequestRejectedByAdminId/${adminId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getRequestByMyId(): Promise<StoreRequest[]> {
    try {
      const requestsResponse = await this.makeRequest<StoreListResponse>('/api/Store/GetRequestByMyId', {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      console.log('Raw requests response:', requestsResponse);

      let requests: StoreRequest[] = [];
      if (Array.isArray(requestsResponse)) {
        requests = requestsResponse as StoreRequest[];
      } else if (requestsResponse && typeof requestsResponse === 'object') {
        if (requestsResponse.success && requestsResponse.data) {
          requests = requestsResponse.data as StoreRequest[];
        } else if ('id' in requestsResponse && requestsResponse.id) {
          const r = requestsResponse as any;
          requests = [{
            id: r.id ?? '',
            name: r.name ?? '',
            plan: r.plan ?? 0,
            userId: r.userId ?? '',
            status: r.status ?? 'pending',
            createdAt: r.createdAt ?? '',
            updatedAt: r.updatedAt,
            adminId: r.adminId,
            adminComment: r.adminComment,
            fileUrl: r.fileUrl,
            approvedByAdminId: r.approvedByAdminId,
            rejectedByAdminId: r.rejectedByAdminId,
            avatar: r.avatar,
          }];
        }
      }
      return requests;
    } catch (error) {
      console.error('Error fetching user requests:', error);
      return [];
    }
  }

  async getRequestApprovedByMyId(): Promise<StoreListResponse> {
    return this.makeRequest<StoreListResponse>('/api/Store/GetRequestApprovedByMyId', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getRequestRejectedByMyId(): Promise<StoreListResponse> {
    return this.makeRequest<StoreListResponse>('/api/Store/GetRequestRejectedByMyId', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async approveRequest(requestId: string): Promise<StoreResponse> {
    return this.makeRequest<StoreResponse>(`/api/Store/ApproveRequest?requestId=${requestId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
  }

  async rejectRequest(requestId: string, reason?: string): Promise<StoreResponse> {
    return this.makeRequest<StoreResponse>(`/api/Store/RejectRequest?requestId=${requestId}&reason=${encodeURIComponent(reason || 'Не вказано причину')}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
  }

  async getStoreById(storeId: string): Promise<StoreResponse> {
    return this.makeRequest<StoreResponse>(`/api/Store/GetStoreById?storeId=${encodeURIComponent(storeId)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getStores(): Promise<StoreListResponse> {
    return this.makeRequest<StoreListResponse>('/api/Store/GetStores', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getMyStores(): Promise<StoreListResponse> {
    return this.makeRequest<StoreListResponse>('/api/Store/GetStores', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  // Store members management
  async getStoreMembers(storeId: string): Promise<any> {
    return this.makeRequest<any>(`/api/Store/GetStoreMembers?storeId=${encodeURIComponent(storeId)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async getStoreMembersByMyId(): Promise<any> {
    return this.makeRequest<any>('/api/Store/GetStoreMembersByMyId', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async addMemberToStore(memberId: string, role: number = 1): Promise<any> {
    // role: 1 => Manager
    const params = new URLSearchParams({ memberId, role: String(role) });
    return this.makeRequest<any>(`/api/Store/AddMemberToStore?${params.toString()}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });
  }

  async removeMemberFromStore(memberId: string): Promise<any> {
    const params = new URLSearchParams({ memberId });
    return this.makeRequest<any>(`/api/Store/RemoveMemberFromStore?${params.toString()}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.makeRequest<any>('/api/User/GetUserByMyId', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async deleteStoreRequest(requestId: string): Promise<StoreResponse> {
    return this.makeRequest<StoreResponse>(`/api/Store/DeleteRequest?id=${requestId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  async updateStoreRequest(requestId: string, requestData: any): Promise<StoreResponse> {
    return this.makeRequest<StoreResponse>('/api/Store/UpdateRequest', {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: requestId,
        name: requestData.name,
        plan: requestData.plan || 0
      }),
    });
  }

}

export const storeService = new StoreService();
