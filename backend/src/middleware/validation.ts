import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

export const validateRequest = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    let dataToValidate;
    
    switch (source) {
      case 'query':
        dataToValidate = req.query;
        break;
      case 'params':
        dataToValidate = req.params;
        break;
      default:
        dataToValidate = req.body;
    }
    
    const { error } = schema.validate(dataToValidate);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message
      });
      return;
    }
    
    next();
  };
};

// Schemas de validação
export const userSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  telefone: Joi.string().pattern(/^\d{10,11}$/).optional(),
  role: Joi.string().valid('admin', 'user', 'membro', 'voluntario').required(),
  cpf: Joi.string().pattern(/^\d{11}$/).required(),
  endereco_id: Joi.string().uuid().optional()
});

export const projectSchema = Joi.object({
  nome: Joi.string().min(2).max(200).required(),
  descricao: Joi.string().max(1000).optional(),
  cpf_user: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required(),
  endereco_visivel: Joi.boolean().default(false),
  endereco_id: Joi.string().uuid().optional()
});

export const animalSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  especie: Joi.string().min(2).max(50).required(),
  raca: Joi.string().max(50).optional(),
  idade: Joi.number().integer().min(0).max(30).optional(),
  condicao_saude: Joi.string().max(500).optional(),
  cirurgia: Joi.string().max(500).optional(),
  historico: Joi.string().max(1000).optional(),
  project_id: Joi.string().uuid().required()
});

export const enderecoSchema = Joi.object({
  cep: Joi.string().pattern(/^\d{8}$/).required(),
  estado: Joi.string().length(2).required(),
  cidade: Joi.string().min(2).max(100).required(),
  bairro: Joi.string().min(2).max(100).required(),
  numero: Joi.number().integer().positive().required(),
  complemento: Joi.string().max(100).optional()
});
