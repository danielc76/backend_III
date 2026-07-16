import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';

const router = Router();

// GET /api/users
router.get('/', usersController.getUsers);

// GET /api/users/:uid
router.get('/:uid', usersController.getUserById);

// POST /api/users
router.post('/', usersController.createUser);

// DELETE /api/users/:uid
router.delete('/:uid', usersController.deleteUser);

export default router;