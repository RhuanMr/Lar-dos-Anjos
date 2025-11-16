import { Request, Response } from 'express';
import { UploadService, BucketType } from '@/services/UploadService';
import { ApiResponse } from '@/types/index';
import { Role } from '@/types/enums';

export class UploadController {
  private uploadService = new UploadService();

  /**
   * Upload de foto de animal
   * POST /api/upload/animal/:id
   */
  async uploadAnimal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'ID do animal é obrigatório',
        };
        res.status(400).json(response);
        return;
      }
      const file = req.file;

      if (!file) {
        const response: ApiResponse = {
          success: false,
          error: 'Nenhum arquivo foi enviado',
        };
        res.status(400).json(response);
        return;
      }

      // Fazer upload
      const result = await this.uploadService.uploadImagem(
        'animais',
        file,
        id as string
      );

      // Atualizar URL da foto no banco
      await this.uploadService.atualizarFotoNaEntidade(
        'animais',
        id as string,
        result.url
      );

      const response: ApiResponse = {
        success: true,
        data: {
          url: result.url,
          path: result.path,
          animalId: id,
        },
        message: 'Foto do animal atualizada com sucesso',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erro ao fazer upload da foto do animal',
      };
      res.status(400).json(response);
    }
  }

  /**
   * Upload de foto de usuário
   * POST /api/upload/usuario/:id
   */
  async uploadUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'ID do usuário é obrigatório',
        };
        res.status(400).json(response);
        return;
      }
      const file = req.file;

      if (!file) {
        const response: ApiResponse = {
          success: false,
          error: 'Nenhum arquivo foi enviado',
        };
        res.status(400).json(response);
        return;
      }

      // Verificar se o usuário pode atualizar a foto
      // Apenas o próprio usuário, SUPERADMIN ou ADMINISTRADOR podem atualizar
      const userId = req.user?.id;
      const userRoles = req.user?.roles || [];

      if (
        userId !== id &&
        !userRoles.includes(Role.SUPER_ADMIN) &&
        !userRoles.includes(Role.ADMINISTRADOR)
      ) {
        const response: ApiResponse = {
          success: false,
          error:
            'Você não tem permissão para atualizar a foto deste usuário',
        };
        res.status(403).json(response);
        return;
      }

      // Fazer upload
      const result = await this.uploadService.uploadImagem(
        'usuarios',
        file,
        id as string
      );

      // Atualizar URL da foto no banco
      await this.uploadService.atualizarFotoNaEntidade(
        'usuarios',
        id as string,
        result.url
      );

      const response: ApiResponse = {
        success: true,
        data: {
          url: result.url,
          path: result.path,
          usuarioId: id,
        },
        message: 'Foto do usuário atualizada com sucesso',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erro ao fazer upload da foto do usuário',
      };
      res.status(400).json(response);
    }
  }

  /**
   * Upload de foto de projeto
   * POST /api/upload/projeto/:id
   */
  async uploadProjeto(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'ID do projeto é obrigatório',
        };
        res.status(400).json(response);
        return;
      }
      const file = req.file;

      if (!file) {
        const response: ApiResponse = {
          success: false,
          error: 'Nenhum arquivo foi enviado',
        };
        res.status(400).json(response);
        return;
      }

      // Fazer upload
      const result = await this.uploadService.uploadImagem(
        'projetos',
        file,
        id as string
      );

      // Atualizar URL da foto no banco
      await this.uploadService.atualizarFotoNaEntidade(
        'projetos',
        id as string,
        result.url
      );

      const response: ApiResponse = {
        success: true,
        data: {
          url: result.url,
          path: result.path,
          projetoId: id,
        },
        message: 'Foto do projeto atualizada com sucesso',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erro ao fazer upload da foto do projeto',
      };
      res.status(400).json(response);
    }
  }

  /**
   * Upload de múltiplas fotos de animal
   * POST /api/upload/animal/:id/fotos
   */
  async uploadMultiplasFotosAnimal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'ID do animal é obrigatório',
        };
        res.status(400).json(response);
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Nenhum arquivo foi enviado',
        };
        res.status(400).json(response);
        return;
      }

      // Fazer upload de múltiplas imagens
      const results = await this.uploadService.uploadMultiplasImagens(
        'animais',
        files,
        id as string
      );

      // Adicionar URLs ao array de fotos do animal
      const fotoUrls = results.map((r) => r.url);
      await this.uploadService.adicionarFotosAoAnimal(id as string, fotoUrls);

      const response: ApiResponse = {
        success: true,
        data: {
          fotos: results,
          animalId: id,
          totalFotos: fotoUrls.length,
        },
        message: `${fotoUrls.length} foto(s) adicionada(s) com sucesso`,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erro ao fazer upload das fotos do animal',
      };
      res.status(400).json(response);
    }
  }

  /**
   * Remove uma foto do array de fotos de um animal
   * DELETE /api/upload/animal/:id/foto
   */
  async removerFotoAnimal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { fotoUrl } = req.body;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'ID do animal é obrigatório',
        };
        res.status(400).json(response);
        return;
      }

      if (!fotoUrl) {
        const response: ApiResponse = {
          success: false,
          error: 'URL da foto é obrigatória',
        };
        res.status(400).json(response);
        return;
      }

      // Extrair o path do storage da URL
      const urlObj = new URL(fotoUrl);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex((p) => p === 'animais');
      if (bucketIndex === -1) {
        throw new Error('URL inválida');
      }
      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      // Remover do array de fotos
      await this.uploadService.removerFotoDoAnimal(id as string, fotoUrl);

      // Deletar arquivo do storage
      await this.uploadService.deletarImagem('animais', filePath);

      const response: ApiResponse = {
        success: true,
        message: 'Foto removida com sucesso',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erro ao remover foto do animal',
      };
      res.status(400).json(response);
    }
  }

  /**
   * Deleta uma imagem
   * DELETE /api/upload/:bucket/:path
   */
  async deletarImagem(req: Request, res: Response): Promise<void> {
    try {
      const { bucket, path } = req.params;

      // Validar bucket
      const validBuckets: BucketType[] = ['animais', 'usuarios', 'projetos'];
      if (!validBuckets.includes(bucket as BucketType)) {
        const response: ApiResponse = {
          success: false,
          error: 'Bucket inválido',
        };
        res.status(400).json(response);
        return;
      }

      // Verificar permissões
      const userRoles = req.user?.roles || [];
      if (
        !userRoles.includes(Role.SUPER_ADMIN) &&
        !userRoles.includes(Role.ADMINISTRADOR)
      ) {
        const response: ApiResponse = {
          success: false,
          error: 'Apenas SUPERADMIN ou ADMINISTRADOR podem deletar imagens',
        };
        res.status(403).json(response);
        return;
      }

      // Deletar imagem
      if (!path) {
        const response: ApiResponse = {
          success: false,
          error: 'Caminho da imagem é obrigatório',
        };
        res.status(400).json(response);
        return;
      }
      await this.uploadService.deletarImagem(
        bucket as BucketType,
        decodeURIComponent(path as string)
      );

      const response: ApiResponse = {
        success: true,
        message: 'Imagem deletada com sucesso',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erro ao deletar imagem',
      };
      res.status(400).json(response);
    }
  }
}

