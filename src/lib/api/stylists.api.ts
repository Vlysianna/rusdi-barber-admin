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

export interface StylistSchedule {
  id: string;
  stylistId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStylistRequest {
  // Option 1: Use existing user
  userId?: string;
  // Option 2: Create new user
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  // Stylist data
  specialties?: string[];
  experience?: number;
  commissionRate?: number;
  bio?: string;
  schedule?: {
    [key: string]: {
      isWorking: boolean;
      startTime: string;
      endTime: string;
    };
  };
  isAvailable?: boolean;
}

export interface UpdateStylistRequest {
  specialties?: string[];
  experience?: number;
  commissionRate?: number;
  isAvailable?: boolean;
  bio?: string;
  schedule?: {
    [key: string]: {
      isWorking: boolean;
      startTime: string;
      endTime: string;
    };
  };
}

export interface StylistFilters {
  page?: number;
  limit?: number;
  isAvailable?: boolean;
  specialty?: string;
  search?: string;
}

export interface AddScheduleRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

export interface UpdateScheduleRequest {
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
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

  // Schedule management
  async getSchedule(id: string): Promise<ApiResponse<StylistSchedule[]>> {
    return apiClient.get<StylistSchedule[]>(`/stylists/${id}/schedules`);
  }

  async addSchedule(id: string, data: AddScheduleRequest): Promise<ApiResponse<StylistSchedule>> {
    return apiClient.post<StylistSchedule>(`/stylists/${id}/schedules`, data);
  }

  async updateSchedule(id: string, scheduleId: string, data: UpdateScheduleRequest): Promise<ApiResponse<StylistSchedule>> {
    return apiClient.put<StylistSchedule>(`/stylists/${id}/schedules/${scheduleId}`, data);
  }

  async deleteSchedule(id: string, scheduleId: string): Promise<ApiResponse> {
    return apiClient.delete(`/stylists/${id}/schedules/${scheduleId}`);
  }
}

export const stylistsAPI = new StylistsAPI();
export default stylistsAPI;
