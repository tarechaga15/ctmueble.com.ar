'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const SecurityAuditService = require('../src/application/security/SecurityAuditService');

test('SecurityAuditService: recopila información del dispositivo y genera hash criptográfico', async () => {
  const req = {
    method: 'POST',
    baseUrl: '/api/v1/essays',
    path: '/create',
    headers: {
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      'x-forwarded-for': '181.44.20.1',
      'x-device-id': 'iphone_client_device_777',
      'x-device-fingerprint': 'fp_iphone_secure_hash_888'
    },
    auth: {
      sid: 'sess_ios_456'
    },
    user: {
      id: 'usr_mobile_999'
    }
  };

  const payload = {
    action: 'ESSAY_CREATE',
    resource: 'essays',
    resourceId: 'essay_uuid_123',
    outcome: 'SUCCESS',
    metadata: {
      elementProduct: 'Silla gamer'
    }
  };

  const result = await SecurityAuditService.recordFromRequest(req, payload);

  assert.equal(result.client_name, 'Apple Safari en iPhone');
  assert.equal(result.device_id, 'iphone_client_device_777');
  assert.equal(result.device_fingerprint, 'fp_iphone_secure_hash_888');
  assert.equal(result.session_id, 'sess_ios_456');
  assert.equal(result.ip_address, '181.44.20.1');

  // Integridad criptográfica generada en el registro
  assert.ok(result.record_hash);
  assert.equal(result.record_hash.length, 64);
  assert.ok(result.signature);
});
