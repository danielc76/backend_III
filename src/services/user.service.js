import * as usersRepository from '../repositories/user.repository.js';

export const getUsers = async () => {
  return await usersRepository.getUsers();
};

export const getUserById = async (id) => {
  return await usersRepository.getUserById(id);
};

export const createUser = async (userData) => {

  const { firstName, lastName, email, password, role } = userData;

  if (!firstName || !lastName || !email || !password) {
    throw new Error('Faltan datos obligatorios');
  }

  if (role === 'admin') {
    throw new Error('No puedes crear admin');
  }

  const existingUser = await usersRepository.getUserByEmail(email);

  if (existingUser) {
    throw new Error('El email ya esta registrado');
  }

  const newUser = await usersRepository.createUser({
    firstName,
    lastName,
    email,
    password,
    role: role || 'customer'
  });

  return newUser;
};

export const deleteUser = async (id) => {
  return await usersRepository.deleteUser(id);
};