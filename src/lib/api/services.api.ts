import { apiClient, ApiResponse, PaginatedResponse } from './client';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'haircut' | 'beard_trim' | 'hair_wash' | 'styling' | 'coloring' | 'treatment' | 'package';
  price: number;
  duration: number;
  isActive: boolean;
  isPopular: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  isActive?: boolean;
  isPopular?: boolean;
  image?: string;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  duration?: number;
  isActive?: boolean;
  isPopular?: boolean;
}

export interface ServiceFilters {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
  isPopular?: boolean;
  search?: string;
}

class ServicesAPI {
  async getAll(filters?: ServiceFilters): Promise<PaginatedResponse<Service>> {
    return apiClient.get<Service[]>('/services', { params: filters });
  }

  async getById(id: string): Promise<ApiResponse<Service>> {
    return apiClient.get<Service>(`/services/${id}`);
  }

  async create(data: CreateServiceRequest): Promise<ApiResponse<Service>> {
    return apiClient.post<Service>('/services', data);
  }

  async update(id: string, data: UpdateServiceRequest): Promise<ApiResponse<Service>> {
    return apiClient.put<Service>(`/services/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/services/${id}`);
  }

  async toggleActive(id: string): Promise<ApiResponse<Service>> {
    return apiClient.patch<Service>(`/services/${id}/toggle-active`);
  }

  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    return apiClient.uploadFile<{ url: string }>('/upload/image', file);
  }
}

export const servicesAPI = new ServicesAPI();
export default servicesAPI;
