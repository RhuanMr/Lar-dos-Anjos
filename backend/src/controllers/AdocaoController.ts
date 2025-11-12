import { Request, Response } from 'express';
import { AdocaoService } from '@/services/AdocaoService';
import { ApiResponse, AdocaoCreate, AdocaoUpdate } from '@/types/index';

export class AdocaoController {
  private service = new AdocaoService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const adocoes = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: adocoes,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao listar adoções';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async listarPorProjeto(req: Request, res: Response): Promise<void> {
    try {
      const { projetoId } = req.params;
      if (!projetoId) {
        res.status(400).json({
          success: false,
          error: 'ID do projeto não fornecido',
        });
        return;
      }
      const adocoes = await this.service.listarPorProjeto(projetoId);
      const response: ApiResponse = {
        success: true,
        data: adocoes,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar adoções do projeto';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async listarPorAdotante(req: Request, res: Response): Promise<void> {
    try {
      const { adotanteId } = req.params;
      if (!adotanteId) {
        res.status(400).json({
          success: false,
          error: 'ID do adotante não fornecido',
        });
        return;
      }
      const adocoes = await this.service.listarPorAdotante(adotanteId);
      const response: ApiResponse = {
        success: true,
        data: adocoes,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar adoções do adotante';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async listarPorAnimal(req: Request, res: Response): Promise<void> {
    try {
      const { animalId } = req.params;
      if (!animalId) {
        res.status(400).json({
          success: false,
          error: 'ID do animal não fornecido',
        });
        return;
      }
      const adocoes = await this.service.listarPorAnimal(animalId);
      const response: ApiResponse = {
        success: true,
        data: adocoes,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar adoções do animal';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID não fornecido',
        });
        return;
      }
      const adocao = await this.service.buscarPorId(id);
      const response: ApiResponse = {
        success: true,
        data: adocao,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao buscar adoção';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as AdocaoCreate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const adocao = await this.service.criar(dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: adocao,
        message: 'Adoção cadastrada com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao cadastrar adoção';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID não fornecido',
        });
        return;
      }
      const dados = req.body as AdocaoUpdate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const adocao = await this.service.atualizar(id, dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: adocao,
        message: 'Adoção atualizada com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar adoção';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID não fornecido',
        });
        return;
      }
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      await this.service.deletar(id, performadoPor);
      const response: ApiResponse = {
        success: true,
        message: 'Adoção deletada com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao deletar adoção';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}

