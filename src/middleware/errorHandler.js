import {
ERROR_CODES,
ERROR_DICTIONARY
} from '../constants/error.constants.js';

// Middleware centralizado para manejar todos los errores de la API.
export const errorHandler = (err, req, res, next) => {

// Buscamos el código del error dentro del diccionario.
// Si no existe, utilizamos el error genérico de servidor.
const error = ERROR_DICTIONARY[err.code]
|| ERROR_DICTIONARY[ERROR_CODES.INTERNAL_SERVER_ERROR];

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