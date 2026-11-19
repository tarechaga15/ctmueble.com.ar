const test = require('node:test');
const assert = require('node:assert/strict');

const normalizeErrorResponse = require('../../src/presentation/middlewares/normalizeErrorResponse');
const { createMockRes, createNextSpy } = require('./helpers');

test('normalizeErrorResponse no modifica respuestas exitosas', () => {
  const req = {};
  const res = createMockRes();
  const next = createNextSpy();

  normalizeErrorResponse(req, res, next);
  assert.equal(next.called, true);

  res.status(200).json({ ok: true });
  assert.deepEqual(res.body, { ok: true });
});

test('normalizeErrorResponse normaliza body con error string', () => {
  const req = {};
  const res = createMockRes();
  normalizeErrorResponse(req, res, () => {});

  res.status(400).json({ error: 'Dato inválido' });

  assert.deepEqual(res.body, {
    code: 'BAD_REQUEST',
    message: 'Dato inválido'
  });
});

test('normalizeErrorResponse conserva code explícito y agrega details', () => {
  const req = {};
  const res = createMockRes();
  normalizeErrorResponse(req, res, () => {});

  res.status(422).json({
    code: 'VALIDATION_ERROR',
    message: 'Validación fallida',
    field: 'cuit',
    reason: 'invalid_format'
  });

  assert.deepEqual(res.body, {
    code: 'VALIDATION_ERROR',
    message: 'Validación fallida',
    details: {
      field: 'cuit',
      reason: 'invalid_format'
    }
  });
});

test('normalizeErrorResponse usa defaults en 500 sin body', () => {
  const req = {};
  const res = createMockRes();
  normalizeErrorResponse(req, res, () => {});

  res.status(500).json();

  assert.deepEqual(res.body, {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor'
  });
});

