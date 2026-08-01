// Importamos el Service porque el Controller se encarga de
// recibir la petición y delegar la lógica de negocio.
import * as usersService from '../services/user.service.js';


// Obtiene todos los usuarios.
// El Controller recibe la petición, llama al Service y devuelve
// el resultado exitoso al cliente.
export const getUsers = async (req, res, next) => {

  try {

    const users = await usersService.getUsers();

    res.json(users);

  } catch (error) {

    // El error no se responde directamente desde el Controller.
    // next(error) lo deriva al middleware global de errores.
    next(error);

  }

};


// Obtiene un usuario por su ID.
export const getUserById = async (req, res, next) => {

  try {

    const user = await usersService.getUserById(req.params.uid);

    res.json(user);

  } catch (error) {

    // El Service puede lanzar un CustomError, por ejemplo
    // USER_NOT_FOUND. El middleware global se encarga
    // de convertirlo en la respuesta HTTP correspondiente.
    next(error);

  }

};


// Crea un nuevo usuario.
// Las reglas de negocio se encuentran en el Service.
export const createUser = async (req, res, next) => {

  try {

    const newUser = await usersService.createUser(req.body);

    res.status(201).json(newUser);

  } catch (error) {

    // Los errores de validación, usuario existente,
    // permisos, etc. pasan al middleware global.
    next(error);

  }

};


// Elimina un usuario por su ID.
export const deleteUser = async (req, res, next) => {

  try {

    const user = await usersService.deleteUser(req.params.uid);

    res.json({
      message: 'Usuario eliminado'
    });

  } catch (error) {

    // El Service se encarga de detectar si el usuario no existe.
    // El Controller solamente deriva el error al middleware.
    next(error);

  }

};