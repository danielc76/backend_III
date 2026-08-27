import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';
import {
  ERROR_CODES,
  ERROR_DICTIONARY
} from '../src/constants/error.constants.js';


describe('Rutas inexistentes', () => {

  it('debería responder con el formato de error de la API', async () => {

    const response = await request(app)
      .get('/api/ruta-inexistente');

    const errorCode = ERROR_CODES.ROUTE_NOT_FOUND;

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });

});
