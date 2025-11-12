import { Router } from 'express';
import { VacinaController } from '@/controllers/VacinaController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new VacinaController();

// Rotas protegidas
router.get('/vacinas', authenticateToken, (req, res) =>
  controller.listar(req, res)
);

router.get('/vacinas/animal/:animalId', authenticateToken, (req, res) =>
  controller.listarPorAnimal(req, res)
);

router.get('/vacinas/:id', authenticateToken, (req, res) =>
  controller.buscarPorId(req, res)
);

router.post(
  '/vacinas',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/vacinas/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/vacinas/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.deletar(req, res)
);

export default router;

