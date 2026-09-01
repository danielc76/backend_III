import multer from 'multer';

import { ERROR_CODES } from '../constants/error.constants.js';
import { customError } from '../utils/customError.js';
import { logger } from '../utils/logger.js';


const multerErrorCodes = {
  LIMIT_FILE_SIZE: ERROR_CODES.FILE_TOO_LARGE,
  LIMIT_UNEXPECTED_FILE: ERROR_CODES.INVALID_FILE_FIELD
};


export const uploadSingle = (uploader, fieldName) => {

  return (req, res, next) => {

    uploader.single(fieldName)(req, res, (error) => {

      if (!error) {
        return next();
      }

      const errorCode = error instanceof multer.MulterError
        ? multerErrorCodes[error.code] || ERROR_CODES.UPLOAD_ERROR
        : error.code || ERROR_CODES.UPLOAD_ERROR;

      if (errorCode === ERROR_CODES.UPLOAD_ERROR) {
        logger.error(`Error al guardar un archivo: ${error.message}`);
      } else {
        logger.warn(`Carga de archivo rechazada: ${errorCode}`);
      }

      next(new customError(errorCode));

    });

  };

};
