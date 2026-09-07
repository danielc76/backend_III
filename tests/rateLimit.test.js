import express from 'express';
import { expect } from 'chai';
import request from 'supertest';

import { ERROR_CODES, ERROR_DICTIONARY } from '../src/constants/error.constants.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { createRateLimitMiddleware } from '../src/middleware/rateLimitMiddleware.js';


const createTestApp = () => {

  const app = express();

  app.use(createRateLimitMiddleware({
    limit: 2,
    windowMs: 60 * 1000
  }));

  app.get('/test', (req, res) => {
    res.status(200).json({ status: 'OK' });
  });

  app.use(errorHandler);

  return app;

};


describe('Rate limit', () => {

  it('debería bloquear temporalmente al superar el límite', async () => {

    const app = createTestApp();

    const firstResponse = await request(app).get('/test');
    const secondResponse = await request(app).get('/test');
    const blockedResponse = await request(app).get('/test');

    expect(firstResponse.status).to.equal(200);
    expect(secondResponse.status).to.equal(200);
    expect(blockedResponse.status).to.equal(429);
    expect(blockedResponse.headers).to.have.property('retry-after');
    expect(Number(blockedResponse.headers['retry-after'])).to.be.greaterThan(0);

    const errorCode = ERROR_CODES.RATE_LIMIT_EXCEEDED;

    expect(blockedResponse.body).to.deep.equal({
      status: 'error',
      error: errorCode,
      message: ERROR_DICTIONARY[errorCode].message
    });

  });

});
