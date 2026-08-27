import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';


describe('Logger API', () => {

  it('debería ejecutar la prueba del logger', async () => {

    const response = await request(app)
      .get('/api/logger');

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      message: 'Logs generados correctamente'
    });

  });

});
