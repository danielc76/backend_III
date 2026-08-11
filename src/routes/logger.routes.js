// Ruta de prueba para verificar los diferentes niveles del logger.

import { Router } from 'express';

import { logger } from '../utils/logger.js';

const router = Router();

router.get('/', (req, res) => {

  logger.debug('Prueba de nivel DEBUG');
  logger.http('Prueba de nivel HTTP');
  logger.info('Prueba de nivel INFO');
  logger.warn('Prueba de nivel WARN');
  logger.error('Prueba de nivel ERROR');
  logger.fatal('Prueba de nivel FATAL');

  res.json({
    message: 'Logs generados correctamente'
  });

});

export default router;