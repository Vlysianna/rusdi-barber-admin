import { apiClient, ApiResponse, PaginatedResponse } from './client';

export interface Stylist {
  id: string;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  name?: string;
  phoneNumber?: string;
  photoUrl?: string;
  specialties: string[];
  specialization?: string;
  experience: number;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  revenue: number;
  commissionRate: number;
  isAvailable: boolean;
  isActive?: boolean;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStylistRequest {
  userId: string;
  specialties: string[];
  experience: number;
  commissionRate: number;
  bio?: string;
}

export interface UpdateStylistRequest {
  specialties?: string[];
  experience?: number;
  commissionRate?: number;
  isAvailable?: boolean;
  bio?: string;
}

export interface StylistFilters {
  page?: number;
  limit?: number;
  isAvailable?: boolean;
  specialty?: string;
  search?: string;
}

class StylistsAPI {
  async getAll(filters?: StylistFilters): Promise<PaginatedResponse<Stylist>> {
    return apiClient.get<Stylist[]>('/stylists', { params: filters });
  }

  async getById(id: string): Promise<ApiResponse<Stylist>> {
    return apiClient.get<Stylist>(`/stylists/${id}`);
  }

  async create(data: CreateStylistRequest): Promise<ApiResponse<Stylist>> {
    return apiClient.post<Stylist>('/stylists', data);
  }

  async update(id: string, data: UpdateStylistRequest): Promise<ApiResponse<Stylist>> {
    return apiClient.put<Stylist>(`/stylists/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/stylists/${id}`);
  }

  async toggleAvailability(id: string): Promise<ApiResponse<Stylist>> {
    return apiClient.patch<Stylist>(`/stylists/${id}/toggle-availability`);
  }

  async getSchedule(id: string, date: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/stylists/${id}/schedule`, { params: { date } });
  }
}

export const stylistsAPI = new StylistsAPI();
export default stylistsAPI;
