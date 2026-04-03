import { api } from './api';

export interface ProvinceResponse {
  id: number;
  name: string;
  code: string;
}

export const provinceService = {
  getAllProvinces: async () => {
    try {
      const response = await api.get('/provinces');
      return response.data as ProvinceResponse[];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  }
};
