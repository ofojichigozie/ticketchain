import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/user.types';

export const authService = {
  getNonce: async (walletAddress: string) => {
    const { data } = await api.post<ApiResponse<{ nonce: string }>>(
      '/auth/nonce',
      { walletAddress },
    );
    return data.data!;
  },

  verify: async (walletAddress: string, signature: string) => {
    const { data } = await api.post<
      ApiResponse<{ accessToken: string; user: User }>
    >('/auth/verify', { walletAddress, signature });
    return data.data!;
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data!;
  },
};
