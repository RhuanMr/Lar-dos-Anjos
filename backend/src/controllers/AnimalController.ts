import { Request, Response } from 'express';
import { AnimalService } from '@/services/AnimalService';
import { ApiResponse, AnimalCreate, AnimalUpdate } from '@/types/index';

export class AnimalController {
  private service = new AnimalService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const animais = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: animais,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao listar animais';
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
      const animais = await this.service.listarPorProjeto(projetoId);
      const response: ApiResponse = {
        success: true,
        data: animais,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar animais do projeto';
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
      const animal = await this.service.buscarPorId(id);
      const response: ApiResponse = {
        success: true,
        data: animal,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao buscar animal';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as AnimalCreate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const animal = await this.service.criar(dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: animal,
        message: 'Animal cadastrado com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao cadastrar animal';
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
      const dados = req.body as AnimalUpdate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const animal = await this.service.atualizar(id, dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: animal,
        message: 'Animal atualizado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar animal';
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
        message: 'Animal deletado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao deletar animal';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}

