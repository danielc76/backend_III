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
export const createMockData = async () => {


  // Genera clientes y repartidores en memoria.
  const usersData = generateUsers(10);

  const driversData = generateDrivers(5);



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



  // Genera pedidos utilizando los clientes reales creados en MongoDB.
  const ordersData = generateOrders(
    customers,
    10
  );


  const ordersCreated = await createOrders(
    ordersData
  );



  // Genera entregas relacionadas con pedidos y repartidores reales.
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

};