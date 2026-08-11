// Configuración inicial de Express y registro de rutas de la API.

import express from 'express';
import cors from 'cors';

import usersRouter from './routes/users.routes.js';
import ordersRouter from './routes/orders.routes.js';
import deliveriesRouter from './routes/deliveries.routes.js';
import mocksRouter from './routes/mocks.routes.js';
import loggerRouter from './routes/logger.routes.js';

import { reqLogger } from './middleware/requestLogger.js';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();


// Middlewares generales de la aplicación.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Middleware de logging.
// Registra cada petición HTTP con método, URL,
// código de respuesta y tiempo de ejecución.
app.use(reqLogger);


// Middleware de control de peticiones.
// Registra advertencias cuando detecta muchas
// peticiones desde una misma IP.
app.use(rateLimitMiddleware);


// Rutas de la API.
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/mocks', mocksRouter);
app.use('/api/logger', loggerRouter);


// Middleware global para centralizar el manejo de errores.
// Debe registrarse después de todas las rutas.
app.use(errorHandler);


export default app;