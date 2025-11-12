import { Request, Response } from 'express';
import { AuthService, LoginCredentials } from '@/services/AuthService';
import { ApiResponse } from '@/types/index';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body as LoginCredentials;

      if (!email || !senha) {
        const response: ApiResponse = {
          success: false,
          error: 'Email e senha são obrigatórios',
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.authService.login({ email, senha });

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login realizado com sucesso',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erro ao realizar login',
      };

      const statusCode =
        error.message?.includes('incorretos') ||
        error.message?.includes('inativo') ||
        error.message?.includes('permissão')
          ? 401
          : 500;

      res.status(statusCode).json(response);
    }
  }

  async verificarToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        const response: ApiResponse = {
          success: false,
          error: 'Token não fornecido',
        };
        res.status(401).json(response);
        return;
      }

      const decoded = await this.authService.verificarToken(token);

      const response: ApiResponse = {
        success: true,
        data: decoded,
        message: 'Token válido',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || 'Erro ao verificar token',
      };

      const statusCode = error.message?.includes('expirado') ||
        error.message?.includes('inválido') ||
        error.message?.includes('não fornecido')
        ? 401
        : 500;

      res.status(statusCode).json(response);
    }
  }
}

