// Inicia el servidor y establece la conexión con MongoDB.

import mongoose from 'mongoose';

import app from './app.js';

import { config } from './config/env.config.js';

import { logger } from './utils/logger.js';


logger.info('Conectando con MongoDB...');

mongoose.connect(config.mongoUri)
  .then(() => {

    logger.info('Conectado a MongoDB');

    app.listen(config.port, () => {
      logger.info(`Servidor corriendo en puerto ${config.port}`);
      logger.info(
        `Documentación Swagger disponible en http://localhost:${config.port}/api/docs`
      );
    });

  })
  .catch((error) => {

    logger.fatal(`Error al conectar con MongoDB: ${error.message}`);

    process.exit(1);

  });