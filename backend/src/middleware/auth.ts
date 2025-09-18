import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { ApiResponse } from '../types';

// Estender o tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de acesso necessário'
      });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
      return;
    }

    // Buscar dados completos do usuário no banco
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, nome, email, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: userData.id,
      email: userData.email,
      role: userData.role
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Erro na autenticação'
    });
  }
};

// Manter compatibilidade com código existente
export const authenticateToken = authMiddleware;

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Acesso negado. Permissão insuficiente.'
      });
      return;
    }

    next();
  };
};
