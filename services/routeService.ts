import { api } from './api';

export interface RouteRequest {
  origin_station_id: number;
  destination_station_id: number;
  base_price: number;
  distance_km?: number;
  estimated_duration?: number;
}

export interface RouteResponse {
  id: number;
  name?: string;
  base_price?: number;
  distance_km?: number;
  estimated_duration?: number;
  origin_station?: {
    id: number;
    name: string;
    city: string;
    address?: string;
  };
  destination_station?: {
    id: number;
    name: string;
    city: string;
    address?: string;
  };
}

export const routeService = {
  createRoute: async (request: RouteRequest) => {
    const response = await api.post('/admin/routes', request);
    return response.data as RouteResponse;
  },

  getAllRoutes: async () => {
    const response = await api.get('/admin/routes');
    return response.data as RouteResponse[];
  },

  updateRoute: async (id: number, request: Partial<RouteRequest>) => {
    const response = await api.put(`/admin/routes/${id}`, request);
    return response.data as RouteResponse;
  },

  deleteRoute: async (id: number) => {
    await api.delete(`/admin/routes/${id}`);
  }
};
