import { faker } from '@faker-js/faker';

import {
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_STATUS,
  DELIVERY_PRIORITY
} from '../constants/index.js';


// Genera usuarios clientes simulados
// Incluye un id ficticio para poder crear relaciones en memoria.
export const generateUsers = (quantity = 10) => {

  const users = [];

  for (let i = 0; i < quantity; i++) {

    users.push({

      _id: faker.database.mongodbObjectId(),

      firstName: faker.person.firstName(),

      lastName: faker.person.lastName(),

      email: faker.internet.email(),

      password: faker.internet.password(),

      role: USER_ROLES.CUSTOMER

    });

  }

  return users;
};



// Genera usuarios repartidores simulados.
export const generateDrivers = (quantity = 5) => {

  const drivers = [];

  for (let i = 0; i < quantity; i++) {

    drivers.push({

      _id: faker.database.mongodbObjectId(),

      firstName: faker.person.firstName(),

      lastName: faker.person.lastName(),

      email: faker.internet.email(),

      password: faker.internet.password(),

      role: USER_ROLES.DRIVER

    });

  }

  return drivers;
};



// Genera pedidos relacionados con clientes.
// Recibe usuarios generados previamente para asignar customer.
export const generateOrders = (users, quantity = 10) => {

  const orders = [];


  for (let i = 0; i < quantity; i++) {


    const customer = faker.helpers.arrayElement(users);


    orders.push({

      _id: faker.database.mongodbObjectId(),

      customer: customer._id,


      items: [
        {
          name: faker.commerce.productName(),

          quantity: faker.number.int({
            min: 1,
            max: 5
          }),

          price: faker.number.int({
            min: 500,
            max: 10000
          })
        }
      ],


      deliveryAddress: faker.location.streetAddress(),


      total: faker.number.int({
        min: 1000,
        max: 50000
      }),


      status: faker.helpers.arrayElement([
        ORDER_STATUS.CREATED,
        ORDER_STATUS.ASSIGNED,
        ORDER_STATUS.IN_TRANSIT
      ]),


      priority: faker.helpers.arrayElement([
        DELIVERY_PRIORITY.LOW,
        DELIVERY_PRIORITY.NORMAL,
        DELIVERY_PRIORITY.HIGH
      ])

    });

  }


  return orders;
};



// Genera entregas relacionadas con pedidos y repartidores.
export const generateDeliveries = (orders, drivers) => {

  const deliveries = [];


  orders.forEach(order => {


    const driver = faker.helpers.arrayElement(drivers);


    deliveries.push({

      _id: faker.database.mongodbObjectId(),

      order: order._id,

      driver: driver._id,

      status: faker.helpers.arrayElement([
        DELIVERY_STATUS.PENDING,
        DELIVERY_STATUS.ASSIGNED,
        DELIVERY_STATUS.IN_TRANSIT
      ]),

      priority: order.priority,

      assignedAt: new Date()

    });


  });


  return deliveries;

};