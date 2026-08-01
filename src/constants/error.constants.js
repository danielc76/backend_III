// ERROR_CODES indica qué error ocurrió, por ejemplo ORDER_NOT_FOUND,
// ERROR_DICTIONARY indica qué hacer con ese error, asociándolo a un código HTTP y a un mensaje.

// Códigos de error utilizados por la API.
export const ERROR_CODES = {

  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXIST: 'USER_ALREADY_EXIST',

  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',

  DELIVERY_NOT_FOUND: 'DELIVERY_NOT_FOUND',
  INVALID_DELIVERY_STATUS: 'INVALID_DELIVERY_STATUS',

  DRIVER_NOT_AVAILABLE: 'DRIVER_NOT_AVAILABLE',

  INVALID_MOCK_AMOUNT: 'INVALID_MOCK_AMOUNT',
  MOCK_GENERATION_ERROR: 'MOCK_GENERATION_ERROR',

  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FORBIDDEN: 'FORBIDDEN',

  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'

};


// Evita que los códigos puedan modificarse accidentalmente.
Object.freeze(ERROR_CODES);


// Información asociada a cada código de error.
export const ERROR_DICTIONARY = {

  [ERROR_CODES.USER_NOT_FOUND]: {
    statusCode: 404,
    message: 'Usuario no encontrado'
  },

  [ERROR_CODES.USER_ALREADY_EXIST]: {
    statusCode: 400,
    message: 'El usuario ya existe'
  },

  [ERROR_CODES.ORDER_NOT_FOUND]: {
    statusCode: 404,
    message: 'No se encontró el pedido solicitado'
  },

  [ERROR_CODES.INVALID_ORDER_STATUS]: {
    statusCode: 400,
    message: 'El estado indicado no es válido'
  },

  [ERROR_CODES.DELIVERY_NOT_FOUND]: {
    statusCode: 404,
    message: 'No se encontró la entrega solicitada'
  },

  [ERROR_CODES.INVALID_DELIVERY_STATUS]: {
    statusCode: 400,
    message: 'El estado de entrega indicado no es válido'
  },

  [ERROR_CODES.DRIVER_NOT_AVAILABLE]: {
    statusCode: 409,
    message: 'El repartidor no está disponible para tomar una nueva entrega'
  },

  [ERROR_CODES.INVALID_MOCK_AMOUNT]: {
    statusCode: 400,
    message: 'La cantidad de registros a generar debe ser un número positivo'
  },

  [ERROR_CODES.MOCK_GENERATION_ERROR]: {
    statusCode: 500,
    message: 'No se pudieron generar los datos de prueba'
  },

  [ERROR_CODES.VALIDATION_ERROR]: {
    statusCode: 400,
    message: 'Faltan datos obligatorios'
  },

  [ERROR_CODES.FORBIDDEN]: {
    statusCode: 403,
    message: 'Acción no permitida'
  },

  [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    statusCode: 500,
    message: 'Error interno del servidor'
  }

};

