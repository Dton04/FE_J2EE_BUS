import { api } from './api';

export interface CreateStaffRequest {
  full_name: string;
  email: string;
  phone: string;
  password?: string;
  role?: string;
}

export interface CreateStaffResponse {
  user_id: number;
  message: string;
}

export interface StaffResponse {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_locked: boolean;
  bookings_count?: number;
}

export interface UpdateUserLockRequest {
  is_locked: boolean;
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
