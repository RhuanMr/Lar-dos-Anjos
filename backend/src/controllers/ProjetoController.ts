import { Request, Response } from 'express';
import { ProjetoService } from '@/services/ProjetoService';
import { ApiResponse, ProjetoCreate } from '@/types/index';

export class ProjetoController {
  private service = new ProjetoService();

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const projetos = await this.service.listar(req.user);
      const response: ApiResponse = {
        success: true,
        data: projetos,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao listar projetos';
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
      const projeto = await this.service.buscarPorId(id);
      const response: ApiResponse = {
        success: true,
        data: projeto,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao buscar projeto';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as ProjetoCreate;
      const projeto = await this.service.criar(dados);
      const response: ApiResponse = {
        success: true,
        data: projeto,
        message: 'Projeto criado com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar projeto';
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
      const dados = req.body as Partial<ProjetoCreate>;
      const projeto = await this.service.atualizar(id, dados);
      const response: ApiResponse = {
        success: true,
        data: projeto,
        message: 'Projeto atualizado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar projeto';
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
        message: 'Projeto deletado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao deletar projeto';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}
