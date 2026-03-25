import { api } from './api';

export interface RouteRequest {
  departure: string;
  destination: string;
  distance: number;
  duration: number; // in minutes
}

export interface RouteResponse {
  id: number;
  departure: string;
  destination: string;
  distance: number;
  duration: number;
}

export const routeService = {
  createRoute: async (request: RouteRequest) => {
    try {
      const response = await api.post('/admin/routes', request);
      return response.data as RouteResponse;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  },

  getAllRoutes: async () => {
    try {
      const response = await api.get('/admin/routes');
      return response.data as RouteResponse[];
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  }
};
