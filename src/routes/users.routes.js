import { Router } from 'express';
import User from '../models/user.model.js';

const router = Router();

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

// GET /api/users/:uid
router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findById(req.params.uid);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send('Faltan datos obligatorios');
    }

    if (role === 'admin') {
      return res.status(403).send('No puedes crear admin');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya esta registrado' });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: password,
      role: role || 'customer'
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

// DELETE /api/users/:uid
router.delete('/:uid', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.uid);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

export default router;
