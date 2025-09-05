export interface StoreCreateRequest {
  name: string;
  plan: number;
  file?: File;
}

export interface StoreRequest {
  id: string;
  name: string;
  plan: number;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  adminId?: string;
  adminComment?: string;
  fileUrl?: string;
  approvedByAdminId?: string;
  rejectedByAdminId?: string;
  avatar?: {
    sourceFileName: string;
    compressedFileName: string;
    sourceUrl: string;
    compressedUrl: string;
  };
}

export interface Store {
  id: string;
  name: string;
  plan: number;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  fileUrl?: string;
  avatar?: {
    sourceFileName: string;
    compressedFileName: string;
    sourceUrl: string;
    compressedUrl: string;
  };
  roles?: Record<string, number>;
}

export interface StoreResponse {
  success: boolean;
  message?: string;
  data?: Store | StoreRequest;
}

export interface StoreListResponse {
  success: boolean;
  data?: Store[] | StoreRequest[];
  message?: string;
}
