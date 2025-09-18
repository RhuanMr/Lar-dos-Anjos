import { Router } from 'express';
import { FinancialController } from '../controllers/FinancialController';
import { authMiddleware } from '../middleware/auth';
import Joi from 'joi';
import { validate } from '../middleware/validation';

const router = Router();

// Schema de validação para transações financeiras
const transactionSchema = Joi.object({
  project_id: Joi.string().uuid().required(),
  tipo: Joi.string().valid('entrada', 'saida').required(),
  categoria: Joi.string().valid(
    'doacao', 
    'adocao', 
    'veterinario', 
    'alimentacao', 
    'medicamentos', 
    'infraestrutura', 
    'outros'
  ).required(),
  valor: Joi.number().positive().required(),
  descricao: Joi.string().max(500).optional(),
  data_transacao: Joi.date().iso().required()
});

const transactionUpdateSchema = Joi.object({
  tipo: Joi.string().valid('entrada', 'saida').optional(),
  categoria: Joi.string().valid(
    'doacao', 
    'adocao', 
    'veterinario', 
    'alimentacao', 
    'medicamentos', 
    'infraestrutura', 
    'outros'
  ).optional(),
  valor: Joi.number().positive().optional(),
  descricao: Joi.string().max(500).optional(),
  data_transacao: Joi.date().iso().optional()
});

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/financial/organization/:project_id
 * @desc Listar transações de uma organização
 * @access Private
 */
router.get('/organization/:project_id', FinancialController.list);

/**
 * @route GET /api/financial/organization/:project_id/summary
 * @desc Obter resumo financeiro de uma organização
 * @access Private
 */
router.get('/organization/:project_id/summary', FinancialController.getSummary);

/**
 * @route GET /api/financial/organization/:project_id/stats
 * @desc Obter estatísticas financeiras detalhadas
 * @access Private
 */
router.get('/organization/:project_id/stats', FinancialController.getStats);

/**
 * @route GET /api/financial/:id
 * @desc Buscar transação por ID
 * @access Private
 */
router.get('/:id', FinancialController.getById);

/**
 * @route POST /api/financial
 * @desc Criar nova transação
 * @access Private
 */
router.post('/', validate(transactionSchema), FinancialController.create);

/**
 * @route PUT /api/financial/:id
 * @desc Atualizar transação
 * @access Private
 */
router.put('/:id', validate(transactionUpdateSchema), FinancialController.update);

/**
 * @route DELETE /api/financial/:id
 * @desc Deletar transação
 * @access Private
 */
router.delete('/:id', FinancialController.delete);

export default router;
