import { api } from '../api/api';
import { User } from '../types';

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
    const response = await api.get<{ success: boolean; data: User[] }>('/api/usuarios');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: User }>(`/api/usuarios/${id}`);
    return response.data;
  },

  create: async (data: UserCreate) => {
    const response = await api.post<{ success: boolean; data: User; message: string }>(
      '/api/usuarios',
      data
    );
    return response.data;
  },
};

