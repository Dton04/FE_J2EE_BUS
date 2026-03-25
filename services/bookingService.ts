import { api } from './api';

export interface BookingLegRequest {
  trip_id: number | string;
  seat_number: string;
}

export interface BookingRequest {
  customer_name: string;
  customer_phone: string;
  legs: BookingLegRequest[];
}

export interface BookingResponse {
  id: number;
  status: 'HOLDING' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED' | string;
  booking_code?: string;
  total_amount?: number;
  hold_expires_at?: string;
}

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const bookingService = {
  createBooking: async (request: BookingRequest) => {
    const response = await api.post('/bookings', request);
    return unwrapData<BookingResponse>(response.data);
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings');
    return unwrapData<BookingResponse[]>(response.data);
  },

  cancelBooking: async (bookingId: number) => {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return unwrapData<BookingResponse>(response.data);
  },
};
