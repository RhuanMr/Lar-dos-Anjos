import { Router } from 'express';
import { UsuarioController } from '@/controllers/UsuarioController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new UsuarioController();

// Rotas públicas
router.post('/usuarios', (req, res) => controller.criar(req, res));

// Rotas protegidas
router.get('/usuarios', authenticateToken, (req, res) =>
  controller.listar(req, res)
);

router.get('/usuarios/:id', authenticateToken, (req, res) =>
  controller.buscarPorId(req, res)
);

router.patch('/usuarios/:id', authenticateToken, (req, res) =>
  controller.atualizar(req, res)
);

router.delete(
  '/usuarios/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.deletar(req, res)
);

router.patch(
  '/usuarios/:id/promover-admin',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN),
  (req, res) => controller.promoverParaAdmin(req, res)
);

export default router;
