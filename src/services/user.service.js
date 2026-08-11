import * as usersRepository from '../repositories/user.repository.js';

import { customError } from '../utils/customError.js';
import { ERROR_CODES } from '../constants/error.constants.js';
import { USER_ROLES } from '../constants/index.js';
import { logger } from '../utils/logger.js';


// Obtiene todos los usuarios a través del Repository.
export const getUsers = async () => {

  return await usersRepository.getUsers();

};


// Busca un usuario por ID.
// Si no existe, lanza un error que luego maneja el middleware global.
export const getUserById = async (id) => {

  const user = await usersRepository.getUserById(id);

  if (!user) {

    logger.warn(`Usuario no encontrado: ${id}`);

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

    logger.warn('Intento de crear usuario con datos obligatorios faltantes');

    throw new customError(ERROR_CODES.VALIDATION_ERROR);

  }


  // Los administradores se crean por fuera del flujo público de registro.
  // No se permite crear usuarios con rol administrador.
  if (role === USER_ROLES.ADMIN) {

    logger.warn(`Intento de crear usuario con rol ADMIN: ${email}`);

    throw new customError(ERROR_CODES.FORBIDDEN);

  }


  // Verifica que el email no esté registrado previamente.
  const existingUser = await usersRepository.getUserByEmail(email);

  if (existingUser) {

    logger.warn(`Intento de registrar email ya existente: ${email}`);

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


  logger.info(`Usuario creado correctamente: ${email}`);

  return newUser;

};


// Elimina un usuario por ID.
// Si no existe, se informa mediante el error personalizado.
export const deleteUser = async (id) => {

  const user = await usersRepository.deleteUser(id);

  if (!user) {

    logger.warn(`Intento de eliminar usuario inexistente: ${id}`);

    throw new customError(ERROR_CODES.USER_NOT_FOUND);

  }


  logger.info(`Usuario eliminado correctamente: ${id}`);

  return user;

};