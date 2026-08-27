import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';


describe('Swagger', () => {

  it('debería mostrar la documentación de la API', async () => {

    // Swagger UI devuelve una página HTML, por eso en este
    // caso comprobamos el content-type y parte de su contenido.
    const response = await request(app)
      .get('/api/docs/');

    expect(response.status).to.equal(200);
    expect(response.headers['content-type']).to.include('text/html');
    expect(response.text).to.include('Swagger UI');

  });

});
