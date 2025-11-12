import { Request, Response } from 'express';
import { AtualizacaoAdocaoService } from '@/services/AtualizacaoAdocaoService';
import {
  ApiResponse,
  AtualizacaoAdocaoCreate,
  AtualizacaoAdocaoUpdate,
} from '@/types/index';

export class AtualizacaoAdocaoController {
  private service = new AtualizacaoAdocaoService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const atualizacoes = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: atualizacoes,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar atualizações de adoção';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async listarPorAdocao(req: Request, res: Response): Promise<void> {
    try {
      const { adocaoId } = req.params;
      if (!adocaoId) {
        res.status(400).json({
          success: false,
          error: 'ID da adoção não fornecido',
        });
        return;
      }
      const atualizacoes = await this.service.listarPorAdocao(adocaoId);
      const response: ApiResponse = {
        success: true,
        data: atualizacoes,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao listar atualizações da adoção';
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
      const atualizacao = await this.service.buscarPorId(id);
      const response: ApiResponse = {
        success: true,
        data: atualizacao,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao buscar atualização de adoção';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as AtualizacaoAdocaoCreate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const atualizacao = await this.service.criar(dados, performadoPor);
      const response: ApiResponse = {
        success: true,
        data: atualizacao,
        message: 'Atualização de adoção cadastrada com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar atualização de adoção';
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
      const dados = req.body as AtualizacaoAdocaoUpdate;
      const performadoPor = (req as any).user?.id || req.body.performadoPor;

      if (!performadoPor) {
        res.status(400).json({
          success: false,
          error: 'performadoPor é obrigatório',
        });
        return;
      }

      const atualizacao = await this.service.atualizar(
        id,
        dados,
        performadoPor
      );
      const response: ApiResponse = {
        success: true,
        data: atualizacao,
        message: 'Atualização de adoção atualizada com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar atualização de adoção';
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
        message: 'Atualização de adoção deletada com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao deletar atualização de adoção';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}

