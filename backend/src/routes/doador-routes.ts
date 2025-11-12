import { Router } from 'express';
import { DoadorController } from '@/controllers/DoadorController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new DoadorController();

// Rotas protegidas
router.get(
  '/doadores',
  authenticateToken,
  (req, res) => controller.listar(req, res)
);

router.get(
  '/doadores/projeto/:projetoId',
  authenticateToken,
  (req, res) => controller.listarPorProjeto(req, res)
);

router.get(
  '/doadores/usuario/:usuarioId',
  authenticateToken,
  (req, res) => controller.listarPorUsuario(req, res)
);

router.get(
  '/doadores/:usuarioId/:projetoId',
  authenticateToken,
  (req, res) => controller.buscarPorUsuarioEProjeto(req, res)
);

router.post(
  '/doadores',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/doadores/:usuarioId/:projetoId',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/doadores/:usuarioId/:projetoId',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.deletar(req, res)
);

export default router;

