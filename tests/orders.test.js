import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Order from '../src/models/order.model.js';
import { USER_ROLES, ORDER_STATUS } from '../src/constants/index.js';
import {
  ERROR_CODES,
  ERROR_DICTIONARY
} from '../src/constants/error.constants.js';


// Creamos un cliente controlado cada vez que un test
// necesita preparar un pedido válido.
const createCustomer = async () => {

  return await User.create({
    firstName: 'Cliente',
    lastName: 'Test',
    email: 'cliente.test@shipnow.com',
    password: '123456',
    role: USER_ROLES.CUSTOMER
  });

};


// Preparamos un pedido conocido para los casos que no
// necesitan probar nuevamente el endpoint de creación.
const createOrder = async (customerId) => {

  return await Order.create({
    customer: customerId,
    items: [
      {
        name: 'Paquete de prueba',
        quantity: 1,
        price: 1500
      }
    ],
    deliveryAddress: 'Av. Siempre Viva 742',
    total: 1500,
    status: ORDER_STATUS.CREATED
  });

};


describe('Orders API', () => {

  it('debería devolver la lista de pedidos', async () => {

    const response = await request(app)
      .get('/api/orders');

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(0);

  });


  it('debería limitar y filtrar la lista de pedidos', async () => {

    const customer = await createCustomer();

    await createOrder(customer._id);
    await createOrder(customer._id);

    const deliveredOrder = await createOrder(customer._id);
    deliveredOrder.status = ORDER_STATUS.DELIVERED;
    await deliveredOrder.save();

    const response = await request(app)
      .get('/api/orders')
      .query({
        status: ORDER_STATUS.CREATED,
        limit: 1
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.lengthOf(1);
    expect(response.body[0].status).to.equal(ORDER_STATUS.CREATED);

  });


  it('debería crear un pedido y calcular sus valores correctamente', async () => {

    const customer = await createCustomer();

    const response = await request(app)
      .post('/api/orders')
      .send({
        customer: customer._id.toString(),
        items: [
          {
            name: 'Paquete mediano',
            quantity: 2,
            price: 1500
          }
        ],
        deliveryAddress: 'Av. Siempre Viva 742'
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.all.keys(
      'order',
      'shippingCost',
      'message'
    );

    expect(response.body.order._id).to.be.a('string');
    expect(response.body.order.total).to.equal(3000);
    expect(response.body.order.status).to.equal(ORDER_STATUS.CREATED);
    expect(response.body.order.items).to.have.lengthOf(1);
    expect(response.body.shippingCost).to.equal(20);
    expect(response.body.message).to.equal(
      'Pedido creado y email enviado'
    );

  });


  it('debería obtener un pedido por su ID', async () => {

    const customer = await createCustomer();
    const order = await createOrder(customer._id);

    const response = await request(app)
      .get(`/api/orders/${order._id}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    expect(response.body._id).to.equal(order._id.toString());
    expect(response.body.customer).to.equal(customer._id.toString());
    expect(response.body.total).to.equal(1500);
    expect(response.body.status).to.equal(ORDER_STATUS.CREATED);

  });


  it('debería actualizar el estado de un pedido', async () => {

    const customer = await createCustomer();
    const order = await createOrder(customer._id);

    const response = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .send({
        status: ORDER_STATUS.IN_TRANSIT
      });

    expect(response.status).to.equal(200);
    expect(response.body._id).to.equal(order._id.toString());
    expect(response.body.status).to.equal(ORDER_STATUS.IN_TRANSIT);

  });


  it('debería responder error si faltan los items del pedido', async () => {

    const customer = await createCustomer();

    const response = await request(app)
      .post('/api/orders')
      .send({
        customer: customer._id.toString(),
        deliveryAddress: 'Av. Siempre Viva 742'
      });

    const errorCode = ERROR_CODES.VALIDATION_ERROR;

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });


  it('debería responder error si el cliente no existe', async () => {

    const response = await request(app)
      .post('/api/orders')
      .send({
        customer: '000000000000000000000000',
        items: [
          {
            name: 'Paquete mediano',
            quantity: 1,
            price: 1500
          }
        ],
        deliveryAddress: 'Av. Siempre Viva 742'
      });

    const errorCode = ERROR_CODES.USER_NOT_FOUND;

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });


  it('debería responder error si el pedido no existe', async () => {

    const response = await request(app)
      .get('/api/orders/000000000000000000000000');

    const errorCode = ERROR_CODES.ORDER_NOT_FOUND;

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });


  it('debería responder error si el estado no es válido', async () => {

    const customer = await createCustomer();
    const order = await createOrder(customer._id);

    const response = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .send({
        status: 'estado_invalido'
      });

    const errorCode = ERROR_CODES.INVALID_ORDER_STATUS;

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });


  it('debería eliminar un pedido', async () => {

    const customer = await createCustomer();
    const order = await createOrder(customer._id);

    const response = await request(app)
      .delete(`/api/orders/${order._id}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      message: 'Pedido eliminado'
    });

    const deletedOrder = await Order.findById(order._id);

    expect(deletedOrder).to.equal(null);

  });


  it('debería responder error al eliminar un pedido inexistente', async () => {

    const response = await request(app)
      .delete('/api/orders/000000000000000000000000');

    const errorCode = ERROR_CODES.ORDER_NOT_FOUND;

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });

});
