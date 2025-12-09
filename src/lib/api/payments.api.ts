import { apiClient, ApiResponse, PaginatedResponse } from './client';

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  method: 'cash' | 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer';
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  transactionId?: string;
  currency: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  bookingId?: string;
  customerId?: string;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}

class PaymentsAPI {
  async getAll(filters?: PaymentFilters): Promise<PaginatedResponse<Payment>> {
    try {
      const responseBody = await apiClient.get<PaginatedResponse<Payment>>('/payments', { params: filters });
      return responseBody as PaginatedResponse<Payment>;
    } catch (error) {
      console.error('Payments fetch error:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`/payments/${id}`);
  }

  async refund(id: string, reason: string): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(`/payments/${id}/refund`, { reason });
  }
}

export const paymentsAPI = new PaymentsAPI();
export default paymentsAPI;
