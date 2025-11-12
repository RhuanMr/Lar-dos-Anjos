import { Request, Response, NextFunction } from 'express';
import { Role } from '@/types/enums';
import { ApiResponse } from '@/types/index';

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

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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

  // Aqui você deve verificar o token com sua lógica de autenticação
  // Exemplo com JWT:
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  //   req.user = decoded;
  //   next();
  // } catch (error) {
  //   res.status(403).json({ success: false, error: 'Token inválido' });
  // }

  // Por enquanto, apenas avançar (depois integrar com JWT/Supabase)
  next();
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
