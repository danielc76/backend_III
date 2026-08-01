import {
generateUsers,
generateDrivers,
generateOrders,
generateDeliveries
} from '../utils/mocks.generator.js';

import {
createUsers
} from '../repositories/user.repository.js';

import {
createOrders
} from '../repositories/order.repository.js';

import {
createDeliveries
} from '../repositories/delivery.repository.js';

import {
USER_ROLES
} from '../constants/index.js';

import { customError } from '../utils/customError.js';

import { ERROR_CODES } from '../constants/error.constants.js';

// Servicio encargado de coordinar la generación de datos simulados.
// La creación puntual de cada entidad queda delegada en el generator.
export const getMockUsers = (quantity = 10) => {

return generateUsers(quantity);

};

// Genera pedidos simulados manteniendo la relación
// entre clientes y pedidos.
export const getMockOrders = (quantity = 10) => {

const users = generateUsers(quantity);

return generateOrders(users, quantity);

};

// Genera entregas simuladas manteniendo las relaciones
// entre pedidos y repartidores.
export const getMockDeliveries = (quantity = 10) => {

const users = generateUsers(quantity);

const drivers = generateDrivers(5);

const orders = generateOrders(users, quantity);

return generateDeliveries(orders, drivers);

};

// Genera datos de prueba y los guarda en MongoDB.
// Se respeta el orden de creación para mantener las relaciones:
// usuarios -> pedidos -> entregas.
export const createMockData = async (quantity = 10) => {

// Validamos que la cantidad recibida sea realmente un número.
// Number.isInteger evita aceptar valores como texto o decimales.
if (!Number.isInteger(quantity)) {

throw new customError(ERROR_CODES.INVALID_MOCK_AMOUNT);

}

// La cantidad debe ser mayor que cero.
if (quantity <= 0) {

throw new customError(ERROR_CODES.INVALID_MOCK_AMOUNT);

}

// Evitamos generar una cantidad excesiva de registros.
if (quantity > 100) {

throw new customError(ERROR_CODES.INVALID_MOCK_AMOUNT);

}

try {

// Genera clientes y repartidores en memoria.
const usersData = generateUsers(quantity);

const driversData = generateDrivers(
  Math.min(5, quantity)
);


// Guarda ambos tipos de usuarios en la colección User.
const usersCreated = await createUsers([
  ...usersData,
  ...driversData
]);


// Se separan los usuarios por rol para crear relaciones correctas.
const customers = usersCreated.filter(
  user => user.role === USER_ROLES.CUSTOMER
);


const drivers = usersCreated.filter(
  user => user.role === USER_ROLES.DRIVER
);


// Genera pedidos utilizando los clientes reales
// creados previamente en MongoDB.
const ordersData = generateOrders(
  customers,
  quantity
);


const ordersCreated = await createOrders(
  ordersData
);


// Genera entregas relacionadas con pedidos
// y repartidores reales.
const deliveriesData = generateDeliveries(
  ordersCreated,
  drivers
);


const deliveriesCreated = await createDeliveries(
  deliveriesData
);


return {
  users: usersCreated,
  orders: ordersCreated,
  deliveries: deliveriesCreated
};

} catch (error) {

// Si ocurre una falla durante la generación o inserción
// en MongoDB, se transforma en un error del dominio.
throw new customError(
  ERROR_CODES.MOCK_GENERATION_ERROR
);

}

};