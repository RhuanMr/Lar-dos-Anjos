import { Router } from 'express';
import { AnimalController } from '../controllers/AnimalController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { animalSchema } from '../middleware/validation';
import multer from 'multer';

const router = Router();

// Configurar multer para upload de fotos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/animals/organization/:project_id
 * @desc Listar animais de uma organização
 * @access Private
 */
router.get('/organization/:project_id', AnimalController.list);

/**
 * @route GET /api/animals/organization/:project_id/stats
 * @desc Obter estatísticas de animais de uma organização
 * @access Private
 */
router.get('/organization/:project_id/stats', AnimalController.getStats);

/**
 * @route GET /api/animals/:id
 * @desc Buscar animal por ID
 * @access Private
 */
router.get('/:id', AnimalController.getById);

/**
 * @route GET /api/animals/:id/history
 * @desc Buscar histórico do animal
 * @access Private
 */
router.get('/:id/history', AnimalController.getHistory);

/**
 * @route POST /api/animals
 * @desc Criar novo animal
 * @access Private
 */
router.post('/', validate(animalSchema), AnimalController.create);

/**
 * @route PUT /api/animals/:id
 * @desc Atualizar dados do animal
 * @access Private
 */
router.put('/:id', AnimalController.update);

/**
 * @route PUT /api/animals/:id/status
 * @desc Atualizar status do animal
 * @access Private
 */
router.put('/:id/status', AnimalController.updateStatus);

/**
 * @route POST /api/animals/:id/photos
 * @desc Upload de fotos do animal
 * @access Private
 */
router.post('/:id/photos', upload.array('photos', 10), AnimalController.uploadPhotos);

/**
 * @route DELETE /api/animals/:id
 * @desc Deletar animal (soft delete)
 * @access Private
 */
router.delete('/:id', AnimalController.delete);

export default router;
