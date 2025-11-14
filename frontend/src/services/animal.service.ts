import { api } from '../api/api';
import { Animal, AnimalCreate, AnimalUpdate } from '../types/Animal';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const mapVacinadoFromApi = (value?: string | null): Animal['vacinado'] => {
  if (!value) return undefined;
  const normalized = value.toUpperCase();
  if (normalized === 'SIM') return 'Sim';
  if (normalized === 'NAO') return 'Nao';
  if (normalized === 'PARCIAL') return 'Parcial';
  return undefined;
};

const mapAnimalFromApi = (animal: any): Animal => ({
  ...animal,
  vacinado: mapVacinadoFromApi(animal.vacinado),
});

const mapAnimalPayload = <T extends AnimalCreate | AnimalUpdate>(
  data: T
): T => {
  if (!data.vacinado) {
    return data;
  }
  return {
    ...data,
    vacinado: data.vacinado.toUpperCase() as T['vacinado'],
  };
};

export const animalService = {
  // Listar todos os animais
  getAll: async (): Promise<Animal[]> => {
    const response = await api.get<ApiResponse<Animal[]>>('/animais');
    return (response.data.data || []).map(mapAnimalFromApi);
  },

  // Listar animais por projeto
  getByProject: async (projectId: string): Promise<Animal[]> => {
    const response = await api.get<ApiResponse<Animal[]>>(
      `/animais/projeto/${projectId}`
    );
    return (response.data.data || []).map(mapAnimalFromApi);
  },

  // Buscar animal por ID
  getById: async (id: string): Promise<Animal> => {
    const response = await api.get<ApiResponse<Animal>>(`/animais/${id}`);
    if (!response.data.data) {
      throw new Error('Animal não encontrado');
    }
    return mapAnimalFromApi(response.data.data);
  },

  // Criar animal
  create: async (data: AnimalCreate): Promise<Animal> => {
    const payload = mapAnimalPayload(data);
    const response = await api.post<ApiResponse<Animal>>('/animais', payload);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Erro ao criar animal');
    }
    return mapAnimalFromApi(response.data.data);
  },

  // Atualizar animal
  update: async (id: string, data: AnimalUpdate): Promise<Animal> => {
    const payload = mapAnimalPayload(data);
    const response = await api.patch<ApiResponse<Animal>>(
      `/animais/${id}`,
      payload
    );
    if (!response.data.data) {
      throw new Error(response.data.error || 'Erro ao atualizar animal');
    }
    return mapAnimalFromApi(response.data.data);
  },

  // Deletar animal
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/animais/${id}`);
  },
};

