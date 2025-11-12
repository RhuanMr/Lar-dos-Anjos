import { Router } from 'express';
import { AtualizacaoAdocaoController } from '@/controllers/AtualizacaoAdocaoController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new AtualizacaoAdocaoController();

// Rotas protegidas
router.get('/atualizacoes-adocao', authenticateToken, (req, res) =>
  controller.listar(req, res)
);

router.get(
  '/atualizacoes-adocao/adocao/:adocaoId',
  authenticateToken,
  (req, res) => controller.listarPorAdocao(req, res)
);

router.get(
  '/atualizacoes-adocao/:id',
  authenticateToken,
  (req, res) => controller.buscarPorId(req, res)
);

router.post(
  '/atualizacoes-adocao',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/atualizacoes-adocao/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/atualizacoes-adocao/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.deletar(req, res)
);

export default router;

