import { api } from './api';

export interface CreatePaymentRequest {
  booking_id: number;
  payment_method: 'VNPAY' | 'MOMO' | 'CASH' | string;
}

export interface CreatePaymentResponse {
  payment_url: string;
  transaction_ref: string;
}

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const paymentService = {
  createPayment: async (request: CreatePaymentRequest) => {
    const res = await api.post('/payments', request);
    return unwrapData<CreatePaymentResponse>(res.data);
  },
};
