import { api } from '../api/api';
import { User, UserUpdate } from '../types';

export interface UserCreate {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  data_nascimento?: string;
  genero?: 'M' | 'F' | 'Outro';
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  roles: string[];
}

export const userService = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: User[] }>('/usuarios');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: User }>(`/usuarios/${id}`);
    return response.data;
  },

  create: async (data: UserCreate) => {
    const response = await api.post<{ success: boolean; data: User; message: string }>(
      '/usuarios',
      data
    );
    return response.data;
  },

  setPassword: async (userId: string, senha: string) => {
    const response = await api.patch<{ success: boolean; message: string }>(
      `/usuarios/${userId}/senha`,
      { senha }
    );
    return response.data;
  },

  update: async (id: string, data: UserUpdate) => {
    const response = await api.patch<{ success: boolean; data: User; message?: string }>(
      `/usuarios/${id}`,
      data
    );
    return response.data;
  },
};

