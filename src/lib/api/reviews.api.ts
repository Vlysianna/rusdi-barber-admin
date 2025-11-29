import { apiClient, ApiResponse, PaginatedResponse } from './client';

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  stylistId: string;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  stylistId?: string;
  rating?: number;
  isVisible?: boolean;
}

class ReviewsAPI {
  async getAll(filters?: ReviewFilters): Promise<PaginatedResponse<Review>> {
    return apiClient.get<Review[]>('/bookings/reviews', { params: filters });
  }

  async getById(id: string): Promise<ApiResponse<Review>> {
    return apiClient.get<Review>(`/bookings/reviews/${id}`);
  }

  async delete(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/bookings/reviews/${id}`);
  }

  async toggleVisibility(id: string): Promise<ApiResponse<Review>> {
    return apiClient.patch<Review>(`/bookings/reviews/${id}/toggle-visibility`);
  }
}

export const reviewsAPI = new ReviewsAPI();
export default reviewsAPI;
