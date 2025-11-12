import { Router } from 'express';
import { ProjetoController } from '@/controllers/ProjetoController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new ProjetoController();

router.get('/projetos', authenticateToken, (req, res) =>
  controller.listar(req, res)
);

router.get('/projetos/:id', authenticateToken, (req, res) =>
  controller.buscarPorId(req, res)
);

router.post(
  '/projetos',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/projetos/:id',
  authenticateToken,
  checkRole(Role.ADMINISTRADOR, Role.SUPER_ADMIN),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/projetos/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN),
  (req, res) => controller.deletar(req, res)
);

export default router;
