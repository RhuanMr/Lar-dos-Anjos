import { Request, Response } from 'express';
import { UsuarioService } from '@/services/UsuarioService';
import { ApiResponse, UsuarioCreate, UsuarioUpdate } from '@/types/index';

export class UsuarioController {
  private service = new UsuarioService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: usuarios,
      };
      res.json(response);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      const message =
        error instanceof Error ? error.message : 'Erro ao listar usuários';
      const errorDetails = error instanceof Error ? error.stack : undefined;
      
      res.status(500).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { details: errorDetails }),
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
      const usuario = await this.service.buscarPorId(id);
      const response: ApiResponse = {
        success: true,
        data: usuario,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao buscar usuário';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as UsuarioCreate;
      const usuario = await this.service.criar(dados);
      const response: ApiResponse = {
        success: true,
        data: usuario,
        message: 'Usuário criado com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar usuário';
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
      const dados = req.body as UsuarioUpdate;
      const usuario = await this.service.atualizar(id, dados);
      const response: ApiResponse = {
        success: true,
        data: usuario,
        message: 'Usuário atualizado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar usuário';
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
      await this.service.deletar(id);
      const response: ApiResponse = {
        success: true,
        message: 'Usuário deletado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao deletar usuário';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async promoverParaAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID não fornecido',
        });
        return;
      }
      const { performadoPor } = req.body;
      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const usuario = await this.service.promoverParaAdmin(id, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: usuario,
        message: 'Usuário promovido para Admin',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao promover usuário';
      res.status(403).json({
        success: false,
        error: message,
      });
    }
  }

  async definirSenha(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'ID não fornecido',
        });
        return;
      }

      const { senha, performadoPor } = req.body;
      if (!senha) {
        res.status(400).json({
          success: false,
          error: 'Senha é obrigatória',
        });
        return;
      }

      // Se houver usuário autenticado, usar seu ID como performadoPor
      // Se não houver (acesso público), performadoPor será undefined
      // O service vai validar se permite definir senha sem autenticação
      const usuarioAutenticado = (req as any).user?.id;
      const performadoPorFinal = performadoPor || usuarioAutenticado || undefined;

      await this.service.definirSenha(id, senha, performadoPorFinal);
      const response: ApiResponse = {
        success: true,
        message: 'Senha definida com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao definir senha';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }
}
