import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import organizationRoutes from './organizationRoutes';
import { membersRoutes } from './membersRoutes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Lar dos Anjos está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/organizations', membersRoutes); // Rotas de membros

// TODO: Adicionar outras rotas conforme implementadas
// router.use('/animals', animalRoutes);

export default router;
