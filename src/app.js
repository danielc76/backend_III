// Configuración inicial de Express y registro de rutas de la API.

import express from 'express';
import cors from 'cors';

import usersRouter from './routes/users.routes.js';
import ordersRouter from './routes/orders.routes.js';
import deliveriesRouter from './routes/deliveries.routes.js';
import mocksRouter from './routes/mocks.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares generales de la aplicación.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API.
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/mocks', mocksRouter);

// Middleware global para centralizar el manejo de errores.
// Debe registrarse después de todas las rutas.
app.use(errorHandler);

export default app;