import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';

const router = Router();
const controller = new AuthController();

// Rota pública de login
router.post('/auth/login', (req, res) => controller.login(req, res));

// Rota para verificar token (pode ser usada para validar token no frontend)
router.post('/auth/verify', (req, res) => controller.verificarToken(req, res));

export default router;

