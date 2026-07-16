import * as usersService from '../services/user.service.js';

export const getUsers = async (req, res) => {
  try {
    const users = await usersService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.uid);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = await usersService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await usersService.deleteUser(req.params.uid);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};