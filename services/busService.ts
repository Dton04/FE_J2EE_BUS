import { api } from './api';

export interface BusRequest {
  license_plate: string;
  total_seats: number;
  bus_type: string;
}

export interface BusResponse {
  id: number;
  license_plate: string;
  total_seats: number;
  bus_type: string;
  status: string;
}

export const busService = {
  getAllBuses: async (): Promise<BusResponse[]> => {
    try {
      const response = await api.get('/admin/buses');
      return response.data;
    } catch (error) {
      console.error('Error fetching buses:', error);
      throw error;
    }
  },

  createBus: async (data: BusRequest): Promise<BusResponse> => {
    try {
      const response = await api.post('/admin/buses', data);
      return response.data;
    } catch (error) {
      console.error('Error creating bus:', error);
      throw error;
    }
  },

  deleteBus: async (id: number): Promise<void> => {
    try {
      await api.delete(`/admin/buses/${id}`);
    } catch (error) {
      console.error(`Error deleting bus ${id}:`, error);
      throw error;
    }
  }
};
