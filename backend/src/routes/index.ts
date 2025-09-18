import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import organizationRoutes from './organizationRoutes';
import animalRoutes from './animalRoutes';
import vaccineRoutes from './vaccineRoutes';
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
router.use('/animals', animalRoutes);
router.use('/vaccines', vaccineRoutes);

export default router;
