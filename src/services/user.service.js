import * as usersRepository from '../repositories/user.repository.js';

import { customError } from '../utils/customError.js';
import { ERROR_CODES } from '../constants/error.constants.js';
import { USER_ROLES } from '../constants/index.js';


// Obtiene todos los usuarios a través del Repository.
export const getUsers = async () => {

  return await usersRepository.getUsers();

};


// Busca un usuario por ID.
// Si no existe, lanza un error que luego maneja el middleware global.
export const getUserById = async (id) => {

  const user = await usersRepository.getUserById(id);

  if (!user) {

    throw new customError(ERROR_CODES.USER_NOT_FOUND);

  }

  return user;

};


// Crea un usuario aplicando las reglas de negocio.
export const createUser = async (userData) => {

  const {
    firstName,
    lastName,
    email,
    password,
    role
  } = userData;


  // Verifica que estén presentes los datos obligatorios.
  if (!firstName || !lastName || !email || !password) {

    throw new customError(ERROR_CODES.VALIDATION_ERROR);

  }


  // Los administradores se creen por fuera del flujo público de registro.
  // No se permite crear usuarios con rol administrador.
  if (role === USER_ROLES.ADMIN) {

    throw new customError(ERROR_CODES.FORBIDDEN);

  }


  // Verifica que el email no esté registrado previamente.
  const existingUser = await usersRepository.getUserByEmail(email);

  if (existingUser) {

    throw new customError(ERROR_CODES.USER_ALREADY_EXIST);

  }


  // Si no se indica un rol, se crea como cliente.
  const newUser = await usersRepository.createUser({

    firstName,
    lastName,
    email,
    password,
    role: role || USER_ROLES.CUSTOMER

  });


  return newUser;

};


// Elimina un usuario por ID.
// Si no existe, se informa mediante el error personalizado.
export const deleteUser = async (id) => {

  const user = await usersRepository.deleteUser(id);

  if (!user) {

    throw new customError(ERROR_CODES.USER_NOT_FOUND);

  }

  return user;

};