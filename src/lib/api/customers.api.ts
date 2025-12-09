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
    const responseBody = await apiClient.get<PaginatedResponse<Customer>>('/users', { 
      params: { ...filters, role: 'customer' } 
    });
    return responseBody as PaginatedResponse<Customer>;
  }

  async getById(id: string): Promise<ApiResponse<Customer>> {
    const responseBody = await apiClient.get<ApiResponse<Customer>>(`/users/${id}`);
    return responseBody as ApiResponse<Customer>;
  }

  async getBookingHistory(id: string, page?: number, limit?: number): Promise<PaginatedResponse<any>> {
    const responseBody = await apiClient.get(`/users/${id}/bookings`, { params: { page, limit } });
    return responseBody;
  }
}

export const customersAPI = new CustomersAPI();
export default customersAPI;
