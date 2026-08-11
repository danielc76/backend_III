// Importamos los Repository porque el Service se encarga de
// aplicar las reglas de negocio y delegar el acceso a MongoDB.
import * as deliveriesRepository from '../repositories/delivery.repository.js';
import * as ordersRepository from '../repositories/order.repository.js';
import * as usersRepository from '../repositories/user.repository.js';
import { logger } from '../utils/logger.js';


// Importamos las constantes del dominio para evitar
// valores escritos directamente como 'driver', 'created', etc.
import {
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_STATUS,
  DELIVERY_PRIORITY
} from '../constants/index.js';


// customError permite identificar qué tipo de error ocurrió
// para que luego errorHandler lo transforme en una respuesta HTTP.
import { customError } from '../utils/customError.js';


// ERROR_CODES contiene los códigos internos de error
// utilizados por el sistema.
import { ERROR_CODES } from '../constants/error.constants.js';


// Obtiene todas las entregas.
// El Service delega la consulta al Repository.
export const getDeliveries = async () => {

  return await deliveriesRepository.getDeliveries();

};


// Busca una entrega por ID.
// Si no existe, lanzamos un error de dominio.
export const getDeliveryById = async (id) => {

  const delivery = await deliveriesRepository.getDeliveryById(id);

  if (!delivery) {

    throw new customError(ERROR_CODES.DELIVERY_NOT_FOUND);

  }

  return delivery;

};


// Crea una nueva entrega aplicando las reglas de negocio.
export const createDelivery = async (deliveryData) => {

  const {
    order,
    driver,
    priority
  } = deliveryData;


  // El pedido es obligatorio para poder crear una entrega.
  if (!order) {

    throw new customError(ERROR_CODES.VALIDATION_ERROR);

  }


  // El repartidor también es obligatorio.
  if (!driver) {

    throw new customError(ERROR_CODES.VALIDATION_ERROR);

  }


  // Verificamos que el pedido exista.
  const existingOrder = await ordersRepository.getOrderById(order);

  if (!existingOrder) {

    throw new customError(ERROR_CODES.ORDER_NOT_FOUND);

  }


  // Verificamos que el repartidor exista.
  const existingDriver = await usersRepository.getUserById(driver);

  if (!existingDriver) {

    throw new customError(ERROR_CODES.USER_NOT_FOUND);

  }


  // El usuario debe tener específicamente el rol de repartidor.
  if (existingDriver.role !== USER_ROLES.DRIVER) {

    throw new customError(ERROR_CODES.FORBIDDEN);

  }


  // Solo se pueden asignar entregas a pedidos que todavía
  // se encuentran en estado CREATED.
  if (existingOrder.status !== ORDER_STATUS.CREATED) {

    throw new customError(ERROR_CODES.DRIVER_NOT_AVAILABLE);

  }


  // Creamos la entrega utilizando los valores definidos
  // en las constantes del dominio.
  const newDelivery = await deliveriesRepository.createDelivery({

    order,
    driver,

    priority: priority || DELIVERY_PRIORITY.NORMAL,

    status: DELIVERY_STATUS.ASSIGNED,

    assignedAt: new Date()

  });


  // Actualizamos el pedido para indicar que ya fue asignado
  // a una entrega y guardar la referencia correspondiente.
  existingOrder.status = ORDER_STATUS.ASSIGNED;

  existingOrder.delivery = newDelivery._id;


  // Guardamos los cambios del pedido en MongoDB.
  await ordersRepository.saveOrder(existingOrder);


logger.info(
  `Entrega ${newDelivery._id} creada para el pedido ${order}`
);

  return newDelivery;

};


// Actualiza el estado de una entrega.
export const updateDeliveryStatus = async (id, status) => {


  // El nuevo estado es obligatorio.
  if (!status) {

    throw new customError(ERROR_CODES.VALIDATION_ERROR);

  }


  // Buscamos la entrega mediante el Repository.
  const delivery = await deliveriesRepository.getDeliveryById(id);


  // Si no existe, informamos mediante un error de dominio.
  if (!delivery) {

    throw new customError(ERROR_CODES.DELIVERY_NOT_FOUND);

  }


  // Una entrega que ya fue completada no puede volver
  // a modificarse.
  if (delivery.status === DELIVERY_STATUS.DELIVERED) {

    throw new customError(ERROR_CODES.INVALID_DELIVERY_STATUS);

  }


  // Verificamos que el nuevo estado pertenezca a los
  // estados permitidos para una entrega.
  const validStatuses = Object.values(DELIVERY_STATUS);

  if (!validStatuses.includes(status)) {

    throw new customError(ERROR_CODES.INVALID_DELIVERY_STATUS);

  }


  // Actualizamos el estado de la entrega.
  delivery.status = status;


  // Cuando la entrega pasa a DELIVERED, registramos
  // la fecha de finalización y actualizamos también
  // el estado del pedido asociado.
  if (status === DELIVERY_STATUS.DELIVERED) {

    delivery.deliveredAt = new Date();


    // Buscamos el pedido asociado a la entrega.
    const order = await ordersRepository.getOrderById(delivery.order);


    if (order) {

      order.status = ORDER_STATUS.DELIVERED;

      await ordersRepository.saveOrder(order);

    }

  }


  // Guardamos los cambios de la entrega en MongoDB.
  await deliveriesRepository.saveDelivery(delivery);

logger.info(
  `Entrega ${delivery._id} actualizada a: ${status}`
);
  return delivery;
};

// Elimina una entrega por ID.
export const deleteDelivery = async (id) => {

  const delivery = await deliveriesRepository.deleteDelivery(id);


  // Si no existe, transformamos la situación en
  // un error de dominio.
  if (!delivery) {

    throw new customError(ERROR_CODES.DELIVERY_NOT_FOUND);

  }


  return delivery;

};