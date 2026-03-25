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

export interface MyBookingResponse {
  booking_id: number;
  booking_code: string;
  route_name: string | null;
  departure_time: string | null;
  total_amount: number;
  seat_count: number;
  status: string;
  payment_status: string;
}

export interface BookingTicketItem {
  seat: string;
  passenger: string;
}

export interface BookingDetailResponse {
  booking_info: {
    booking_code: string;
    status: string;
    created_at: string;
  };
  trip_info: {
    route: string;
    bus_plate: string;
    bus_type: string;
    departure: string;
    pickup_point: string;
  };
  tickets: BookingTicketItem[];
  payment: {
    method: string;
    total: number;
    status: string;
  };
  qr_string: string;
  policies: string;
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

  getMyBookings: async (type: 'UPCOMING' | 'HISTORY' | 'HOLDING' | 'PENDING_PAYMENT' | 'ALL' = 'UPCOMING') => {
    const response = await api.get('/me/bookings', { params: { type } });
    return unwrapData<MyBookingResponse[]>(response.data);
  },

  getBookingDetail: async (bookingId: number | string) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return unwrapData<BookingDetailResponse>(response.data);
  },

  cancelBooking: async (bookingId: number) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return unwrapData<string>(response.data);
  },
};
