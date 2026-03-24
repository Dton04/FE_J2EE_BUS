import { api } from './api';

export interface StationResponse {
  id: number;
  name: string;
  city: string;
  address: string;
}

export const stationService = {
  getAllStations: async () => {
    try {
      // Trying public endpoint first, or admin endpoint fallback
      const response = await api.get('/stations');
      return response.data as StationResponse[];
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
         const adminResponse = await api.get('/admin/stations');
         return adminResponse.data as StationResponse[];
      }
      console.error('Error fetching stations:', error);
      throw error;
    }
  }
};
