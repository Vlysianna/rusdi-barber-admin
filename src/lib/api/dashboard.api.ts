import { apiClient, ApiResponse } from './client';

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalCustomers: number;
  averageRating: number;
  revenueGrowth: number;
  bookingsGrowth: number;
  customersGrowth: number;
  ratingChange: number;
  revenueByDay: Array<{ date: string; amount: number }>;
  bookingsByStatus: Array<{ status: string; count: number }>;
  topServices: Array<{ id: string; name: string; bookings: number; revenue: number }>;
  topStylists: Array<{ id: string; name: string; bookings: number; revenue: number; rating: number }>;
  recentBookings: Array<{
    id: string;
    customerName: string;
    serviceName: string;
    stylistName: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    totalAmount: number;
  }>;
}

export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  stylistId?: string;
}

class DashboardAPI {
  async getStats(filters?: DashboardFilters): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>('/dashboard/stats', { params: filters });
  }

  async getRevenueTrend(period: 'week' | 'month' | 'year'): Promise<ApiResponse<Array<{ date: string; amount: number }>>> {
    return apiClient.get(`/dashboard/revenue-trend`, { params: { period } });
  }

  async getBookingsTrend(period: 'week' | 'month' | 'year'): Promise<ApiResponse<Array<{ date: string; count: number }>>> {
    return apiClient.get(`/dashboard/bookings-trend`, { params: { period } });
  }
}

export const dashboardAPI = new DashboardAPI();
export default dashboardAPI;
