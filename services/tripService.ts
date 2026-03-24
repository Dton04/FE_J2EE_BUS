import { api } from './api';

export const tripService = {
  searchTrips: async (
    originId: number, 
    destinationId: number, 
    date: string, 
    maxLegs: number = 2, 
    minLayoverMinutes: number = 30
  ) => {
    try {
      const response = await api.get('/trips', {
        params: {
          origin_id: originId,
          destination_id: destinationId,
          date: date,
          max_legs: maxLegs,
          min_layover_minutes: minLayoverMinutes
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  },

  getSeatMap: async (tripId: number) => {
    try {
      const response = await api.get(`/trips/${tripId}/seats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching seat map for trip ${tripId}:`, error);
      throw error;
    }
  },

  getPassengers: async (tripId: number) => {
    try {
      const response = await api.get(`/trips/${tripId}/passengers`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching passengers for trip ${tripId}:`, error);
      throw error;
    }
  },

  getStops: async (tripId: number) => {
    try {
      const response = await api.get(`/trips/${tripId}/stops`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stops for trip ${tripId}:`, error);
      throw error;
    }
  },

  getAllTrips: async () => {
    try {
      const response = await api.get('/admin/trips');
      return response.data;
    } catch (error) {
      console.error('Error fetching all trips:', error);
      throw error;
    }
  }
};
