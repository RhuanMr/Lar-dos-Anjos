import { Request, Response, NextFunction } from 'express';
import { Role } from '@/types/enums';
import { ApiResponse } from '@/types/index';
import { AuthService } from '@/services/AuthService';

// Estender interface do Express para incluir usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: Role[];
        email: string;
      };
    }
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    // Verificar token JWT
    const authService = new AuthService();
    const decoded = await authService.verificarToken(token);

    // Adicionar informações do usuário à requisição
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles,
    };

    next();
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Token inválido',
    };

    const statusCode =
      error.message?.includes('expirado') ||
      error.message?.includes('inválido') ||
      error.message?.includes('não fornecido')
        ? 401
        : 403;

    res.status(statusCode).json(response);
  }
}

export function checkRole(...requiredRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado',
      };
      res.status(401).json(response);
      return;
    }

    const hasRole = req.user.roles.some((role) =>
      requiredRoles.includes(role)
    );

    if (!hasRole) {
      const response: ApiResponse = {
        success: false,
        error: 'Permissão insuficiente',
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
}
