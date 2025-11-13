import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ApiResponse } from '@/types/index';

// Configurar multer para armazenar em memória
const storage = multer.memoryStorage();

// Configurar multer
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    // Validar tipo de arquivo
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (validTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      const response: ApiResponse = {
        success: false,
        error:
          'Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, GIF, WebP) são aceitas.',
      };
      cb(new Error(response.error) as any);
    }
  },
});

/**
 * Middleware para upload de uma única imagem
 */
export const uploadSingle = (fieldName: string = 'foto') => {
  return upload.single(fieldName);
};

/**
 * Middleware para upload de múltiplas imagens
 */
export const uploadMultiple = (fieldName: string = 'fotos', maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Obtém mensagem de erro amigável do multer
 */
function getMulterErrorMessage(err: multer.MulterError): string {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return 'Arquivo muito grande. O tamanho máximo é 5MB.';
    case 'LIMIT_FILE_COUNT':
      return 'Muitos arquivos. O limite máximo é 10 arquivos.';
    case 'LIMIT_UNEXPECTED_FILE':
      return 'Campo de arquivo inesperado.';
    default:
      return `Erro ao processar upload: ${err.message}`;
  }
}

/**
 * Middleware para tratamento de erros do multer
 */
export function handleUploadError(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    const response: ApiResponse = {
      success: false,
      error: getMulterErrorMessage(err),
    };

    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json(response);
      return;
    }

    res.status(400).json(response);
    return;
  }

  if (err) {
    const response: ApiResponse = {
      success: false,
      error: err.message || 'Erro ao processar upload',
    };
    res.status(400).json(response);
    return;
  }

  next();
}

