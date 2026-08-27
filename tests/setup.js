import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from '../src/models/user.model.js';
import Order from '../src/models/order.model.js';
import Delivery from '../src/models/delivery.model.js';


// Cargamos las variables del entorno de testing antes
// de importar y ejecutar las pruebas de la aplicación.
dotenv.config({
  path: '.env.test',
  override: true
});


// Antes de iniciar la suite comprobamos que la conexión
// apunte exclusivamente a la base destinada a los tests.
before(async () => {

  const mongoUrl = new URL(process.env.MONGODB_URI);
  const databaseName = mongoUrl.pathname.replace('/', '');

  if (
    process.env.NODE_ENV !== 'test'
    || databaseName !== 'shipnow_test'
  ) {
    throw new Error(
      'Los tests deben ejecutarse únicamente sobre shipnow_test'
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);

});


// Antes de cada test eliminamos los datos anteriores.
// Así cada caso comienza desde un estado conocido.
beforeEach(async () => {

  await Delivery.deleteMany({});
  await Order.deleteMany({});
  await User.deleteMany({});

});


// Al finalizar limpiamos los datos generados durante
// las pruebas y cerramos la conexión con MongoDB.
after(async () => {

  await Delivery.deleteMany({});
  await Order.deleteMany({});
  await User.deleteMany({});

  await mongoose.disconnect();

});
