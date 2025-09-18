import { Router } from 'express';
import { OrganizationController } from '../controllers/OrganizationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas as rotas de organizações requerem autenticação
router.use(authMiddleware);

// CRUD de organizações
router.post('/', OrganizationController.create);
router.get('/', OrganizationController.list);
router.get('/:id', OrganizationController.getById);
router.put('/:id', OrganizationController.update);
router.delete('/:id', OrganizationController.delete);

export default router;
