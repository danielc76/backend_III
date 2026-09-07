import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Order from '../src/models/order.model.js';
import Delivery from '../src/models/delivery.model.js';
import {
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_STATUS,
  DELIVERY_PRIORITY
} from '../src/constants/index.js';
import {
  ERROR_CODES,
  ERROR_DICTIONARY
} from '../src/constants/error.constants.js';


const createCustomer = async () => {

  return await User.create({
    firstName: 'Cliente',
    lastName: 'Delivery',
    email: 'cliente.delivery@shipnow.com',
    password: '123456',
    role: USER_ROLES.CUSTOMER
  });

};


const createDriver = async () => {

  return await User.create({
    firstName: 'Repartidor',
    lastName: 'Test',
    email: 'driver.test@shipnow.com',
    password: '123456',
    role: USER_ROLES.DRIVER
  });

};


const createOrder = async (customerId) => {

  return await Order.create({
    customer: customerId,
    items: [
      {
        name: 'Paquete para entrega',
        quantity: 1,
        price: 2000
      }
    ],
    deliveryAddress: 'Av. Corrientes 1234',
    total: 2000,
    status: ORDER_STATUS.CREATED
  });

};


const createDelivery = async (orderId, driverId) => {

  return await Delivery.create({
    order: orderId,
    driver: driverId,
    status: DELIVERY_STATUS.ASSIGNED,
    priority: DELIVERY_PRIORITY.NORMAL,
    assignedAt: new Date()
  });

};


describe('Deliveries API', () => {

  it('debería devolver la lista de entregas', async () => {

    const response = await request(app)
      .get('/api/deliveries');

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(0);

  });


  it('debería limitar y filtrar la lista de entregas', async () => {

    const customer = await createCustomer();
    const driver = await createDriver();
    const order = await createOrder(customer._id);

    await createDelivery(order._id, driver._id);
    await createDelivery(order._id, driver._id);

    const deliveredDelivery = await createDelivery(
      order._id,
      driver._id
    );
    deliveredDelivery.status = DELIVERY_STATUS.DELIVERED;
    await deliveredDelivery.save();

    const response = await request(app)
      .get('/api/deliveries')
      .query({
        status: DELIVERY_STATUS.ASSIGNED,
        limit: 1
      });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.lengthOf(1);
    expect(response.body[0].status).to.equal(DELIVERY_STATUS.ASSIGNED);

  });


  it('debería crear una entrega y asignarla al pedido', async () => {

    const customer = await createCustomer();
    const driver = await createDriver();
    const order = await createOrder(customer._id);

    const response = await request(app)
      .post('/api/deliveries')
      .send({
        order: order._id.toString(),
        driver: driver._id.toString()
      });

    expect(response.status).to.equal(201);
    expect(response.body._id).to.be.a('string');
    expect(response.body.order).to.equal(order._id.toString());
    expect(response.body.driver).to.equal(driver._id.toString());
    expect(response.body.status).to.equal(DELIVERY_STATUS.ASSIGNED);
    expect(response.body.priority).to.equal(DELIVERY_PRIORITY.NORMAL);
    expect(response.body.assignedAt).to.be.a('string');

    // La creación de la entrega también debe actualizar
    // el estado y la referencia guardada en el pedido.
    const updatedOrder = await Order.findById(order._id);

    expect(updatedOrder.status).to.equal(ORDER_STATUS.ASSIGNED);
    expect(updatedOrder.delivery.toString()).to.equal(response.body._id);

  });


  it('debería obtener una entrega por su ID', async () => {

    const customer = await createCustomer();
    const driver = await createDriver();
    const order = await createOrder(customer._id);
    const delivery = await createDelivery(order._id, driver._id);

    const response = await request(app)
      .get(`/api/deliveries/${delivery._id}`);

    expect(response.status).to.equal(200);
    expect(response.body._id).to.equal(delivery._id.toString());
    expect(response.body.order).to.equal(order._id.toString());
    expect(response.body.driver).to.equal(driver._id.toString());
    expect(response.body.status).to.equal(DELIVERY_STATUS.ASSIGNED);

  });


  it('debería completar la entrega y actualizar el pedido asociado', async () => {

    const customer = await createCustomer();
    const driver = await createDriver();
    const order = await createOrder(customer._id);
    const delivery = await createDelivery(order._id, driver._id);

    order.status = ORDER_STATUS.ASSIGNED;
    order.delivery = delivery._id;
    await order.save();

    const response = await request(app)
      .patch(`/api/deliveries/${delivery._id}/status`)
      .send({
        status: DELIVERY_STATUS.DELIVERED
      });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal(DELIVERY_STATUS.DELIVERED);
    expect(response.body.deliveredAt).to.be.a('string');

    const updatedOrder = await Order.findById(order._id);

    expect(updatedOrder.status).to.equal(ORDER_STATUS.DELIVERED);

  });


  it('debería rechazar un usuario que no tenga rol de repartidor', async () => {

    const customer = await createCustomer();
    const order = await createOrder(customer._id);

    const response = await request(app)
      .post('/api/deliveries')
      .send({
        order: order._id.toString(),
        driver: customer._id.toString()
      });

    const errorCode = ERROR_CODES.FORBIDDEN;

    expect(response.status).to.equal(403);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });


  it('debería responder error si la entrega no existe', async () => {

    const response = await request(app)
      .get('/api/deliveries/000000000000000000000000');

    const errorCode = ERROR_CODES.DELIVERY_NOT_FOUND;

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });


  it('debería responder error si el ID de la entrega no es válido', async () => {

    const response = await request(app)
      .get('/api/deliveries/id-invalido');

    const errorCode = ERROR_CODES.INVALID_DATA;

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });


  it('debería responder error si el estado no es válido', async () => {

    const customer = await createCustomer();
    const driver = await createDriver();
    const order = await createOrder(customer._id);
    const delivery = await createDelivery(order._id, driver._id);

    const response = await request(app)
      .patch(`/api/deliveries/${delivery._id}/status`)
      .send({
        status: 'estado_invalido'
      });

    const errorCode = ERROR_CODES.INVALID_DELIVERY_STATUS;

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });


  it('debería eliminar una entrega', async () => {

    const customer = await createCustomer();
    const driver = await createDriver();
    const order = await createOrder(customer._id);
    const delivery = await createDelivery(order._id, driver._id);

    const response = await request(app)
      .delete(`/api/deliveries/${delivery._id}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      message: 'Entrega eliminada'
    });

    const deletedDelivery = await Delivery.findById(delivery._id);

    expect(deletedDelivery).to.equal(null);

  });


  it('debería responder error al eliminar una entrega inexistente', async () => {

    const response = await request(app)
      .delete('/api/deliveries/000000000000000000000000');

    const errorCode = ERROR_CODES.DELIVERY_NOT_FOUND;

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });

});
