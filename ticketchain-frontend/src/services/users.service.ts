import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/user.types';

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  avatarUrl?: string;
}

export const usersService = {
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await api.get<ApiResponse<User[]>>('/users');
    return data.data;
  },

  updateRole: async (
    userId: string,
    role: 'organizer' | 'admin' | 'attendee',
  ): Promise<{ id: string; walletAddress: string; role: string }> => {
    const { data } = await api.patch<
      ApiResponse<{ id: string; walletAddress: string; role: string }>
    >(`/users/${userId}/role`, { role });
    return data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await api.patch<ApiResponse<User>>('/users/me', payload);
    return data.data;
  },
};
