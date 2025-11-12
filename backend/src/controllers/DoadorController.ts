import { Request, Response } from 'express';
import { DoadorService } from '@/services/DoadorService';
import { ApiResponse, DoadorCreate, DoadorUpdate } from '@/types/index';

export class DoadorController {
  private service = new DoadorService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const doadores = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: doadores,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao listar doadores';
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
      const doadores = await this.service.listarPorProjeto(projetoId);
      const response: ApiResponse = {
        success: true,
        data: doadores,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar doadores do projeto';
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
      const doadores = await this.service.listarPorUsuario(usuarioId);
      const response: ApiResponse = {
        success: true,
        data: doadores,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar doadores do usuário';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async buscarPorUsuarioEProjeto(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, projetoId } = req.params;
      if (!usuarioId || !projetoId) {
        res.status(400).json({
          success: false,
          error: 'ID do usuário e ID do projeto são obrigatórios',
        });
        return;
      }
      const doador = await this.service.buscarPorUsuarioEProjeto(
        usuarioId,
        projetoId
      );
      const response: ApiResponse = {
        success: true,
        data: doador,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao buscar doador';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as DoadorCreate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const doador = await this.service.criar(dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: doador,
        message: 'Doador cadastrado com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao cadastrar doador';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, projetoId } = req.params;
      if (!usuarioId || !projetoId) {
        res.status(400).json({
          success: false,
          error: 'ID do usuário e ID do projeto são obrigatórios',
        });
        return;
      }
      const dados = req.body as DoadorUpdate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const doador = await this.service.atualizar(
        usuarioId,
        projetoId,
        dados,
        performadoPor
      );
      const response: ApiResponse = {
        success: true,
        data: doador,
        message: 'Doador atualizado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar doador';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, projetoId } = req.params;
      if (!usuarioId || !projetoId) {
        res.status(400).json({
          success: false,
          error: 'ID do usuário e ID do projeto são obrigatórios',
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

      await this.service.deletar(usuarioId, projetoId, performadoPor);
      const response: ApiResponse = {
        success: true,
        message: 'Doador deletado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao deletar doador';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}

