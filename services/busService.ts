import { api } from './api';

export interface BusResponse {
  id: number;
  license_plate: string;
  total_seats: number;
  bus_type?: string;
  seats_generated?: number; // số ghế đã generate (từ getAllBuses hoặc sau khi tạo)
}

export const busService = {
  getAllBuses: async (): Promise<BusResponse[]> => {
    const response = await api.get('/admin/buses');
    return response.data as BusResponse[];
  },
  createBus: async (payload: {
    license_plate: string;
    total_seats: number;
    bus_type?: string;
  }): Promise<BusResponse> => {
    const res = await api.post('/admin/buses', {
      license_plate: payload.license_plate,
      total_seats: payload.total_seats,
      bus_type: payload.bus_type,
    });
    return res.data as BusResponse;
  },
  generateSeats: async (busId: number): Promise<void> => {
    await api.post(`/admin/buses/${busId}/generate-seats`);
  },
};
