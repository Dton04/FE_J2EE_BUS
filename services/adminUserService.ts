import { api } from './api';

export interface CreateStaffRequest {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  role?: string;
}

export interface CreateStaffResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface StaffResponse {
  id: number;
  fullName?: string;
  email: string;
  phone?: string;
  role?: string;
  locked?: boolean;
  bookingsCount?: number;
}

export interface UpdateUserLockRequest {
  locked: boolean;
}

export const adminUserService = {
  getAllStaff: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data as StaffResponse[];
    } catch (error) {
      console.error('Error fetching all staff:', error);
      throw error;
    }
  },

  createStaff: async (request: CreateStaffRequest) => {
    try {
      const response = await api.post('/admin/users', request);
      return response.data as CreateStaffResponse;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  },

  updateUserLock: async (id: number, request: UpdateUserLockRequest) => {
    try {
      const response = await api.patch(`/admin/users/${id}/lock`, request);
      return response.data;
    } catch (error) {
      console.error(`Error updating lock status for user ${id}:`, error);
      throw error;
    }
  }
};
