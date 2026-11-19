'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const SnapshotCryptoService = require('../src/infrastructure/security/SnapshotCryptoService');

test('SnapshotCryptoService: genera hash canónico y firma verificable', () => {
  const service = new SnapshotCryptoService({ hmacSecret: 'test-secret-key-123456789' });
  const data = {
    essayId: '11111111-2222-3333-4444-555555555555',
    form: 'F-PC13-01',
    applicant: 'Fábrica de Sillas SRL',
    items: ['Silla ergonómica mod. 2026']
  };

  const { canonicalHash, canonicalString } = service.hashCanonical(data);
  assert.equal(typeof canonicalHash, 'string');
  assert.equal(canonicalHash.length, 64);
  assert.ok(canonicalString.startsWith('{'));

  const { signature, algorithm } = service.signHash(canonicalHash);
  assert.ok(signature);
  assert.equal(algorithm, 'HMAC-SHA256');

  // Verificar firma correcta
  const isValid = service.verifySignature(canonicalHash, signature, algorithm);
  assert.equal(isValid, true);

  // Verificar firma rechazada con hash alterado
  const isInvalid = service.verifySignature('a'.repeat(64), signature, algorithm);
  assert.equal(isInvalid, false);
});

test('SnapshotCryptoService: detecta alteración o manipulación (tampering) en la base de datos', () => {
  const service = new SnapshotCryptoService({ hmacSecret: 'test-secret-key-123456789' });
  const originalData = {
    client: { name: 'Cliente Auténtico', cuit: '30112233445' },
    terms: { price: 150000, daysToDo: 15 }
  };

  const { canonicalHash } = service.hashCanonical(originalData);
  const { signature, algorithm } = service.signHash(canonicalHash);

  const snapshotRecord = {
    snapshot_data: originalData,
    canonical_hash: canonicalHash,
    signature: signature,
    signature_algorithm: algorithm
  };

  // 1. Verificación exitosa del registro original
  const checkOriginal = service.verifySnapshotIntegrity(snapshotRecord);
  assert.equal(checkOriginal.valid, true);

  // 2. Manipulación en DB: alguien altera el precio en la tabla
  const tamperedRecord = {
    ...snapshotRecord,
    snapshot_data: {
      ...originalData,
      terms: { price: 50000, daysToDo: 15 } // alterado fraudulentamente en DB
    }
  };

  const checkTampered = service.verifySnapshotIntegrity(tamperedRecord);
  assert.equal(checkTampered.valid, false);
  assert.equal(checkTampered.reason, 'HASH_MISMATCH');
  assert.ok(checkTampered.message.includes('alterados'));

  // 3. Manipulación de firma
  const tamperedSigRecord = {
    ...snapshotRecord,
    signature: 'bad-signature-base64'
  };
  const checkTamperedSig = service.verifySnapshotIntegrity(tamperedSigRecord);
  assert.equal(checkTamperedSig.valid, false);
  assert.equal(checkTamperedSig.reason, 'SIGNATURE_INVALID');
});
