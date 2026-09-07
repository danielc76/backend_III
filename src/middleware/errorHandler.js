import {
  ERROR_CODES,
  ERROR_DICTIONARY
} from '../constants/error.constants.js';

import { logger } from '../utils/logger.js';


const mongooseErrorNames = [
  'ValidationError',
  'CastError'
];


const getErrorCode = (error) => {

  if (ERROR_DICTIONARY[error.code]) {
    return error.code;
  }

  if (mongooseErrorNames.includes(error.name)) {
    return ERROR_CODES.INVALID_DATA;
  }

  return ERROR_CODES.INTERNAL_SERVER_ERROR;

};


// Middleware centralizado para manejar todos los errores de la API.
export const errorHandler = (err, req, res, next) => {

  const errorCode = getErrorCode(err);
  const error = ERROR_DICTIONARY[errorCode];

  if (!err.skipLog) {
    // Los errores conocidos de negocio se registran como advertencias.
    // Los errores inesperados se registran como errores.
    if (errorCode !== ERROR_CODES.INTERNAL_SERVER_ERROR) {
      logger.warn(
        `${req.method} ${req.originalUrl} - ${errorCode}: ${error.message}`
      );
    } else {
      logger.error(
        `${req.method} ${req.originalUrl} - Error inesperado: ${err.message}`
      );
    }
  }

  // Devolvemos una respuesta uniforme para todos los errores de la API.
  return res.status(error.statusCode).json({

    status: 'error',

    error: errorCode,

    // El mensaje sale del diccionario centralizado.
    message: error.message

  });

};
