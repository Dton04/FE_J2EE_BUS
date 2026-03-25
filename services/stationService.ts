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
    } catch (error: unknown) {
      const status =
        typeof (error as { response?: { status?: unknown } })?.response?.status === 'number'
          ? (error as { response?: { status?: number } }).response?.status
          : null;

      if (status === 403 || status === 404) {
         const adminResponse = await api.get('/admin/stations');
         return adminResponse.data as StationResponse[];
      }
      console.error('Error fetching stations:', error);
      throw error;
    }
  }
};
