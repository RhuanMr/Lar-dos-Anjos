import { Router } from 'express';
import { VaccineController } from '../controllers/VaccineController';
import { authMiddleware } from '../middleware/auth';
import Joi from 'joi';
import { validate } from '../middleware/validation';

const router = Router();

// Schema de validação para vacinas
const vaccineSchema = Joi.object({
  animal_id: Joi.string().uuid().required(),
  nome: Joi.string().min(2).max(100).required(),
  data: Joi.date().iso().required(),
  dose: Joi.number().integer().min(1).max(10).default(1),
  observacoes: Joi.string().max(500).optional()
});

const vaccineUpdateSchema = Joi.object({
  nome: Joi.string().min(2).max(100).optional(),
  data: Joi.date().iso().optional(),
  dose: Joi.number().integer().min(1).max(10).optional(),
  observacoes: Joi.string().max(500).optional()
});

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/vaccines/animal/:animal_id
 * @desc Listar vacinas de um animal
 * @access Private
 */
router.get('/animal/:animal_id', VaccineController.listByAnimal);

/**
 * @route GET /api/vaccines/organization/:project_id/report
 * @desc Obter relatório de vacinação de uma organização
 * @access Private
 */
router.get('/organization/:project_id/report', VaccineController.getVaccinationReport);

/**
 * @route GET /api/vaccines/organization/:project_id/upcoming
 * @desc Obter vacinas próximas do vencimento
 * @access Private
 */
router.get('/organization/:project_id/upcoming', VaccineController.getUpcomingVaccines);

/**
 * @route GET /api/vaccines/:id
 * @desc Buscar vacina por ID
 * @access Private
 */
router.get('/:id', VaccineController.getById);

/**
 * @route POST /api/vaccines
 * @desc Adicionar nova vacina
 * @access Private
 */
router.post('/', validate(vaccineSchema), VaccineController.create);

/**
 * @route PUT /api/vaccines/:id
 * @desc Atualizar vacina
 * @access Private
 */
router.put('/:id', validate(vaccineUpdateSchema), VaccineController.update);

/**
 * @route DELETE /api/vaccines/:id
 * @desc Deletar vacina
 * @access Private
 */
router.delete('/:id', VaccineController.delete);

export default router;
