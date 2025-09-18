import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Erro de validação
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      message: error.message
    });
    return;
  }

  // Erro de autenticação
  if (error.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      error: 'Não autorizado'
    });
    return;
  }

  // Erro de permissão
  if (error.name === 'ForbiddenError') {
    res.status(403).json({
      success: false,
      error: 'Acesso negado'
    });
    return;
  }

  // Erro de recurso não encontrado
  if (error.name === 'NotFoundError') {
    res.status(404).json({
      success: false,
      error: 'Recurso não encontrado'
    });
    return;
  }

  // Erro interno do servidor
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response<ApiResponse>
): void => {
  res.status(404).json({
    success: false,
    error: `Rota ${req.originalUrl} não encontrada`
  });
};
