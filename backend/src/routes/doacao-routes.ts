import { Router } from 'express';
import { DoacaoController } from '@/controllers/DoacaoController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new DoacaoController();

// Rotas protegidas
router.get('/doacoes', authenticateToken, (req, res) =>
  controller.listar(req, res)
);

router.get('/doacoes/projeto/:projetoId', authenticateToken, (req, res) =>
  controller.listarPorProjeto(req, res)
);

router.get('/doacoes/usuario/:usuarioId', authenticateToken, (req, res) =>
  controller.listarPorUsuario(req, res)
);

router.get('/doacoes/:id', authenticateToken, (req, res) =>
  controller.buscarPorId(req, res)
);

router.post(
  '/doacoes',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.DOADOR),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/doacoes/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/doacoes/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.deletar(req, res)
);

export default router;

