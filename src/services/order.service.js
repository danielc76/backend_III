// Importamos los Repository porque el Service se encarga de
// aplicar las reglas de negocio y delegar el acceso a MongoDB.
import * as ordersRepository from '../repositories/order.repository.js';
import * as usersRepository from '../repositories/user.repository.js';

// customError permite identificar el tipo de error para que
// el errorHandler pueda transformarlo en una respuesta HTTP.
import { customError } from '../utils/customError.js';

// Utilizamos códigos centralizados en lugar de mensajes
// de error escritos directamente dentro del Service.
import { ERROR_CODES } from '../constants/error.constants.js';

// Utilizamos las constantes del proyecto para evitar
// valores escritos directamente como 'driver', 'normal', etc.
import {
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_PRIORITY
} from '../constants/index.js';

// Logger centralizado para registrar eventos importantes.
import { logger } from '../utils/logger.js';

// Obtiene todos los pedidos.
// El Service delega la consulta al Repository.
export const getOrders = async () => {

  return await ordersRepository.getOrders();

};

// Busca un pedido por ID.
// Si no existe, se lanza un error de dominio que será
// procesado posteriormente por el middleware global.
export const getOrderById = async (id) => {

  const order = await ordersRepository.getOrderById(id);

  if (!order) {

    throw new customError(ERROR_CODES.ORDER_NOT_FOUND);

  }

  return order;

};

// Crea un nuevo pedido aplicando las reglas de negocio.
export const createOrder = async (orderData) => {

  const {
    customer,
    items,
    deliveryAddress,
    priority
  } = orderData;

  // El pedido debe estar asociado a un cliente.
  if (!customer) {

    throw new customError(ERROR_CODES.VALIDATION_ERROR);

  }

  // El pedido debe contener al menos un item.
  if (!items || items.length === 0) {

    throw new customError(ERROR_CODES.VALIDATION_ERROR);

  }

  // La dirección de entrega es obligatoria.
  if (!deliveryAddress) {

    throw new customError(ERROR_CODES.VALIDATION_ERROR);

  }

  // Calculamos el total del pedido a partir de sus items.
  const total = items.reduce((acc, item) => {

    return acc + item.price * item.quantity;

  }, 0);

  // Verificamos que el cliente exista.
  const user = await usersRepository.getUserById(customer);

  if (!user) {

    throw new customError(ERROR_CODES.USER_NOT_FOUND);

  }

  // Un repartidor no puede crear pedidos.
  if (user.role === USER_ROLES.DRIVER) {

    throw new customError(ERROR_CODES.FORBIDDEN);

  }

  // Creamos el pedido utilizando valores definidos
  // mediante constantes cuando corresponde.
  const newOrder = await ordersRepository.createOrder({

    customer,
    items,
    deliveryAddress,
    total,
    priority: priority || DELIVERY_PRIORITY.NORMAL,
    status: ORDER_STATUS.CREATED

  });

  // Registramos que el pedido fue creado correctamente.
  logger.info(
    `Pedido ${newOrder._id} creado correctamente. Total: $${total}`
  );

  // Simulación del envío de un email de confirmación.
  logger.info(
    `[EMAIL SIMULADO] Enviando confirmacion al usuario ${customer}...`
  );

  logger.info(
    `[EMAIL SIMULADO] Tu pedido ${newOrder._id} fue creado. Total: $${total}`
  );

  // Calculamos un costo de envío simulado.
  const shippingCost = newOrder.items.reduce((acc, item) => {

    return acc + (item.quantity * 10);

  }, 0);

  return {

    order: newOrder,

    shippingCost,

    message: 'Pedido creado y email enviado'

  };

};

// Actualiza el estado de un pedido.
export const updateOrderStatus = async (id, status) => {

  // El nuevo estado es obligatorio.
  if (!status) {

    throw new customError(ERROR_CODES.VALIDATION_ERROR);

  }

  // Verificamos que el estado recibido sea uno de los
  // estados permitidos por el dominio.
  if (!Object.values(ORDER_STATUS).includes(status)) {

    throw new customError(ERROR_CODES.INVALID_ORDER_STATUS);

  }

  // Buscamos el pedido utilizando el Repository.
  // Primero obtenemos el documento para poder aplicar
  // las reglas de negocio antes de modificarlo.
  const order = await ordersRepository.getOrderById(id);

  // Si no existe, informamos mediante un error personalizado.
  if (!order) {

    throw new customError(ERROR_CODES.ORDER_NOT_FOUND);

  }

  // Un pedido que ya fue entregado no puede volver a modificarse.
  if (order.status === ORDER_STATUS.DELIVERED) {

    throw new customError(ERROR_CODES.INVALID_ORDER_STATUS);

  }

  // Actualizamos el estado del pedido.
  order.status = status;

  // Guardamos los cambios en MongoDB.
  await ordersRepository.saveOrder(order);

  // Registramos el cambio de estado del pedido.
  logger.info(
    `Pedido ${order._id} actualizado a estado: ${status}`
  );

  return order;

};

// Elimina un pedido por ID.
export const deleteOrder = async (id) => {

  const order = await ordersRepository.deleteOrder(id);

  // Si el pedido no existe, el Repository devuelve null
  // y el Service transforma esa situación en un error de dominio.
  if (!order) {

    throw new customError(ERROR_CODES.ORDER_NOT_FOUND);

  }

  return order;

};