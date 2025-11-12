import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types/index';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ Erro:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  const response: ApiResponse = {
    success: false,
    error: message,
  };

  res.status(statusCode).json(response);
}
