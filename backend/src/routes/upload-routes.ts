import { Router } from 'express';
import { UploadController } from '@/controllers/UploadController';
import { authenticateToken } from '@/middlewares/auth';
import { checkRole } from '@/middlewares/auth';
import { Role } from '@/types/enums';
import { uploadSingle, handleUploadError } from '@/middlewares/upload';

const router = Router();
const controller = new UploadController();

/**
 * @route   POST /api/upload/animal/:id
 * @desc    Upload foto de animal
 * @access  Private (SUPERADMIN, ADMINISTRADOR, FUNCIONARIO)
 */
router.post(
  '/upload/animal/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR, Role.FUNCIONARIO),
  uploadSingle('foto'),
  handleUploadError,
  (req: any, res: any) => controller.uploadAnimal(req, res)
);

/**
 * @route   POST /api/upload/usuario/:id
 * @desc    Upload foto de usuário
 * @access  Private (Usuário autenticado pode atualizar própria foto, SUPERADMIN e ADMINISTRADOR podem atualizar qualquer foto)
 */
router.post(
  '/upload/usuario/:id',
  authenticateToken,
  uploadSingle('foto'),
  handleUploadError,
  (req: any, res: any) => controller.uploadUsuario(req, res)
);

/**
 * @route   POST /api/upload/projeto/:id
 * @desc    Upload foto de projeto
 * @access  Private (SUPERADMIN, ADMINISTRADOR)
 */
router.post(
  '/upload/projeto/:id',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  uploadSingle('foto'),
  handleUploadError,
  (req: any, res: any) => controller.uploadProjeto(req, res)
);

/**
 * @route   DELETE /api/upload/:bucket/:path
 * @desc    Deleta uma imagem
 * @access  Private (SUPERADMIN, ADMINISTRADOR)
 */
router.delete(
  '/upload/:bucket/:path',
  authenticateToken,
  checkRole(Role.SUPER_ADMIN, Role.ADMINISTRADOR),
  (req: any, res: any) => controller.deletarImagem(req, res)
);

export default router;

