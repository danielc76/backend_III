import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import multer from 'multer';

import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_DIRECTORIES
} from '../constants/file.constants.js';
import { ERROR_CODES } from '../constants/error.constants.js';
import { customError } from '../utils/customError.js';


const getUploadRoot = () => {

  const folders = process.env.NODE_ENV === 'test'
    ? ['uploads', 'test']
    : ['uploads'];

  return path.resolve(...folders);

};


const createStorage = (directory) => multer.diskStorage({

  destination: async (req, file, callback) => {

    const destination = path.join(getUploadRoot(), directory);

    try {

      // Las carpetas se crean cuando llega el primer archivo.
      await mkdir(destination, { recursive: true });
      callback(null, destination);

    } catch (error) {

      callback(new customError(ERROR_CODES.UPLOAD_ERROR));

    }

  },

  filename: (req, file, callback) => {

    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;

    callback(null, fileName);

  }

});


const fileFilter = (req, file, callback) => {

  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return callback(new customError(ERROR_CODES.INVALID_FILE_TYPE));
  }

  callback(null, true);

};


const createUploader = (directory) => multer({
  storage: createStorage(directory),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});


export const userDocumentUpload = createUploader(
  UPLOAD_DIRECTORIES.USER_DOCUMENTS
);


export const deliveryProofUpload = createUploader(
  UPLOAD_DIRECTORIES.DELIVERY_PROOFS
);
