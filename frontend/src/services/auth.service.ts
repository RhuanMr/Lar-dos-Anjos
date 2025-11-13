import { api } from '../api/api';
import { LoginRequest, LoginResponse } from '../types/Auth';

export const authService = {
  login: async (email: string, senha: string) => {
    const response = await api.post<{ success: boolean; data: LoginResponse; message: string }>(
      '/api/auth/login',
      { email, senha } as LoginRequest
    );
    return response;
  },

  verify: async () => {
    const response = await api.post<{ success: boolean; data: any; message: string }>(
      '/api/auth/verify'
    );
    return response;
  },
};

