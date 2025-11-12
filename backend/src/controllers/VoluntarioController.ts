import { Request, Response } from 'express';
import { VoluntarioService } from '@/services/VoluntarioService';
import { ApiResponse, VoluntarioCreate, VoluntarioUpdate } from '@/types/index';

export class VoluntarioController {
  private service = new VoluntarioService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const voluntarios = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: voluntarios,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar voluntários';
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
      const voluntarios = await this.service.listarPorProjeto(projetoId);
      const response: ApiResponse = {
        success: true,
        data: voluntarios,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar voluntários do projeto';
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
      const voluntarios = await this.service.listarPorUsuario(usuarioId);
      const response: ApiResponse = {
        success: true,
        data: voluntarios,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar voluntários do usuário';
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
      const voluntario = await this.service.buscarPorUsuarioEProjeto(
        usuarioId,
        projetoId
      );
      const response: ApiResponse = {
        success: true,
        data: voluntario,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao buscar voluntário';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as VoluntarioCreate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const voluntario = await this.service.criar(dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: voluntario,
        message: 'Voluntário cadastrado com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar voluntário';
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
      const dados = req.body as VoluntarioUpdate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const voluntario = await this.service.atualizar(
        usuarioId,
        projetoId,
        dados,
        performadoPor
      );
      const response: ApiResponse = {
        success: true,
        data: voluntario,
        message: 'Voluntário atualizado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar voluntário';
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
        message: 'Voluntário deletado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao deletar voluntário';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}

