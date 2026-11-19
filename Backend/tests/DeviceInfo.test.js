'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { extractDeviceInfo } = require('../src/infrastructure/auth/utils/deviceInfo');

test('extractDeviceInfo: extrae información consistente con las sesiones del sistema', () => {
  const req = {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'x-forwarded-for': '190.220.10.5, 10.0.0.1',
      'x-device-id': 'dev_test_abc_123',
      'x-device-fingerprint': 'fp_hash_sha256_mock_xyz'
    },
    auth: {
      sid: 'sess_9999_test'
    }
  };

  const device = extractDeviceInfo(req);

  assert.equal(device.ipAddress, '190.220.10.5');
  assert.equal(device.deviceId, 'dev_test_abc_123');
  assert.equal(device.deviceFingerprint, 'fp_hash_sha256_mock_xyz');
  assert.equal(device.sessionId, 'sess_9999_test');
  assert.equal(device.clientName, 'Google Chrome en Windows');
});

test('extractDeviceInfo: tolera peticiones vacías sin lanzar excepciones', () => {
  const device = extractDeviceInfo(null);

  assert.equal(device.ipAddress, '127.0.0.1');
  assert.equal(device.clientName, 'Dispositivo desconocido');
  assert.equal(device.deviceId, null);
  assert.equal(device.deviceFingerprint, null);
  assert.equal(device.sessionId, null);
});
