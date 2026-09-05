import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';


describe('Health check', () => {

  it('debería informar que la API está disponible sin exponer datos sensibles', async () => {

    const response = await request(app)
      .get('/health');

    expect(response.status).to.equal(200);
    expect(response.body).to.have.all.keys(
      'status',
      'environment',
      'uptime',
      'timestamp'
    );
    expect(response.body.status).to.equal('OK');
    expect(response.body.environment).to.equal('test');
    expect(response.body.uptime).to.be.a('number');
    expect(Date.parse(response.body.timestamp)).not.to.be.NaN;

  });

});
