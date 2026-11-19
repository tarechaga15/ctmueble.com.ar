const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const { isOriginAllowed, resolveSafeFrontendUrl } = require('../../src/presentation/middlewares/csrf');
const { escapeHtml } = require('../../src/infrastructure/mailing/MailingService');
const AuthApplicationService = require('../../src/application/auth/services/AuthApplicationService');
const SessionRevocationService = require('../../src/infrastructure/auth/services/SessionRevocationService');
const JWTService = require('../../src/infrastructure/auth/services/JWTService');
const TwoFactorAuthService = require('../../src/application/security/TwoFactorAuthService');
const PasswordResetService = require('../../src/application/security/PasswordResetService');
const UserSessionService = require('../../src/infrastructure/auth/services/UserSessionService');
const TrustedDeviceService = require('../../src/infrastructure/auth/services/TrustedDeviceService');
const verifyJWT = require('../../src/presentation/middlewares/jwt.verify');
const requireLabPermission = require('../../src/presentation/middlewares/requireLabPermission');
const EssayApplicationService = require('../../src/application/essays/services/EssayApplicationService');
const SnapshotApplicationService = require('../../src/application/essays/services/SnapshotApplicationService');
const AesGcmEncryptionProvider = require('../../src/infrastructure/security/encryption/AesGcmEncryptionProvider');
const SnapshotCryptoService = require('../../src/infrastructure/security/SnapshotCryptoService');
const UserRepository = require('../../src/infrastructure/repositories/users/UserRepository');
const { createMockRes, createNextSpy } = require('../contracts/helpers');

function withEnv(overrides, fn) {
  const prev = {};
  for (const key of Object.keys(overrides)) {
    prev[key] = process.env[key];
    if (overrides[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = overrides[key];
    }
  }
  const restore = () => {
    for (const key of Object.keys(overrides)) {
      if (prev[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = prev[key];
      }
    }
  };
  try {
    const out = fn();
    if (out && typeof out.then === 'function') {
      return out.finally(restore);
    }
    restore();
    return out;
  } catch (err) {
    restore();
    throw err;
  }
}

test('Bloque 1+2: resolveSafeFrontendUrl rechaza dominios externos/HTTP en prod y escapeHtml neutraliza XSS', async () => {
  await withEnv(
    {
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://oficina.ctmueble.com.ar',
      CORS_ALLOWED_ORIGINS: undefined
    },
    () => {
      assert.equal(isOriginAllowed('https://evil-attacker.vercel.app'), false);
      assert.equal(isOriginAllowed('http://oficina.ctmueble.com.ar'), false);
      assert.equal(isOriginAllowed('https://oficina.ctmueble.com.ar'), true);
      assert.equal(isOriginAllowed('https://oficina-preview-tarechaga15.vercel.app'), true);

      assert.equal(resolveSafeFrontendUrl('https://evil.example.com'), 'https://oficina.ctmueble.com.ar');
      assert.equal(resolveSafeFrontendUrl('javascript:alert(1)'), 'https://oficina.ctmueble.com.ar');
      assert.equal(
        resolveSafeFrontendUrl('https://oficina.ctmueble.com.ar/verify-email?foo=bar'),
        'https://oficina.ctmueble.com.ar'
      );
    }
  );

  const escaped = escapeHtml(`<script>alert("xss")</script> & 'quoted'`);
  assert.equal(escaped.includes('<script>'), false);
  assert.equal(escaped.includes('&lt;script&gt;'), true);
  assert.equal(escaped.includes('&amp;'), true);
  assert.equal(escaped.includes('&#39;quoted&#39;'), true);
});

test('Bloque 3: Usuario inactivo (isActive === false) es rechazado en login, refreshTokens y verifyJWT', async () => {
  const inactiveUser = {
    id: 'user-inactive-1',
    mail: 'inactive@ctm.test',
    name: 'Inactive',
    dni: '20111222',
    profile: 'CLIENT',
    passwordHash: '$2b$12$fakehash',
    isActive: false,
    twoFactorEnabled: false
  };

  const revocation = new SessionRevocationService();
  const authApp = new AuthApplicationService({
    userRepository: {
      findByMail: async () => inactiveUser,
      findById: async () => inactiveUser,
      findByIdWithSecrets: async () => inactiveUser,
      findUserLaboratories: async () => []
    },
    personRepository: {},
    passwordHasher: { compare: async () => true, hash: async () => 'x' },
    jwtService: JWTService,
    revocationService: revocation
  });

  await assert.rejects(
    () => authApp.login('inactive@ctm.test', 'ValidPassword123'),
    (err) => err.code === 'ACCOUNT_DISABLED'
  );

  const tokens = JWTService.generateTokens({ access: { id: inactiveUser.id }, refresh: { id: inactiveUser.id } });
  await assert.rejects(
    () => authApp.refreshTokens(tokens.refresh_token),
    (err) => err.code === 'ACCOUNT_DISABLED'
  );

  // Stub UserRepository.prototype para que la instancia interna de jwt.verify resuelva el usuario inactivo -> 403 ACCOUNT_DISABLED
  const origProtoFindById = UserRepository.prototype.findById;
  const origProtoFindLabs = UserRepository.prototype.findUserLaboratories;
  UserRepository.prototype.findById = async () => inactiveUser;
  UserRepository.prototype.findUserLaboratories = async () => [];

  try {
    await withEnv(
      {
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'e'.repeat(64),
        JWT_REFRESH_SECRET: 'f'.repeat(64)
      },
      async () => {
        const prodAccessToken = JWTService.signAccessToken({ id: inactiveUser.id });
        const req = {
          cookies: { ctm_at: prodAccessToken },
          headers: {},
          method: 'GET',
          originalUrl: '/api/auth/session'
        };
        const res = createMockRes();
        const next = createNextSpy();
        await verifyJWT(req, res, next);
        assert.equal(next.called, false);
        assert.equal(res.statusCode, 403);
        assert.equal(res.body.code, 'ACCOUNT_DISABLED');
      }
    );
  } finally {
    UserRepository.prototype.findById = origProtoFindById;
    UserRepository.prototype.findUserLaboratories = origProtoFindLabs;
  }
});

test('Bloque 3: 2FA tempToken soporta lockout tras 5 fallos, es single-use y aísla propósito EMAIL', async () => {
  const revocation = new SessionRevocationService();
  revocation.clearMemory();

  const user = {
    id: 'user-2fa-1',
    mail: '2fa@ctm.test',
    name: '2FA User',
    dni: '30111222',
    profile: 'LABORATORY',
    isActive: true,
    twoFactorEnabled: true,
    twoFactorMethod: 'TOTP',
    twoFactorSecret: 'JBSWY3DPEHPK3PXP'
  };

  let totpValid = false;
  const twoFactorSingleton = TwoFactorAuthService.getInstance();
  const origVerifyTotp = twoFactorSingleton.verifyTotp;
  twoFactorSingleton.verifyTotp = () => totpValid;

  const authApp = new AuthApplicationService({
    userRepository: {
      findById: async () => user,
      findByIdWithSecrets: async () => user,
      findUserLaboratories: async () => []
    },
    personRepository: {},
    passwordHasher: { compare: async () => true, hash: async () => 'x' },
    jwtService: JWTService,
    revocationService: revocation
  });

  try {
    const tempTokenBrute = JWTService.sign2FATempToken({ id: user.id, mail: user.mail, method: 'TOTP' });
    const decodedTemp = JWTService.verify2FATempToken(tempTokenBrute);
    assert.ok(decodedTemp.jti, 'tempToken debe incluir jti único');

    // 4 fallos -> INVALID_2FA_CODE
    for (let i = 0; i < 4; i++) {
      await assert.rejects(
        () => authApp.verify2FALogin({ tempToken: tempTokenBrute, code: '000000' }),
        (err) => err.code === 'INVALID_2FA_CODE'
      );
    }

    // 5to fallo -> 2FA_MAX_ATTEMPTS y revoca jti
    await assert.rejects(
      () => authApp.verify2FALogin({ tempToken: tempTokenBrute, code: '000000' }),
      (err) => err.code === '2FA_MAX_ATTEMPTS'
    );

    // 6to intento incluso con código válido debe rechazarse como 2FA_SESSION_EXPIRED
    totpValid = true;
    await assert.rejects(
      () => authApp.verify2FALogin({ tempToken: tempTokenBrute, code: '123456' }),
      (err) => err.code === '2FA_SESSION_EXPIRED'
    );

    // Single-use: un tempToken consumido con éxito no puede reutilizarse
    const singleUseToken = JWTService.sign2FATempToken({ id: user.id, mail: user.mail, method: 'TOTP' });
    const loginResult = await authApp.verify2FALogin({ tempToken: singleUseToken, code: '123456' });
    assert.ok(loginResult.accessToken);

    await assert.rejects(
      () => authApp.verify2FALogin({ tempToken: singleUseToken, code: '123456' }),
      (err) => err.code === '2FA_SESSION_EXPIRED'
    );

    // Aislamiento de propósito EMAIL OTP: prefijo '2FA:' y token_hash '2fa_otp_'
    let createdRow = null;
    let sentOtp = null;
    const twoFa = new TwoFactorAuthService({
      mailingService: {
        isConfigured: async () => true,
        sendTwoFactorOtpEmail: async ({ otpCode }) => {
          sentOtp = otpCode;
        }
      },
      emailVerificationModel: {
        destroy: async () => 0,
        create: async (row) => {
          createdRow = row;
          return row;
        }
      }
    });
    await twoFa.sendEmailOtp({ mail: user.mail, name: user.name, userId: user.id });
    assert.ok(sentOtp && createdRow);
    assert.equal(createdRow.token_hash.startsWith('2fa_otp_'), true);
    const plainSha = crypto.createHash('sha256').update(sentOtp).digest('hex');
    assert.notEqual(createdRow.otp_code_hash, plainSha);
    assert.equal(
      createdRow.otp_code_hash,
      crypto.createHash('sha256').update(`2FA:${sentOtp}`).digest('hex')
    );
  } finally {
    twoFactorSingleton.verifyTotp = origVerifyTotp;
    revocation.clearMemory();
  }
});

test('Bloque 3: PasswordResetService revoca sesiones activas y dispositivos de confianza tras resetPassword', async () => {
  const otp = '654321';
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  const record = {
    id: 'pr-1',
    user_id: 'user-reset-1',
    mail: 'reset@ctm.test',
    otp_code_hash: otpHash,
    token_hash: 'tokhash',
    expires_at: new Date(Date.now() + 600000),
    used_at: null,
    attempts: 0,
    updateCalls: [],
    async update(vals) {
      this.updateCalls.push(vals);
      Object.assign(this, vals);
    }
  };

  let revokedSessionsForUser = null;
  let revokedDevicesForUser = null;
  const sessionInst = UserSessionService.getInstance();
  const deviceInst = TrustedDeviceService.getInstance();
  const origRevokeSessions = sessionInst.revokeOtherSessions;
  const origRevokeDevices = deviceInst.revokeAllDevices;

  sessionInst.revokeOtherSessions = async (userId, currentSid) => {
    revokedSessionsForUser = { userId, currentSid };
    return 1;
  };
  deviceInst.revokeAllDevices = async (userId) => {
    revokedDevicesForUser = userId;
    return 1;
  };

  try {
    const svc = new PasswordResetService({
      model: { findOne: async () => record },
      userRepository: { updatePassword: async () => true },
      passwordHasher: { hash: async () => 'hashed-new-pass', compare: async () => true }
    });

    const out = await svc.resetPassword({
      mail: 'reset@ctm.test',
      otpCode: otp,
      newPassword: 'SuperSecureNewPassword123!'
    });

    assert.equal(out.success, true);
    assert.deepEqual(revokedSessionsForUser, { userId: 'user-reset-1', currentSid: null });
    assert.equal(revokedDevicesForUser, 'user-reset-1');
  } finally {
    sessionInst.revokeOtherSessions = origRevokeSessions;
    deviceInst.revokeAllDevices = origRevokeDevices;
  }
});

test('Bloque 4: requireLabPermission bloquea rol CONSULTA en escritura y permite ADMIN / isSuperAdmin', async () => {
  const mw = requireLabPermission('muestras.recepcionar');

  // CONSULTA bloqueado con 403 LAB_PERMISSION_DENIED
  const reqConsulta = {
    user: { id: 'u1', profile: 'LABORATORY', labRole: 'CONSULTA', isSuperAdmin: false },
    method: 'POST',
    originalUrl: '/api/samples/receive-samples'
  };
  const resConsulta = createMockRes();
  const nextConsulta = createNextSpy();
  await mw(reqConsulta, resConsulta, nextConsulta);
  assert.equal(nextConsulta.called, false);
  assert.equal(resConsulta.statusCode, 403);
  assert.equal(resConsulta.body.code, 'LAB_PERMISSION_DENIED');

  // USER sin permiso de configuración mailing bloqueado
  const mwConfig = requireLabPermission('configuracion.mailing');
  const reqUser = {
    user: { id: 'u2', profile: 'LABORATORY', labRole: 'USER', isSuperAdmin: false },
    method: 'POST',
    originalUrl: '/api/api-keys'
  };
  const resUser = createMockRes();
  const nextUser = createNextSpy();
  await mwConfig(reqUser, resUser, nextUser);
  assert.equal(nextUser.called, false);
  assert.equal(resUser.statusCode, 403);

  // ADMIN permitido
  const reqAdmin = {
    user: { id: 'u3', profile: 'LABORATORY', labRole: 'ADMIN', isSuperAdmin: true },
    method: 'POST',
    originalUrl: '/api/api-keys'
  };
  const resAdmin = createMockRes();
  const nextAdmin = createNextSpy();
  await mwConfig(reqAdmin, resAdmin, nextAdmin);
  assert.equal(nextAdmin.called, true);
});

test('Bloque 5: Anti-IDOR en verifyEssaySnapshot/getSnapshotOtsProof y redacción PII por perfil', async () => {
  const fakeSnapshotRow = {
    id: 'snap-1',
    essay_id: 'essay-owned-by-other',
    document_type: 'F-PC13-01',
    version: 1,
    event_code: 'REQUEST_CREATED',
    snapshot_data: { version: 1 },
    canonical_hash: 'a'.repeat(64),
    signature: 'sig',
    signature_algorithm: 'HMAC-SHA256',
    ots_status: 'STAMPED',
    ots_proof: Buffer.from('\x00OpenTimestamps\x00\x00Proof\xbf\x89\xe2\xe8\x84\xe8\x92\x94\x01').toString('base64'),
    ots_calendar_url: 'https://a.pool.opentimestamps.org',
    ots_stamped_at: new Date(),
    user_id: 'other-user',
    session_id: 'sid-1234567890-abcdef',
    device_id: 'dev-secret-id',
    device_fingerprint: 'fp-secret-hash',
    client_name: 'Chrome / Windows',
    ip_address: '190.10.20.30',
    user_agent: 'Mozilla/5.0 PrivateAgent',
    created_at: new Date()
  };

  const snapSvc = new SnapshotApplicationService({
    snapshotModel: {
      findByPk: async () => fakeSnapshotRow,
      findAll: async () => [fakeSnapshotRow]
    },
    cryptoService: {
      verifySnapshotIntegrity: () => ({ valid: true })
    },
    otsService: {
      getOtsBinaryBuffer: (b64) => Buffer.from(b64, 'base64'),
      isValidOtsBuffer: () => true
    }
  });

  // Redacción para CLIENT vs enmascarado de sessionId para LABORATORY
  const clientVerify = await snapSvc.verifySnapshot('snap-1', {
    user: { id: 'client-1', profile: 'CLIENT' }
  });
  assert.equal(clientVerify.device.ipAddress, undefined);
  assert.equal(clientVerify.device.deviceId, undefined);
  assert.equal(clientVerify.device.sessionId, undefined);
  assert.equal(clientVerify.device.clientName, 'Chrome / Windows');

  const clientList = await snapSvc.getSnapshotsByEssay('essay-owned-by-other', {
    user: { id: 'client-1', profile: 'CLIENT' }
  });
  assert.equal(clientList[0].ip_address, undefined);
  assert.equal(clientList[0].device_id, undefined);
  assert.equal(clientList[0].session_id, undefined);

  const labVerify = await snapSvc.verifySnapshot('snap-1', {
    user: { id: 'lab-1', profile: 'LABORATORY' }
  });
  assert.equal(labVerify.device.ipAddress, '190.10.20.30');
  assert.equal(labVerify.device.sessionId, 'sid-1234...');

  // IDOR block en EssayApplicationService cuando essayRepository.findById retorna null
  const essayService = new EssayApplicationService({
    context: { user: { id: 'attacker-client', profile: 'CLIENT' } }
  });
  essayService.snapshotService = snapSvc;
  essayService.essayRepository = {
    findById: async () => null
  };

  await assert.rejects(
    () => essayService.verifyEssaySnapshot('snap-1'),
    (err) => err.status === 404 && err.code === 'SNAPSHOT_NOT_FOUND'
  );
  await assert.rejects(
    () => essayService.getSnapshotOtsProof('snap-1'),
    (err) => err.status === 404 && err.code === 'SNAPSHOT_NOT_FOUND'
  );
});

test('Bloque 1: Criptografía fail-closed en producción y cifrado en reposo de secretos TOTP', async () => {
  await withEnv(
    {
      NODE_ENV: 'production',
      MASTER_ENCRYPTION_KEY_V1: undefined,
      APP_ENCRYPTION_KEY: undefined,
      JWT_ACCESS_SECRET: undefined,
      JWT_SECRET: undefined,
      SYSTEM_SIGNING_SECRET: undefined,
      SYSTEM_SIGNING_PRIVATE_KEY: undefined,
      SYSTEM_SIGNING_PUBLIC_KEY: undefined,
      ARCA_KEY_BASE64: undefined,
      ARCA_CERT_BASE64: undefined
    },
    async () => {
      const aesProvider = new AesGcmEncryptionProvider();
      await assert.rejects(
        () => aesProvider.encrypt('my-secret-value'),
        /producción/i
      );

      assert.throws(() => new SnapshotCryptoService(), /producción|secret/i);
    }
  );

  // Cifrado y descifrado TOTP at-rest con clave válida en contexto aad
  await withEnv(
    {
      NODE_ENV: 'test',
      MASTER_ENCRYPTION_KEY_V1: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    },
    async () => {
      const repo = new UserRepository();
      const plainTotp = 'KRSXG5CTMVRXEZLU';
      const encrypted = await repo._encryptTotpSecret(plainTotp, 'user-totp-42');
      assert.ok(encrypted.startsWith('enc:v1:'));
      assert.equal(encrypted.includes(plainTotp), false);

      const decryptedSameUser = repo._decryptTotpSecretSync(encrypted, 'user-totp-42');
      assert.equal(decryptedSameUser, plainTotp);

      // AAD distinto no debe descifrar
      const decryptedWrongUser = repo._decryptTotpSecretSync(encrypted, 'other-user');
      assert.equal(decryptedWrongUser, null);
    }
  );
});
