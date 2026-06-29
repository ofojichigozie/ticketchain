import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { Listing } from '../types/listing.types';

export const marketplaceService = {
  getListings: async () => {
    const { data } = await api.get<ApiResponse<Listing[]>>('/marketplace');
    return data.data!;
  },

  createListing: async (ticketId: string, askingPriceEth: string) => {
    const { data } = await api.post<ApiResponse<Listing>>('/marketplace', {
      ticketId,
      askingPriceEth,
    });
    return data.data!;
  },

  cancelListing: async (listingId: string) => {
    const { data } = await api.delete<ApiResponse<Listing>>(
      `/marketplace/${listingId}`,
    );
    return data.data!;
  },

  confirmResalePurchase: async (listingId: string, txHash: string) => {
    const { data } = await api.post<ApiResponse<Listing>>(
      `/marketplace/${listingId}/confirm-resale-purchase`,
      { txHash },
    );
    return data.data!;
  },
};
