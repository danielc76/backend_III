import * as ordersRepository from '../repositories/order.repository.js';
import * as usersRepository from '../repositories/user.repository.js';

export const getOrders = async () => {
  return await ordersRepository.getOrders();
};

export const getOrderById = async (id) => {
  return await ordersRepository.getOrderById(id);
};

export const createOrder = async (orderData) => {

  const { customer, items, deliveryAddress, priority } = orderData;

  if (!customer) {
    throw new Error('Falta el cliente');
  }

  if (!items || items.length === 0) {
    throw new Error('Falta los items del pedido');
  }

  if (!deliveryAddress) {
    throw new Error('Falta la direccion');
  }

  const total = items.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const user = await usersRepository.getUserById(customer);

  if (!user) {
    throw new Error('El usuario no existe');
  }

  if (user.role === 'driver') {
    throw new Error('Los repartidores no pueden crear pedidos');
  }

  const newOrder = await ordersRepository.createOrder({
    customer,
    items,
    deliveryAddress,
    total,
    priority: priority || 'normal',
    status: 'created'
  });

  console.log(`[EMAIL SIMULADO] Enviando confirmacion al usuario ${customer}...`);
  console.log(`[EMAIL SIMULADO] Tu pedido ${newOrder._id} fue creado. Total: $${total}`);

  const shippingCost = newOrder.items.reduce((acc, item) => {
    return acc + (item.quantity * 10);
  }, 0);

  return {
    order: newOrder,
    shippingCost,
    message: 'Pedido creado y email enviado'
  };
};

export const updateOrderStatus = async (id, status) => {

  if (!status) {
    throw new Error('El estado es obligatorio');
  }

  const order = await ordersRepository.updateOrder(id);

  if (!order) {
    return null;
  }

  if (order.status === 'delivered') {
    throw new Error('El pedido ya fue entregado');
  }

  if (order.status === 'delivered' && status === 'created') {
    throw new Error('No se puede reiniciar un pedido entregado');
  }

  order.status = status;

  await ordersRepository.saveOrder(order);

  console.log(`Pedido ${order._id} actualizado a estado: ${status}`);

  return order;
};

export const deleteOrder = async (id) => {
  return await ordersRepository.deleteOrder(id);
};