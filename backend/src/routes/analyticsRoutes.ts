import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @route POST /api/analytics/visits/:project_id
 * @desc Registrar visita à página de uma organização
 * @access Private
 */
router.post('/visits/:project_id', AnalyticsController.registerVisit);

/**
 * @route GET /api/analytics/visits/:project_id/stats
 * @desc Obter estatísticas de visitas de uma organização
 * @access Private
 */
router.get('/visits/:project_id/stats', AnalyticsController.getVisitStats);

/**
 * @route GET /api/analytics/dashboard/:project_id
 * @desc Obter analytics completo do dashboard
 * @access Private
 */
router.get('/dashboard/:project_id', AnalyticsController.getDashboardAnalytics);

/**
 * @route GET /api/analytics/adoption/:project_id
 * @desc Obter métricas de adoção
 * @access Private
 */
router.get('/adoption/:project_id', AnalyticsController.getAdoptionMetrics);

export default router;
