// Configuración inicial de Express y registro de rutas de la API.

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import usersRouter from './routes/users.routes.js';
import ordersRouter from './routes/orders.routes.js';
import deliveriesRouter from './routes/deliveries.routes.js';
import mocksRouter from './routes/mocks.routes.js';
import loggerRouter from './routes/logger.routes.js';
import healthRouter from './routes/health.routes.js';

import { reqLogger } from './middleware/requestLogger.js';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

import { swaggerSpec } from './docs/swagger.config.js';
import { customError } from './utils/customError.js';
import { ERROR_CODES } from './constants/error.constants.js';
import { config } from './config/env.config.js';

const app = express();


// Middlewares generales de la aplicación.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// El health check queda fuera del registro HTTP para evitar
// generar logs repetitivos cuando Docker lo consulta.
app.use('/health', healthRouter);


// Middleware de logging.
// Registra cada petición HTTP con método, URL,
// código de respuesta y tiempo de ejecución.
app.use(reqLogger);


// Middleware de control de peticiones.
// Registra advertencias cuando detecta muchas
// peticiones desde una misma IP.
app.use(rateLimitMiddleware);


// Documentación interactiva de la API.
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Rutas de la API.
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/deliveries', deliveriesRouter);


// Las rutas de soporte se utilizan para desarrollo y testing,
// pero no forman parte de la API expuesta en producción.
if (config.nodeEnv !== 'production') {
  app.use('/api/mocks', mocksRouter);
  app.use('/api/logger', loggerRouter);
}


// Si ninguna ruta pudo resolver la petición,
// generamos un error con el formato definido por la API.
app.use((req, res, next) => {

  next(new customError(ERROR_CODES.ROUTE_NOT_FOUND));

});


// Middleware global para centralizar el manejo de errores.
// Debe registrarse después de todas las rutas.
app.use(errorHandler);


export default app;
