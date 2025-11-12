import { Request, Response } from 'express';
import { VacinaService } from '@/services/VacinaService';
import { ApiResponse, VacinaCreate, VacinaUpdate } from '@/types/index';

export class VacinaController {
  private service = new VacinaService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const vacinas = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: vacinas,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao listar vacinas';
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
      const vacinas = await this.service.listarPorAnimal(animalId);
      const response: ApiResponse = {
        success: true,
        data: vacinas,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar vacinas do animal';
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
      const vacina = await this.service.buscarPorId(id);
      const response: ApiResponse = {
        success: true,
        data: vacina,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao buscar vacina';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as VacinaCreate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const vacina = await this.service.criar(dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: vacina,
        message: 'Vacina cadastrada com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao cadastrar vacina';
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
      const dados = req.body as VacinaUpdate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const vacina = await this.service.atualizar(id, dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: vacina,
        message: 'Vacina atualizada com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar vacina';
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
        message: 'Vacina deletada com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao deletar vacina';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}

