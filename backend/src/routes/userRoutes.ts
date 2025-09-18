import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest, userSchema } from '../middleware/validation';
import multer from 'multer';

const router = Router();

// Configurar multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/users - Listar usuários
router.get('/', UserController.getUsers);

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', UserController.getUserById);

// POST /api/users - Criar usuário
router.post('/', validateRequest(userSchema), UserController.createUser);

// PUT /api/users/:id - Atualizar usuário
// Para updates, fazemos todos os campos opcionais
const updateUserSchema = userSchema.fork(['nome', 'email', 'telefone', 'cpf', 'role'], (schema) => schema.optional());
router.put('/:id', validateRequest(updateUserSchema), UserController.updateUser);

// PUT /api/users/:id/profile - Atualizar perfil do usuário
router.put('/:id/profile', UserController.updateProfile);

// POST /api/users/:id/photo - Upload de foto de perfil
router.post('/:id/photo', upload.single('photo'), UserController.uploadProfilePhoto);

// DELETE /api/users/:id - Deletar usuário
router.delete('/:id', UserController.deleteUser);

export default router;
