import { Router } from 'express';
import { FuncionarioController } from '@/controllers/FuncionarioController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new FuncionarioController();

// Rotas protegidas
router.get(
  '/funcionarios',
  authenticateToken,
  (req, res) => controller.listar(req, res)
);

router.get(
  '/funcionarios/projeto/:projetoId',
  authenticateToken,
  (req, res) => controller.listarPorProjeto(req, res)
);

router.get(
  '/funcionarios/usuario/:usuarioId',
  authenticateToken,
  (req, res) => controller.listarPorUsuario(req, res)
);

router.get(
  '/funcionarios/:usuarioId/:projetoId',
  authenticateToken,
  (req, res) => controller.buscarPorUsuarioEProjeto(req, res)
);

router.post(
  '/funcionarios',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/funcionarios/:usuarioId/:projetoId',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/funcionarios/:usuarioId/:projetoId',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.deletar(req, res)
);

router.patch(
  '/funcionarios/:usuarioId/:projetoId/conceder-privilegios',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.concederPrivilegios(req, res)
);

router.patch(
  '/funcionarios/:usuarioId/:projetoId/remover-privilegios',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.removerPrivilegios(req, res)
);

export default router;

