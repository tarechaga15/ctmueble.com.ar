'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { canonicalize } = require('../src/infrastructure/security/CanonicalJson');

test('CanonicalJson: produce idéntica salida independientemente del orden de las propiedades', () => {
  const obj1 = {
    cuit: '20123456789',
    name: 'Muebles CTM S.A.',
    price: 150000,
    active: true,
    address: {
      street: 'Av. Belgrano 123',
      city: 'CABA',
      country: 'AR'
    }
  };

  const obj2 = {
    address: {
      country: 'AR',
      city: 'CABA',
      street: 'Av. Belgrano 123'
    },
    price: 150000,
    name: 'Muebles CTM S.A.',
    active: true,
    cuit: '20123456789'
  };

  const str1 = canonicalize(obj1);
  const str2 = canonicalize(obj2);

  assert.equal(str1, str2);

  const hash1 = crypto.createHash('sha256').update(str1).digest('hex');
  const hash2 = crypto.createHash('sha256').update(str2).digest('hex');

  assert.equal(hash1, hash2);
});

test('CanonicalJson: maneja arrays, números, nulls y fechas de forma estricta', () => {
  const date = new Date('2026-11-14T00:00:00.000Z');
  const payload = {
    list: [3, 2, 1],
    date: date,
    nullVal: null,
    undefVal: undefined,
    zero: 0
  };

  const result = canonicalize(payload);
  assert.ok(result.includes('"list":[3,2,1]'));
  assert.ok(result.includes(`"date":"2026-11-14T00:00:00.000Z"`));
  assert.ok(result.includes('"nullVal":null'));
  assert.ok(!result.includes('undefVal'));
  assert.ok(result.includes('"zero":0'));
});
