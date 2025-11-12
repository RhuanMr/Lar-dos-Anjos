import { Request, Response } from 'express';
import { FuncionarioService } from '@/services/FuncionarioService';
import {
  ApiResponse,
  FuncionarioCreate,
  FuncionarioUpdate,
} from '@/types/index';

export class FuncionarioController {
  private service = new FuncionarioService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const funcionarios = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: funcionarios,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar funcionários';
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
      const funcionarios = await this.service.listarPorProjeto(projetoId);
      const response: ApiResponse = {
        success: true,
        data: funcionarios,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar funcionários do projeto';
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
      const funcionarios = await this.service.listarPorUsuario(usuarioId);
      const response: ApiResponse = {
        success: true,
        data: funcionarios,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar funcionários do usuário';
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
      const funcionario = await this.service.buscarPorUsuarioEProjeto(
        usuarioId,
        projetoId
      );
      const response: ApiResponse = {
        success: true,
        data: funcionario,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao buscar funcionário';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as FuncionarioCreate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const funcionario = await this.service.criar(dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: funcionario,
        message: 'Funcionário cadastrado com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar funcionário';
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
      const dados = req.body as FuncionarioUpdate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const funcionario = await this.service.atualizar(
        usuarioId,
        projetoId,
        dados,
        performadoPor
      );
      const response: ApiResponse = {
        success: true,
        data: funcionario,
        message: 'Funcionário atualizado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar funcionário';
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
        message: 'Funcionário deletado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao deletar funcionário';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async concederPrivilegios(req: Request, res: Response): Promise<void> {
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

      const funcionario = await this.service.concederPrivilegios(
        usuarioId,
        projetoId,
        performadoPor
      );
      const response: ApiResponse = {
        success: true,
        data: funcionario,
        message: 'Privilégios concedidos com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao conceder privilégios';
      res.status(403).json({
        success: false,
        error: message,
      });
    }
  }

  async removerPrivilegios(req: Request, res: Response): Promise<void> {
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

      const funcionario = await this.service.removerPrivilegios(
        usuarioId,
        projetoId,
        performadoPor
      );
      const response: ApiResponse = {
        success: true,
        data: funcionario,
        message: 'Privilégios removidos com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao remover privilégios';
      res.status(403).json({
        success: false,
        error: message,
      });
    }
  }
}

