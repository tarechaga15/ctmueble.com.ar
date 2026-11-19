const test = require('node:test');
const assert = require('node:assert/strict');

const requireLaboratory = require('../../src/presentation/middlewares/requireLaboratory');
const verifyJWT = require('../../src/presentation/middlewares/jwt.verify');
const { createMockRes, createNextSpy } = require('./helpers');

test('requireLaboratory rechaza usuario no laboratorio con contrato estandar', () => {
  const req = {
    user: { id: 'u1', profile: 'CLIENT' },
    method: 'GET',
    originalUrl: '/samples/fetch'
  };
  const res = createMockRes();
  const next = createNextSpy();

  requireLaboratory(req, res, next);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    code: 'LABORATORY_REQUIRED',
    message: 'Solo el laboratorio puede acceder a este recurso'
  });
});

test('requireLaboratory permite usuario laboratorio', () => {
  const req = {
    user: { id: 'u1', profile: 'LABORATORY' }
  };
  const res = createMockRes();
  const next = createNextSpy();

  requireLaboratory(req, res, next);

  assert.equal(next.called, true);
  assert.equal(res.body, null);
});

test('verifyJWT rechaza request sin authorization', async () => {
  const req = {
    headers: {},
    method: 'GET',
    originalUrl: '/clients/fetch'
  };
  const res = createMockRes();
  const next = createNextSpy();

  await verifyJWT(req, res, next);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    code: 'TOKEN_REQUIRED',
    message: 'Token requerido'
  });
});

test('verifyJWT rechaza formato inválido de authorization', async () => {
  const req = {
    headers: { authorization: 'Token abc' },
    method: 'GET',
    originalUrl: '/clients/fetch'
  };
  const res = createMockRes();
  const next = createNextSpy();

  await verifyJWT(req, res, next);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    code: 'TOKEN_FORMAT_INVALID',
    message: 'Formato de token inválido'
  });
});

