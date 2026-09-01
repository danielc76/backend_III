import { unlink } from 'node:fs/promises';
import path from 'node:path';

import { logger } from './logger.js';


export const buildFileMetadata = (file, documentType) => {

  const relativePath = path
    .relative(process.cwd(), file.path)
    .split(path.sep)
    .join('/');

  return {
    originalName: file.originalname,
    generatedName: file.filename,
    path: relativePath,
    mimeType: file.mimetype,
    size: file.size,
    documentType,
    uploadedAt: new Date()
  };

};


export const removeUploadedFile = async (file) => {

  if (!file?.path) {
    return;
  }

  try {

    await unlink(file.path);

  } catch (error) {

    logger.error(
      `No se pudo eliminar el archivo ${file.filename}: ${error.message}`
    );

  }

};
