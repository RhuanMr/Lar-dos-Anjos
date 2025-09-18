import { Router } from 'express';
import { MembersController } from '../controllers/MembersController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Schemas de validação
const createMemberSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  role: Joi.string().valid('admin', 'membro', 'voluntario').default('membro'),
  status: Joi.string().valid('ativo', 'inativo', 'suspenso').default('ativo')
});

const updateMemberSchema = Joi.object({
  role: Joi.string().valid('admin', 'membro', 'voluntario').optional(),
  status: Joi.string().valid('ativo', 'inativo', 'suspenso').optional()
}).min(1);

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid('admin', 'membro', 'voluntario').optional(),
  status: Joi.string().valid('ativo', 'inativo', 'suspenso').optional(),
  search: Joi.string().max(100).optional()
});

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/organizations/:projectId/members - Listar membros da organização
router.get(
  '/:projectId/members',
  validateRequest(querySchema, 'query'),
  MembersController.getOrganizationMembers
);

// POST /api/organizations/:projectId/members - Adicionar membro à organização
router.post(
  '/:projectId/members',
  validateRequest(createMemberSchema),
  MembersController.addMember
);

// GET /api/organizations/:projectId/members/:userId - Buscar membro específico
router.get(
  '/:projectId/members/:userId',
  MembersController.getMember
);

// PUT /api/organizations/:projectId/members/:userId - Atualizar membro
router.put(
  '/:projectId/members/:userId',
  validateRequest(updateMemberSchema),
  MembersController.updateMember
);

// DELETE /api/organizations/:projectId/members/:userId - Remover membro
router.delete(
  '/:projectId/members/:userId',
  MembersController.removeMember
);

// GET /api/organizations/:projectId/members/stats - Estatísticas de membros
router.get(
  '/:projectId/members/stats',
  MembersController.getMemberStats
);

// GET /api/users/:userId/organizations - Listar organizações de um usuário
router.get(
  '/users/:userId/organizations',
  MembersController.getUserOrganizations
);

export { router as membersRoutes };
