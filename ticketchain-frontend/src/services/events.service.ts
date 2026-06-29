import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { Event } from '../types/event.types';

export const eventsService = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Event[]>>('/events');
    return data.data!;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Event>>(`/events/${id}`);
    return data.data!;
  },

  create: async (payload: {
    title: string;
    description?: string;
    eventDate: string;
    venue?: string;
    totalTickets: number;
    basePriceEth: string;
    maxResaleMultiplierBps: number;
    maxTicketsPerWallet?: number;
  }) => {
    const { data } = await api.post<ApiResponse<Event>>('/events', payload);
    return data.data!;
  },

  update: async (
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      eventDate: string;
      venue: string;
    }>,
  ) => {
    const { data } = await api.patch<ApiResponse<Event>>(
      `/events/${id}`,
      payload,
    );
    return data.data!;
  },

  publish: async (id: string, txHash: string, onChainEventId: number) => {
    const { data } = await api.patch<ApiResponse<Event>>(
      `/events/${id}/publish`,
      { txHash, onChainEventId },
    );
    return data.data!;
  },

  getMyEvents: async () => {
    const { data } = await api.get<ApiResponse<Event[]>>('/events/my');
    return data.data!;
  },
};
