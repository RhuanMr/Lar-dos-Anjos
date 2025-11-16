import { api } from '../api/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface UploadResult {
  url: string;
  path: string;
}

export const uploadService = {
  /**
   * Upload de foto de animal
   * @param animalId ID do animal
   * @param file Arquivo de imagem
   */
  uploadAnimalPhoto: async (
    animalId: string,
    file: File
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('foto', file);

    const response = await api.post<ApiResponse<UploadResult>>(
      `/upload/animal/${animalId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao fazer upload da foto');
    }

    return response.data.data;
  },

  /**
   * Upload de foto de usuário
   * @param userId ID do usuário
   * @param file Arquivo de imagem
   */
  uploadUserPhoto: async (userId: string, file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('foto', file);

    const response = await api.post<ApiResponse<UploadResult>>(
      `/upload/usuario/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao fazer upload da foto');
    }

    return response.data.data;
  },

  /**
   * Upload de foto de projeto
   * @param projectId ID do projeto
   * @param file Arquivo de imagem
   */
  uploadProjectPhoto: async (
    projectId: string,
    file: File
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('foto', file);

    const response = await api.post<ApiResponse<UploadResult>>(
      `/upload/projeto/${projectId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao fazer upload da foto');
    }

    return response.data.data;
  },

  /**
   * Deletar uma imagem
   * @param bucket Nome do bucket (animais, usuarios, projetos)
   * @param path Caminho do arquivo no bucket
   */
  deleteImage: async (bucket: string, path: string): Promise<void> => {
    const response = await api.delete<ApiResponse>(
      `/upload/${bucket}/${encodeURIComponent(path)}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao deletar imagem');
    }
  },
};

