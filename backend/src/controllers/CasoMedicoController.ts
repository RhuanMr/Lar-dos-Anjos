import { Request, Response } from 'express';
import { CasoMedicoService } from '@/services/CasoMedicoService';
import { ApiResponse, CasoMedicoCreate, CasoMedicoUpdate } from '@/types/index';

export class CasoMedicoController {
  private service = new CasoMedicoService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const casosMedicos = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: casosMedicos,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar casos médicos';
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
      const casosMedicos = await this.service.listarPorAnimal(animalId);
      const response: ApiResponse = {
        success: true,
        data: casosMedicos,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar casos médicos do animal';
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
      const casoMedico = await this.service.buscarPorId(id);
      const response: ApiResponse = {
        success: true,
        data: casoMedico,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao buscar caso médico';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as CasoMedicoCreate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const casoMedico = await this.service.criar(dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: casoMedico,
        message: 'Caso médico cadastrado com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar caso médico';
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
      const dados = req.body as CasoMedicoUpdate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const casoMedico = await this.service.atualizar(
        id,
        dados,
        performadoPor
      );
      const response: ApiResponse = {
        success: true,
        data: casoMedico,
        message: 'Caso médico atualizado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar caso médico';
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
        message: 'Caso médico deletado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao deletar caso médico';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}

