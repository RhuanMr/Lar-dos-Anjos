import { Request, Response } from 'express';
import { AdotanteService } from '@/services/AdotanteService';
import { ApiResponse, AdotanteCreate } from '@/types/index';

export class AdotanteController {
  private service = new AdotanteService();

  async cadastrarComoAdotante(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as AdotanteCreate;
      const usuario = await this.service.cadastrarComoAdotante(dados);
      const response: ApiResponse = {
        success: true,
        data: usuario,
        message: 'Usuário cadastrado como adotante com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar como adotante';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  async removerRoleAdotante(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      if (!usuarioId) {
        res.status(400).json({
          success: false,
          error: 'ID do usuário não fornecido',
        });
        return;
      }
      const usuario = await this.service.removerRoleAdotante(usuarioId);
      const response: ApiResponse = {
        success: true,
        data: usuario,
        message: 'Role de adotante removida com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao remover role de adotante';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }
}

