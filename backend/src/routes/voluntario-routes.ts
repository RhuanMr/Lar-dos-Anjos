import { Router } from 'express';
import { VoluntarioController } from '@/controllers/VoluntarioController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new VoluntarioController();

// Rotas protegidas
router.get(
  '/voluntarios',
  authenticateToken,
  (req, res) => controller.listar(req, res)
);

router.get(
  '/voluntarios/projeto/:projetoId',
  authenticateToken,
  (req, res) => controller.listarPorProjeto(req, res)
);

router.get(
  '/voluntarios/usuario/:usuarioId',
  authenticateToken,
  (req, res) => controller.listarPorUsuario(req, res)
);

router.get(
  '/voluntarios/:usuarioId/:projetoId',
  authenticateToken,
  (req, res) => controller.buscarPorUsuarioEProjeto(req, res)
);

router.post(
  '/voluntarios',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/voluntarios/:usuarioId/:projetoId',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/voluntarios/:usuarioId/:projetoId',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.deletar(req, res)
);

export default router;

