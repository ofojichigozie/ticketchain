import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { Ticket, TicketWithHistory } from '../types/ticket.types';

export const ticketsService = {
  confirmPurchase: async (txHash: string, eventId: string) => {
    const { data } = await api.post<ApiResponse<Ticket>>(
      '/tickets/confirm-purchase',
      { txHash, eventId },
    );
    return data.data!;
  },

  getMyTickets: async () => {
    const { data } = await api.get<ApiResponse<Ticket[]>>(
      '/tickets/my-tickets',
    );
    return data.data!;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<TicketWithHistory>>(
      `/tickets/${id}`,
    );
    return data.data!;
  },

  markAsUsed: async (id: string, txHash: string) => {
    const { data } = await api.patch<ApiResponse<Ticket>>(
      `/tickets/${id}/mark-used`,
      { txHash },
    );
    return data.data!;
  },
};
