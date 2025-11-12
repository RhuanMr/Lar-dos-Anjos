import { Request, Response } from 'express';
import { EnderecoService } from '@/services/EnderecoService';
import { ApiResponse, EnderecoCreate, EnderecoUpdate } from '@/types/index';

export class EnderecoController {
  private service = new EnderecoService();

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const enderecos = await this.service.listar();
      const response: ApiResponse = {
        success: true,
        data: enderecos,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao listar endereços';
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
      const endereco = await this.service.buscarPorId(id);
      const response: ApiResponse = {
        success: true,
        data: endereco,
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao buscar endereço';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dados = req.body as EnderecoCreate;
      const endereco = await this.service.criar(dados);
      const response: ApiResponse = {
        success: true,
        data: endereco,
        message: 'Endereço cadastrado com sucesso',
      };
      res.status(201).json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao cadastrar endereço';
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
      const dados = req.body as EnderecoUpdate;
      const endereco = await this.service.atualizar(id, dados);
      const response: ApiResponse = {
        success: true,
        data: endereco,
        message: 'Endereço atualizado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar endereço';
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
        message: 'Endereço deletado com sucesso',
      };
      res.json(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao deletar endereço';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }
}

