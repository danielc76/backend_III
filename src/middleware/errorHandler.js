import {
  ERROR_CODES,
  ERROR_DICTIONARY
} from '../constants/error.constants.js';

import { logger } from '../utils/logger.js';

// Middleware centralizado para manejar todos los errores de la API.
export const errorHandler = (err, req, res, next) => {

  // Buscamos el código del error dentro del diccionario.
  // Si no existe, utilizamos el error genérico de servidor.
  const error = ERROR_DICTIONARY[err.code]
    || ERROR_DICTIONARY[ERROR_CODES.INTERNAL_SERVER_ERROR];

  // Los errores conocidos de negocio se registran como advertencias.
  // Los errores inesperados se registran como errores.
  if (err.code) {
    logger.warn(
      `${req.method} ${req.originalUrl} - ${err.code}: ${error.message}`
    );
  } else {
    logger.error(
      `${req.method} ${req.originalUrl} - Error inesperado: ${err.message}`
    );
  }

  // Devolvemos una respuesta uniforme para todos los errores de la API.
  return res.status(error.statusCode).json({

    status: 'error',

    // Si el error tiene código, lo mostramos.
    // Si no, utilizamos INTERNAL_SERVER_ERROR.
    error: err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,

    // El mensaje sale del diccionario centralizado.
    message: error.message

  });

};