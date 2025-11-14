import { api } from '../api/api';
import { Adopter, AdopterCreate } from '../types/Adopter';
import { User } from '../types/User';

export const adopterService = {
  registerAsAdopter: async (data: AdopterCreate): Promise<User> => {
    const response = await api.post<{ success: boolean; data: User }>(
      '/adotantes',
      data
    );
    return response.data.data;
  },

  removeAdopterRole: async (userId: string): Promise<User> => {
    const response = await api.delete<{ success: boolean; data: User }>(
      `/adotantes/${userId}`
    );
    return response.data.data;
  },
};

