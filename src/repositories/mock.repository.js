import { faker } from '@faker-js/faker';
import { USER_ROLES } from '../constants/index.js';


export const generateUsers = (quantity = 1) => {

  const users = [];

  for (let i = 0; i < quantity; i++) {

    users.push({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),

      role: USER_ROLES.CUSTOMER
    });

  }

  return users;
};