import { Router } from 'express';
import { AnimalController } from '@/controllers/AnimalController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new AnimalController();

// Rotas protegidas
router.get('/animais', authenticateToken, (req, res) =>
  controller.listar(req, res)
);

router.get('/animais/projeto/:projetoId', authenticateToken, (req, res) =>
  controller.listarPorProjeto(req, res)
);

router.get('/animais/:id', authenticateToken, (req, res) =>
  controller.buscarPorId(req, res)
);

router.post(
  '/animais',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/animais/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/animais/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.deletar(req, res)
);

export default router;

