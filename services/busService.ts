import { api } from './api';

export interface BusResponse {
  id: number;
  license_plate: string;
  total_seats: number;
  bus_type?: string;
}

export const busService = {
  getAllBuses: async () => {
    const response = await api.get('/admin/buses');
    return response.data as BusResponse[];
  },
  createBus: async (payload: { license_plate: string; total_seats: number; bus_type?: string }) => {
    const res = await api.post('/admin/buses', {
      license_plate: payload.license_plate,
      total_seats: payload.total_seats,
      bus_type: payload.bus_type,
    });
    return res.data as BusResponse;
  },
  generateSeats: async (busId: number) => {
    await api.post(`/admin/buses/${busId}/generate-seats`);
  },
};
