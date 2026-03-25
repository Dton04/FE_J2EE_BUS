import { api } from './api';

export const ticketService = {
  checkIn: async (ticketId: string | number) => {
    const response = await api.patch(`/tickets/${ticketId}/check-in`);
    return response.data;
  }
};
