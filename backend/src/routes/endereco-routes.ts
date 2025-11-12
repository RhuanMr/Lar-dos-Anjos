import { Router } from 'express';
import { EnderecoController } from '@/controllers/EnderecoController';
import { authenticateToken } from '@/middlewares/auth';

const router = Router();
const controller = new EnderecoController();

// Rotas protegidas
router.get('/enderecos', authenticateToken, (req, res) =>
  controller.listar(req, res)
);

router.get('/enderecos/:id', authenticateToken, (req, res) =>
  controller.buscarPorId(req, res)
);

router.post('/enderecos', authenticateToken, (req, res) =>
  controller.criar(req, res)
);

router.patch('/enderecos/:id', authenticateToken, (req, res) =>
  controller.atualizar(req, res)
);

router.delete('/enderecos/:id', authenticateToken, (req, res) =>
  controller.deletar(req, res)
);

export default router;

