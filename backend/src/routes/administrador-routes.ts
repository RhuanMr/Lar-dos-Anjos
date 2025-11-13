import { Router } from 'express';
import { AdministradorController } from '@/controllers/AdministradorController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new AdministradorController();

// Rotas protegidas
router.get(
  '/administradores',
  authenticateToken,
  (req, res) => controller.listar(req, res)
);

router.get(
  '/administradores/projeto/:projetoId',
  authenticateToken,
  (req, res) => controller.listarPorProjeto(req, res)
);

router.get(
  '/administradores/usuario/:usuarioId',
  authenticateToken,
  (req, res) => controller.listarPorUsuario(req, res)
);

router.get(
  '/administradores/:usuarioId/:projetoId',
  authenticateToken,
  (req, res) => controller.buscarPorUsuarioEProjeto(req, res)
);

router.post(
  '/administradores',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/administradores/:usuarioId/:projetoId',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/administradores/:usuarioId/:projetoId',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN),
  (req, res) => controller.deletar(req, res)
);

export default router;

