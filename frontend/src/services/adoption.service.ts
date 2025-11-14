import { api } from '../api/api';
import {
  Adoption,
  AdoptionCreate,
  AdoptionUpdate,
  AdoptionUpdateRecord,
  AdoptionUpdateCreate,
  AdoptionUpdateUpdate,
} from '../types/Adoption';

export const adoptionService = {
  getAll: async (): Promise<Adoption[]> => {
    const response = await api.get<{ success: boolean; data: Adoption[] }>(
      '/adocoes'
    );
    return response.data.data;
  },

  getByProject: async (projectId: string): Promise<Adoption[]> => {
    const response = await api.get<{ success: boolean; data: Adoption[] }>(
      `/adocoes/projeto/${projectId}`
    );
    return response.data.data;
  },

  getByAdopter: async (adopterId: string): Promise<Adoption[]> => {
    const response = await api.get<{ success: boolean; data: Adoption[] }>(
      `/adocoes/adotante/${adopterId}`
    );
    return response.data.data;
  },

  getByAnimal: async (animalId: string): Promise<Adoption[]> => {
    const response = await api.get<{ success: boolean; data: Adoption[] }>(
      `/adocoes/animal/${animalId}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Adoption> => {
    const response = await api.get<{ success: boolean; data: Adoption }>(
      `/adocoes/${id}`
    );
    return response.data.data;
  },

  create: async (data: AdoptionCreate): Promise<Adoption> => {
    const response = await api.post<{ success: boolean; data: Adoption }>(
      '/adocoes',
      data
    );
    return response.data.data;
  },

  update: async (id: string, data: AdoptionUpdate): Promise<Adoption> => {
    const response = await api.patch<{ success: boolean; data: Adoption }>(
      `/adocoes/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/adocoes/${id}`);
  },
};

export const adoptionUpdateService = {
  getAll: async (): Promise<AdoptionUpdateRecord[]> => {
    const response = await api.get<{
      success: boolean;
      data: AdoptionUpdateRecord[];
    }>('/atualizacoes-adocao');
    return response.data.data;
  },

  getByAdoption: async (
    adoptionId: string
  ): Promise<AdoptionUpdateRecord[]> => {
    const response = await api.get<{
      success: boolean;
      data: AdoptionUpdateRecord[];
    }>(`/atualizacoes-adocao/adocao/${adoptionId}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<AdoptionUpdateRecord> => {
    const response = await api.get<{
      success: boolean;
      data: AdoptionUpdateRecord;
    }>(`/atualizacoes-adocao/${id}`);
    return response.data.data;
  },

  create: async (
    data: AdoptionUpdateCreate
  ): Promise<AdoptionUpdateRecord> => {
    const response = await api.post<{
      success: boolean;
      data: AdoptionUpdateRecord;
    }>('/atualizacoes-adocao', data);
    return response.data.data;
  },

  update: async (
    id: string,
    data: AdoptionUpdateUpdate
  ): Promise<AdoptionUpdateRecord> => {
    const response = await api.patch<{
      success: boolean;
      data: AdoptionUpdateRecord;
    }>(`/atualizacoes-adocao/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/atualizacoes-adocao/${id}`);
  },
};

