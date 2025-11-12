import { Router } from 'express';
import { AdocaoController } from '@/controllers/AdocaoController';
import { authenticateToken, checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';

const router = Router();
const controller = new AdocaoController();

// Rotas protegidas
router.get('/adocoes', authenticateToken, (req, res) =>
  controller.listar(req, res)
);

router.get('/adocoes/projeto/:projetoId', authenticateToken, (req, res) =>
  controller.listarPorProjeto(req, res)
);

router.get('/adocoes/adotante/:adotanteId', authenticateToken, (req, res) =>
  controller.listarPorAdotante(req, res)
);

router.get('/adocoes/animal/:animalId', authenticateToken, (req, res) =>
  controller.listarPorAnimal(req, res)
);

router.get('/adocoes/:id', authenticateToken, (req, res) =>
  controller.buscarPorId(req, res)
);

router.post(
  '/adocoes',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  (req, res) => controller.criar(req, res)
);

router.patch(
  '/adocoes/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  (req, res) => controller.atualizar(req, res)
);

router.delete(
  '/adocoes/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req, res) => controller.deletar(req, res)
);

export default router;

