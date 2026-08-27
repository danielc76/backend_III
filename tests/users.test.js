import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';
import User from '../src/models/user.model.js';
import { USER_ROLES } from '../src/constants/index.js';


// Mocha organiza y ejecuta los casos definidos
// dentro de describe e it.
describe('Users API', () => {

  it('debería devolver la lista de usuarios', async () => {

    // Supertest realiza una petición sobre la aplicación
    // sin iniciar el servidor ni abrir un puerto.
    const response = await request(app)
      .get('/api/users');


    // Chai comprueba que la API responda correctamente
    // y que el body tenga la estructura esperada.
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(0);

  });


  it('debería devolver los usuarios guardados en la base de testing', async () => {

    // Preparamos un usuario conocido para que el resultado
    // del test no dependa de datos creados manualmente.
    await User.create({
      firstName: 'Daniel',
      lastName: 'Test',
      email: 'daniel.test@shipnow.com',
      password: '123456',
      role: USER_ROLES.CUSTOMER
    });


    // Ejecutamos la petición real sobre la aplicación.
    const response = await request(app)
      .get('/api/users');


    // Comprobamos el status, la cantidad de usuarios
    // y los valores importantes del registro creado.
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(1);

    expect(response.body[0]).to.include({
      firstName: 'Daniel',
      lastName: 'Test',
      email: 'daniel.test@shipnow.com',
      role: USER_ROLES.CUSTOMER
    });

  });

});
