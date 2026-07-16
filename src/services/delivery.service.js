import * as deliveriesRepository from '../repositories/delivery.repository.js';
import * as ordersRepository from '../repositories/order.repository.js';
import * as usersRepository from '../repositories/user.repository.js';
import { USER_ROLES, ORDER_STATUS, DELIVERY_STATUS, DELIVERY_PRIORITY } from '../constants/index.js';


export const getDeliveries = async () => {
  return await deliveriesRepository.getDeliveries();
};


export const getDeliveryById = async (id) => {
  return await deliveriesRepository.getDeliveryById(id);
};


export const createDelivery = async (deliveryData) => {

  const { order, driver, priority } = deliveryData;


  if (!order) {
    throw new Error('El pedido es obligatorio');
  }

  if (!driver) {
    throw new Error('El repartidor es obligatorio');
  }


  const existingOrder = await ordersRepository.getOrderById(order);

  if (!existingOrder) {
    throw new Error('El pedido no existe');
  }


  const existingDriver = await usersRepository.getUserById(driver);

  if (!existingDriver) {
    throw new Error('El repartidor no existe');
  }


  if (existingDriver.role !== USER_ROLES.DRIVER) {
    throw new Error('El usuario no tiene rol de repartidor');
  }


  if (existingOrder.status !== ORDER_STATUS.CREATED) {
    throw new Error('El pedido ya fue asignado o procesado');
  }


  const newDelivery = await deliveriesRepository.createDelivery({

    order,
    driver,

    priority: priority || DELIVERY_PRIORITY.NORMAL,

    status: DELIVERY_STATUS.ASSIGNED,

    assignedAt: new Date()

  });


  existingOrder.status = ORDER_STATUS.ASSIGNED;
  existingOrder.delivery = newDelivery._id;


  await ordersRepository.saveOrder(existingOrder);


  console.log(`Entrega ${newDelivery._id} creada para el pedido ${order}`);


  return newDelivery;
};




export const updateDeliveryStatus = async (id, status) => {


  const delivery = await deliveriesRepository.updateDelivery(id);


  if (!delivery) {
    return null;
  }


  if (delivery.status === DELIVERY_STATUS.DELIVERED) {
    throw new Error('La entrega ya fue completada');
  }


  const validStatuses = Object.values(DELIVERY_STATUS);

  if (!validStatuses.includes(status)) {
    throw new Error('Estado de entrega inválido');
  }


  delivery.status = status;


  if (status === DELIVERY_STATUS.DELIVERED) {


    delivery.deliveredAt = new Date();


    const order = await ordersRepository.getOrderById(delivery.order);


    if (order) {

      order.status = ORDER_STATUS.DELIVERED;

      await ordersRepository.saveOrder(order);

    }

  }


  await deliveriesRepository.saveDelivery(delivery);


  console.log(`Entrega ${delivery._id} actualizada a: ${status}`);


  return delivery;
};




export const deleteDelivery = async (id) => {
  return await deliveriesRepository.deleteDelivery(id);
};