const test = require('node:test');
const assert = require('node:assert/strict');

const { createRateLimiter } = require('../../src/presentation/middlewares/rateLimit');
const { createMockRes, createNextSpy } = require('./helpers');

test('rate limiter permite requests dentro del límite', () => {
  const limiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 2,
    code: 'TEST_RATE_LIMIT',
    message: 'Límite alcanzado'
  });

  const req1 = { headers: {}, ip: '127.0.0.1', method: 'GET', originalUrl: '/test' };
  const req2 = { headers: {}, ip: '127.0.0.1', method: 'GET', originalUrl: '/test' };
  const res1 = createMockRes();
  const res2 = createMockRes();
  const next1 = createNextSpy();
  const next2 = createNextSpy();

  limiter(req1, res1, next1);
  limiter(req2, res2, next2);

  assert.equal(next1.called, true);
  assert.equal(next2.called, true);
  assert.equal(res1.body, null);
  assert.equal(res2.body, null);
});

test('rate limiter responde 429 con contrato estándar y Retry-After', () => {
  const limiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 1,
    code: 'TEST_RATE_LIMIT',
    message: 'Demasiadas solicitudes de prueba'
  });

  const req = { headers: {}, ip: '127.0.0.2', method: 'POST', originalUrl: '/auth/login' };

  const resFirst = createMockRes();
  const nextFirst = createNextSpy();
  limiter(req, resFirst, nextFirst);
  assert.equal(nextFirst.called, true);

  const resSecond = createMockRes();
  const nextSecond = createNextSpy();
  limiter(req, resSecond, nextSecond);

  assert.equal(nextSecond.called, false);
  assert.equal(resSecond.statusCode, 429);
  assert.deepEqual(resSecond.body, {
    code: 'TEST_RATE_LIMIT',
    message: 'Demasiadas solicitudes de prueba'
  });
  assert.ok(resSecond.headers['Retry-After']);
  assert.match(String(resSecond.headers['Retry-After']), /^\d+$/);
});

test('rate limiter usa x-forwarded-for como identificador de cliente', () => {
  const limiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 1,
    code: 'TEST_RATE_LIMIT_XFF',
    message: 'Demasiadas solicitudes'
  });

  const reqA = {
    headers: { 'x-forwarded-for': '10.0.0.8, 10.0.0.1' },
    ip: '127.0.0.10',
    method: 'GET',
    originalUrl: '/essays/download-document'
  };
  const reqB = {
    headers: { 'x-forwarded-for': '10.0.0.8, 10.0.0.9' },
    ip: '127.0.0.11',
    method: 'GET',
    originalUrl: '/essays/download-document'
  };

  const resA1 = createMockRes();
  const nextA1 = createNextSpy();
  limiter(reqA, resA1, nextA1);
  assert.equal(nextA1.called, true);

  const resB = createMockRes();
  const nextB = createNextSpy();
  limiter(reqB, resB, nextB);

  assert.equal(nextB.called, false);
  assert.equal(resB.statusCode, 429);
  assert.deepEqual(resB.body, {
    code: 'TEST_RATE_LIMIT_XFF',
    message: 'Demasiadas solicitudes'
  });
});

