// Inicia el servidor y establece la conexión con MongoDB.

import mongoose from 'mongoose';

import app from './app.js';

import { config } from './config/env.config.js';


mongoose.connect(config.mongoUri)
  .then(() => {

    console.log('Conectado a MongoDB');

    app.listen(config.port, () => {
      console.log(`Servidor corriendo en puerto ${config.port}`);
    });

  })
  .catch((error) => {

    console.error('Error al conectar con MongoDB:', error.message);

    process.exit(1);

  });