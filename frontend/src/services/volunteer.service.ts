import { api } from '../api/api';
import { Volunteer, VolunteerCreate, VolunteerUpdate } from '../types';

export const volunteerService = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: Volunteer[] }>('/voluntarios');
    return response.data;
  },

  getByProject: async (projetoId: string) => {
    const response = await api.get<{ success: boolean; data: Volunteer[] }>(
      `/voluntarios/projeto/${projetoId}`
    );
    return response.data;
  },

  getByUser: async (usuarioId: string) => {
    const response = await api.get<{ success: boolean; data: Volunteer[] }>(
      `/voluntarios/usuario/${usuarioId}`
    );
    return response.data;
  },

  getById: async (usuarioId: string, projetoId: string) => {
    const response = await api.get<{ success: boolean; data: Volunteer }>(
      `/voluntarios/${usuarioId}/${projetoId}`
    );
    return response.data;
  },

  create: async (data: VolunteerCreate) => {
    const response = await api.post<{ success: boolean; data: Volunteer; message: string }>(
      '/voluntarios',
      data
    );
    return response.data;
  },

  update: async (usuarioId: string, projetoId: string, data: VolunteerUpdate) => {
    const response = await api.patch<{ success: boolean; data: Volunteer; message: string }>(
      `/voluntarios/${usuarioId}/${projetoId}`,
      data
    );
    return response.data;
  },

  delete: async (usuarioId: string, projetoId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/voluntarios/${usuarioId}/${projetoId}`
    );
    return response.data;
  },
};

