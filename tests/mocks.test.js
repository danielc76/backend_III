import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Order from '../src/models/order.model.js';
import Delivery from '../src/models/delivery.model.js';
import { USER_ROLES } from '../src/constants/index.js';
import {
  ERROR_CODES,
  ERROR_DICTIONARY
} from '../src/constants/error.constants.js';


describe('Mocks API', () => {

  it('debería generar usuarios mock sin guardarlos en MongoDB', async () => {

    const response = await request(app)
      .get('/api/mocks/users');

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(10);
    expect(response.body[0]).to.include.all.keys(
      '_id',
      'firstName',
      'lastName',
      'email',
      'role'
    );
    expect(response.body[0].role).to.equal(USER_ROLES.CUSTOMER);
    expect(response.body[0]).to.not.have.property('password');
    expect(await User.countDocuments()).to.equal(0);

  });


  it('debería generar pedidos mock con la estructura esperada', async () => {

    const response = await request(app)
      .get('/api/mocks/orders');

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(10);
    expect(response.body[0]).to.include.all.keys(
      '_id',
      'customer',
      'items',
      'deliveryAddress',
      'total',
      'status',
      'priority'
    );
    expect(response.body[0].items).to.be.an('array').with.lengthOf(1);
    expect(await Order.countDocuments()).to.equal(0);

  });


  it('debería generar entregas mock relacionadas con pedidos', async () => {

    const response = await request(app)
      .get('/api/mocks/deliveries');

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(10);
    expect(response.body[0]).to.include.all.keys(
      '_id',
      'order',
      'driver',
      'status',
      'priority',
      'assignedAt'
    );
    expect(await Delivery.countDocuments()).to.equal(0);

  });


  it('debería generar y guardar datos mock controlados', async () => {

    // Usamos una cantidad pequeña para comprobar la persistencia
    // sin cargar datos innecesarios en la base de testing.
    const response = await request(app)
      .post('/api/mocks/generate')
      .send({
        quantity: 2
      });

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal(
      'Datos de prueba generados correctamente'
    );
    expect(response.body.result.users).to.have.lengthOf(4);
    expect(response.body.result.orders).to.have.lengthOf(2);
    expect(response.body.result.deliveries).to.have.lengthOf(2);
    expect(response.body.result.users[0]).to.not.have.property('password');

    expect(await User.countDocuments()).to.equal(4);
    expect(await Order.countDocuments()).to.equal(2);
    expect(await Delivery.countDocuments()).to.equal(2);

  });


  it('debería responder error si la cantidad de mocks no es válida', async () => {

    const response = await request(app)
      .post('/api/mocks/generate')
      .send({
        quantity: 0
      });

    const errorCode = ERROR_CODES.INVALID_MOCK_AMOUNT;

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });

});
