import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { userDocumentUpload } from '../config/multer.config.js';
import { UPLOAD_FIELDS } from '../constants/file.constants.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = Router();

// GET /api/users
router.get('/', usersController.getUsers);

// GET /api/users/:uid
router.get('/:uid', usersController.getUserById);

// POST /api/users
router.post('/', usersController.createUser);

// POST /api/users/:uid/documents
router.post(
  '/:uid/documents',
  uploadSingle(userDocumentUpload, UPLOAD_FIELDS.USER_DOCUMENT),
  usersController.uploadUserDocument
);

// DELETE /api/users/:uid
router.delete('/:uid', usersController.deleteUser);

export default router;
