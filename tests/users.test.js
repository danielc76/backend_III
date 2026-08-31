import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';
import User from '../src/models/user.model.js';
import { USER_ROLES } from '../src/constants/index.js';
import {
  ERROR_CODES,
  ERROR_DICTIONARY
} from '../src/constants/error.constants.js';


const createTestUser = async () => {

  return await User.create({
    firstName: 'Usuario',
    lastName: 'Test',
    email: 'usuario.test@shipnow.com',
    password: '123456',
    role: USER_ROLES.CUSTOMER
  });

};


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


  it('debería crear un usuario', async () => {

    const response = await request(app)
      .post('/api/users')
      .send({
        firstName: 'Nuevo',
        lastName: 'Usuario',
        email: 'nuevo.usuario@shipnow.com',
        password: '123456'
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      firstName: 'Nuevo',
      lastName: 'Usuario',
      email: 'nuevo.usuario@shipnow.com',
      role: USER_ROLES.CUSTOMER
    });

    const savedUser = await User.findOne({
      email: 'nuevo.usuario@shipnow.com'
    });

    expect(savedUser).to.not.equal(null);

  });


  it('debería responder error si faltan datos obligatorios', async () => {

    const response = await request(app)
      .post('/api/users')
      .send({
        firstName: 'Nuevo',
        lastName: 'Usuario',
        email: 'nuevo.usuario@shipnow.com'
      });

    expect(response.status).to.equal(
      ERROR_DICTIONARY[ERROR_CODES.VALIDATION_ERROR].statusCode
    );
    expect(response.body).to.deep.equal({
      status: 'error',
      error: ERROR_CODES.VALIDATION_ERROR,
      message: ERROR_DICTIONARY[ERROR_CODES.VALIDATION_ERROR].message
    });

  });


  it('debería responder error si el email ya está registrado', async () => {

    await createTestUser();

    const response = await request(app)
      .post('/api/users')
      .send({
        firstName: 'Otro',
        lastName: 'Usuario',
        email: 'usuario.test@shipnow.com',
        password: '123456'
      });

    expect(response.status).to.equal(
      ERROR_DICTIONARY[ERROR_CODES.USER_ALREADY_EXIST].statusCode
    );
    expect(response.body).to.deep.equal({
      status: 'error',
      error: ERROR_CODES.USER_ALREADY_EXIST,
      message: ERROR_DICTIONARY[ERROR_CODES.USER_ALREADY_EXIST].message
    });

  });


  it('debería responder error si se intenta crear un administrador', async () => {

    const response = await request(app)
      .post('/api/users')
      .send({
        firstName: 'Nuevo',
        lastName: 'Administrador',
        email: 'admin@shipnow.com',
        password: '123456',
        role: USER_ROLES.ADMIN
      });

    expect(response.status).to.equal(
      ERROR_DICTIONARY[ERROR_CODES.FORBIDDEN].statusCode
    );
    expect(response.body).to.deep.equal({
      status: 'error',
      error: ERROR_CODES.FORBIDDEN,
      message: ERROR_DICTIONARY[ERROR_CODES.FORBIDDEN].message
    });

  });


  it('debería obtener un usuario por su ID', async () => {

    const user = await createTestUser();

    const response = await request(app)
      .get(`/api/users/${user._id}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      firstName: 'Usuario',
      lastName: 'Test',
      email: 'usuario.test@shipnow.com',
      role: USER_ROLES.CUSTOMER
    });

  });


  it('debería responder error si el usuario consultado no existe', async () => {

    const response = await request(app)
      .get('/api/users/000000000000000000000000');

    expect(response.status).to.equal(
      ERROR_DICTIONARY[ERROR_CODES.USER_NOT_FOUND].statusCode
    );
    expect(response.body).to.deep.equal({
      status: 'error',
      error: ERROR_CODES.USER_NOT_FOUND,
      message: ERROR_DICTIONARY[ERROR_CODES.USER_NOT_FOUND].message
    });

  });


  it('debería eliminar un usuario', async () => {

    const user = await createTestUser();

    const response = await request(app)
      .delete(`/api/users/${user._id}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      message: 'Usuario eliminado'
    });

    const deletedUser = await User.findById(user._id);

    expect(deletedUser).to.equal(null);

  });


  it('debería responder error si el usuario a eliminar no existe', async () => {

    const response = await request(app)
      .delete('/api/users/000000000000000000000000');

    expect(response.status).to.equal(
      ERROR_DICTIONARY[ERROR_CODES.USER_NOT_FOUND].statusCode
    );
    expect(response.body).to.deep.equal({
      status: 'error',
      error: ERROR_CODES.USER_NOT_FOUND,
      message: ERROR_DICTIONARY[ERROR_CODES.USER_NOT_FOUND].message
    });

  });

});
