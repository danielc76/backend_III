// Configuración inicial de Express y registro de rutas de la API.

import express from 'express';
import cors from 'cors';

import usersRouter from './routes/user.routes.js';
import ordersRouter from './routes/order.routes.js';
import deliveriesRouter from './routes/delivery.routes.js';
import productsRouter from './routes/product.routes.js';


const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Rutas de la API
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/products', productsRouter);


export default app; 