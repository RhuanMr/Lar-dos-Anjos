import { Router } from 'express';
import { CasoMedicoController } from '@/controllers/CasoMedicoController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new CasoMedicoController();

// Rotas protegidas
router.get('/casos-medicos', authenticateToken, (req, res) =>
  controller.listar(req, res)
);

router.get('/casos-medicos/animal/:animalId', authenticateToken, (req, res) =>
  controller.listarPorAnimal(req, res)
);

router.get('/casos-medicos/:id', authenticateToken, (req, res) =>
  controller.buscarPorId(req, res)
);

router.post(
  '/casos-medicos',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/casos-medicos/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/casos-medicos/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.deletar(req, res)
);

export default router;

