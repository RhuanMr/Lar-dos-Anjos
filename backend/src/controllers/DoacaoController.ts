import { Request, Response } from 'express';
import { DoacaoService } from '@/services/DoacaoService';
import { ApiResponse, DoacaoCreate, DoacaoUpdate } from '@/types/index';

export class DoacaoController {
  private service = new DoacaoService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const doacoes = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: doacoes,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao listar doações';
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
      const doacoes = await this.service.listarPorProjeto(projetoId);
      const response: ApiResponse = {
        success: true,
        data: doacoes,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar doações do projeto';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async listarPorUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      if (!usuarioId) {
        res.status(400).json({
          success: false,
          error: 'ID do usuário não fornecido',
        });
        return;
      }
      const doacoes = await this.service.listarPorUsuario(usuarioId);
      const response: ApiResponse = {
        success: true,
        data: doacoes,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar doações do usuário';
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
      const doacao = await this.service.buscarPorId(id);
      const response: ApiResponse = {
        success: true,
        data: doacao,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao buscar doação';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as DoacaoCreate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const doacao = await this.service.criar(dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: doacao,
        message: 'Doação cadastrada com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao cadastrar doação';
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
      const dados = req.body as DoacaoUpdate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const doacao = await this.service.atualizar(id, dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: doacao,
        message: 'Doação atualizada com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar doação';
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
        message: 'Doação deletada com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao deletar doação';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}

