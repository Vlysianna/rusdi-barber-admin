import { apiClient, ApiResponse, PaginatedResponse } from './client';

export interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  totalBookings?: number;
  totalSpent?: number;
  lastBooking?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class CustomersAPI {
  async getAll(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    return apiClient.get<Customer[]>('/users', { 
      params: { ...filters, role: 'customer' } 
    });
  }

  async getById(id: string): Promise<ApiResponse<Customer>> {
    return apiClient.get<Customer>(`/users/${id}`);
  }

  async getBookingHistory(id: string, page?: number, limit?: number): Promise<PaginatedResponse<any>> {
    return apiClient.get(`/users/${id}/bookings`, { params: { page, limit } });
  }
}

export const customersAPI = new CustomersAPI();
export default customersAPI;
