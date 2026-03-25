import { api } from './api';

export interface RouteRequest {
  departure: string;
  destination: string;
  distance: number;
  duration: number; // in minutes
  origin_station_id: number;
  destination_station_id: number;
  base_price?: number;
  price?: number;
}

export interface RouteResponse {
  id: number;
  departure: string;
  destination: string;
  distance: number;
  duration: number;
  price?: number;
  base_price?: number;
  departure_date?: string;
  distance_km?: number;
  estimated_duration?: number;
  origin_station?: {
    id: number;
    name: string;
    city: string;
  };
  destination_station?: {
    id: number;
    name: string;
    city: string;
  };
}

export const routeService = {
  createRoute: async (request: RouteRequest) => {
    try {
      console.log('API Request: POST /admin/routes', request);
      const response = await api.post('/admin/routes', request);
      console.log('API Response: POST /admin/routes', response.data);
      return response.data as RouteResponse;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  },

  getAllRoutes: async () => {
    try {
      console.log('API Request: GET /admin/routes');
      const response = await api.get('/admin/routes');
      console.log('API Response: GET /admin/routes', response.data);
      return response.data as RouteResponse[];
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  },

  updateRoute: async (id: number, request: Partial<RouteRequest>) => {
    try {
      console.log(`API Request: PUT /admin/routes/${id}`, request);
      const response = await api.put(`/admin/routes/${id}`, request);
      console.log(`API Response: PUT /admin/routes/${id}`, response.data);
      return response.data as RouteResponse;
    } catch (error) {
      console.error(`Error updating route ${id}:`, error);
      throw error;
    }
  },

  deleteRoute: async (id: number) => {
    try {
      console.log(`API Request: DELETE /admin/routes/${id}`);
      await api.delete(`/admin/routes/${id}`);
      console.log(`API Response: DELETE /admin/routes/${id} Success`);
    } catch (error) {
      console.error(`Error deleting route ${id}:`, error);
      throw error;
    }
  }
};
