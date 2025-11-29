import { apiClient, ApiResponse, PaginatedResponse } from './client';

export interface Booking {
  id: string;
  customerId: string;
  stylistId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  totalAmount: number;
  notes?: string;
  cancelReason?: string;
  customer?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  stylist?: {
    id: string;
    user: {
      fullName: string;
      email: string;
    };
    specialties: string[];
    rating: number;
  };
  service?: {
    id: string;
    name: string;
    duration: number;
    price: number;
    category: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  customerId: string;
  stylistId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

export interface UpdateBookingRequest {
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
  notes?: string;
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  customerId?: string;
  stylistId?: string;
  serviceId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

class BookingsAPI {
  async getAll(filters?: BookingFilters): Promise<PaginatedResponse<Booking>> {
    return apiClient.get<Booking[]>('/bookings', { params: filters });
  }

  async getById(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.get<Booking>(`/bookings/${id}`);
  }

  async create(data: CreateBookingRequest): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>('/bookings', data);
  }

  async update(id: string, data: UpdateBookingRequest): Promise<ApiResponse<Booking>> {
    return apiClient.put<Booking>(`/bookings/${id}`, data);
  }

  async cancel(id: string, reason: string): Promise<ApiResponse<Booking>> {
    return apiClient.put<Booking>(`/bookings/${id}/cancel`, { reason });
  }

  async confirm(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.put<Booking>(`/bookings/${id}/confirm`);
  }

  async complete(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.put<Booking>(`/bookings/${id}/complete`);
  }

  async getAvailableTimeSlots(stylistId: string, date: string, serviceId: string): Promise<ApiResponse<TimeSlot[]>> {
    return apiClient.get<TimeSlot[]>('/bookings/time-slots', {
      params: { stylistId, date, serviceId }
    });
  }
}

export const bookingsAPI = new BookingsAPI();
export default bookingsAPI;
