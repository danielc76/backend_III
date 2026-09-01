import { access } from 'node:fs/promises';
import path from 'node:path';

import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';

import app from '../src/app.js';
import Delivery from '../src/models/delivery.model.js';
import User from '../src/models/user.model.js';
import {
  DOCUMENT_TYPES,
  MAX_FILE_SIZE,
  USER_ROLES
} from '../src/constants/index.js';
import {
  ERROR_CODES,
  ERROR_DICTIONARY
} from '../src/constants/error.constants.js';


const pdfFile = Buffer.from('%PDF-1.4 archivo de prueba');


const createTestUser = async () => {

  return await User.create({
    firstName: 'Usuario',
    lastName: 'Archivo',
    email: 'usuario.archivo@shipnow.com',
    password: '123456',
    role: USER_ROLES.CUSTOMER
  });

};


const createTestDelivery = async () => {

  return await Delivery.create({
    order: new mongoose.Types.ObjectId()
  });

};


const expectApiError = (response, errorCode) => {

  expect(response.status).to.equal(
    ERROR_DICTIONARY[errorCode].statusCode
  );
  expect(response.body).to.deep.equal({
    status: 'error',
    error: errorCode,
    message: ERROR_DICTIONARY[errorCode].message
  });

};


describe('Uploads API', () => {

  it('debería cargar un documento y asociarlo al usuario', async () => {

    const user = await createTestUser();

    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', DOCUMENT_TYPES.USER_DOCUMENT)
      .attach('document', pdfFile, {
        filename: 'documento.pdf',
        contentType: 'application/pdf'
      });

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal(
      'Documento cargado correctamente'
    );
    expect(response.body.user.documents).to.have.lengthOf(1);

    const document = response.body.user.documents[0];

    expect(document).to.include({
      originalName: 'documento.pdf',
      mimeType: 'application/pdf',
      size: pdfFile.length,
      documentType: DOCUMENT_TYPES.USER_DOCUMENT
    });
    expect(document.generatedName).to.be.a('string');
    expect(document.path).to.include('uploads/test/users/documents');
    expect(document.uploadedAt).to.be.a('string');

    await access(path.resolve(document.path));

    const savedUser = await User.findById(user._id);

    expect(savedUser.documents).to.have.lengthOf(1);

  });


  it('debería responder error cuando falta el archivo', async () => {

    const user = await createTestUser();

    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', DOCUMENT_TYPES.USER_DOCUMENT);

    expectApiError(response, ERROR_CODES.FILE_REQUIRED);

  });


  it('debería responder error si el tipo de documento no es válido', async () => {

    const user = await createTestUser();

    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', 'tipo_invalido')
      .attach('document', pdfFile, {
        filename: 'documento.pdf',
        contentType: 'application/pdf'
      });

    expectApiError(response, ERROR_CODES.INVALID_DOCUMENT_TYPE);

    const savedUser = await User.findById(user._id);

    expect(savedUser.documents).to.have.lengthOf(0);

  });


  it('debería responder error si el usuario no existe', async () => {

    const response = await request(app)
      .post('/api/users/000000000000000000000000/documents')
      .field('documentType', DOCUMENT_TYPES.USER_DOCUMENT)
      .attach('document', pdfFile, {
        filename: 'documento.pdf',
        contentType: 'application/pdf'
      });

    expectApiError(response, ERROR_CODES.USER_NOT_FOUND);

  });


  it('debería cargar un comprobante y asociarlo a la entrega', async () => {

    const delivery = await createTestDelivery();

    const response = await request(app)
      .post(`/api/deliveries/${delivery._id}/proof`)
      .attach('proof', pdfFile, {
        filename: 'comprobante.pdf',
        contentType: 'application/pdf'
      });

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal(
      'Comprobante cargado correctamente'
    );
    expect(response.body.delivery.proofs).to.have.lengthOf(1);

    const proof = response.body.delivery.proofs[0];

    expect(proof).to.include({
      originalName: 'comprobante.pdf',
      mimeType: 'application/pdf',
      size: pdfFile.length,
      documentType: DOCUMENT_TYPES.DELIVERY_PROOF
    });
    expect(proof.generatedName).to.be.a('string');
    expect(proof.path).to.include('uploads/test/deliveries/proofs');
    expect(proof.uploadedAt).to.be.a('string');

    await access(path.resolve(proof.path));

    const savedDelivery = await Delivery.findById(delivery._id);

    expect(savedDelivery.proofs).to.have.lengthOf(1);

  });


  it('debería responder error si la entrega no existe', async () => {

    const response = await request(app)
      .post('/api/deliveries/000000000000000000000000/proof')
      .attach('proof', pdfFile, {
        filename: 'comprobante.pdf',
        contentType: 'application/pdf'
      });

    expectApiError(response, ERROR_CODES.DELIVERY_NOT_FOUND);

  });


  it('debería responder error si el formato del archivo no está permitido', async () => {

    const user = await createTestUser();

    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', DOCUMENT_TYPES.USER_DOCUMENT)
      .attach('document', Buffer.from('archivo de texto'), {
        filename: 'documento.txt',
        contentType: 'text/plain'
      });

    expectApiError(response, ERROR_CODES.INVALID_FILE_TYPE);

  });


  it('debería responder error si el archivo supera el tamaño máximo', async () => {

    const user = await createTestUser();
    const oversizedFile = Buffer.alloc(MAX_FILE_SIZE + 1);

    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', DOCUMENT_TYPES.USER_DOCUMENT)
      .attach('document', oversizedFile, {
        filename: 'documento-grande.pdf',
        contentType: 'application/pdf'
      });

    expectApiError(response, ERROR_CODES.FILE_TOO_LARGE);

  });


  it('debería responder error si el campo del archivo es incorrecto', async () => {

    const user = await createTestUser();

    const response = await request(app)
      .post(`/api/users/${user._id}/documents`)
      .field('documentType', DOCUMENT_TYPES.USER_DOCUMENT)
      .attach('archivo', pdfFile, {
        filename: 'documento.pdf',
        contentType: 'application/pdf'
      });

    expectApiError(response, ERROR_CODES.INVALID_FILE_FIELD);

  });

});
