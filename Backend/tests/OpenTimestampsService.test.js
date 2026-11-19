'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const OpenTimestampsService = require('../src/infrastructure/security/OpenTimestampsService');
const { OTS_MAGIC_BYTES } = require('../src/infrastructure/security/OpenTimestampsService');

test('OpenTimestampsService: reconoce encabezado binario mágico oficial OTS', () => {
  const service = new OpenTimestampsService();

  assert.equal(service.isValidOtsBuffer(OTS_MAGIC_BYTES), true);

  const invalidBuffer = Buffer.from('NOT_AN_OTS_FILE_HEADER_XYZ');
  assert.equal(service.isValidOtsBuffer(invalidBuffer), false);
  assert.equal(service.isValidOtsBuffer(null), false);
});

test('OpenTimestampsService: crea comprobante binario OTS válido y parseable', async () => {
  const service = new OpenTimestampsService({ timeoutMs: 1000 });
  const sampleHash = crypto.createHash('sha256').update('datos-de-prueba-ctm-2026').digest('hex');

  const result = await service.stampHash(sampleHash);

  assert.equal(result.status, 'STAMPED');
  assert.ok(result.proofBase64);
  assert.equal(typeof result.proofBase64, 'string');

  const binaryBuffer = service.getOtsBinaryBuffer(result.proofBase64);
  assert.ok(Buffer.isBuffer(binaryBuffer));
  assert.ok(binaryBuffer.length > OTS_MAGIC_BYTES.length);
  assert.equal(service.isValidOtsBuffer(binaryBuffer), true);
});

test('OpenTimestampsService: ensambla correctamente la respuesta binaria de calendario OTS en un archivo .ots canónico', () => {
  const service = new OpenTimestampsService();
  const hash = crypto.createHash('sha256').update('documento-solicitud-ctm').digest();

  // Simular payload típico devuelto por un calendario OTS en POST /digest (fragmento Merkle sin magic header)
  const mockCalendarStream = Buffer.from([0xf0, 0x08, 0x92, 0x90, 0xe6, 0x54, 0x44, 0xfc, 0xa4, 0x81, 0x08, 0xf1, 0x20, 0x9d, 0x68, 0x13]);

  const assembled = service.assembleOtsFile(hash, mockCalendarStream);

  assert.ok(Buffer.isBuffer(assembled));
  assert.equal(service.isValidOtsBuffer(assembled), true);
  assert.ok(assembled.subarray(0, 31).equals(OTS_MAGIC_BYTES));
  // Comprobar que contiene el opcode SHA256 (0x08) y el hash de 32 bytes
  assert.equal(assembled[32], 0x08);
  assert.ok(assembled.subarray(33, 65).equals(hash));
});
