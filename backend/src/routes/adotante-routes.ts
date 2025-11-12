import { Router } from 'express';
import { AdotanteController } from '@/controllers/AdotanteController';

const router = Router();
const controller = new AdotanteController();

// Rota pública para cadastro de adotante (pode ser via formulário)
router.post('/adotantes', (req, res) =>
  controller.cadastrarComoAdotante(req, res)
);

// Rota protegida para remover role de adotante (apenas admin)
router.delete('/adotantes/:usuarioId', (req, res) =>
  controller.removerRoleAdotante(req, res)
);

export default router;

