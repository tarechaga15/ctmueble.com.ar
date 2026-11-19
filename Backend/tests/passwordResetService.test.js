const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const PasswordResetService = require('../src/application/security/PasswordResetService');

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function createInMemoryModel() {
  const records = [];
  return {
    records,
    async destroy({ where }) {
      for (let i = records.length - 1; i >= 0; i -= 1) {
        const r = records[i];
        const matchMail = where.mail ? r.mail === where.mail : true;
        const matchUsed = where.used_at === null ? r.used_at === null : true;
        if (matchMail && matchUsed) {
          records.splice(i, 1);
        }
      }
    },
    async create(data) {
      const record = {
        id: crypto.randomUUID(),
        ...data,
        used_at: null,
        created_at: new Date(),
        async update(patch) {
          Object.assign(this, patch);
          return this;
        }
      };
      records.push(record);
      return record;
    },
    async findOne({ where }) {
      const matches = records.filter((r) => {
        if (where.token_hash && r.token_hash !== where.token_hash) return false;
        if (where.mail && r.mail !== where.mail) return false;
        if (where.used_at === null && r.used_at !== null) return false;
        return true;
      });
      matches.sort((a, b) => b.created_at - a.created_at);
      return matches[0] || null;
    }
  };
}

test('PasswordResetService: requestPasswordReset responde genérico si el usuario no existe (anti-enumeración)', async () => {
  const model = createInMemoryModel();
  let emailSent = false;

  const service = new PasswordResetService({
    model,
    mailingService: {
      isConfigured: async () => true,
      sendPasswordResetEmail: async () => {
        emailSent = true;
      }
    },
    userRepository: {
      findByMail: async () => null
    }
  });

  const res = await service.requestPasswordReset({ mail: 'noexiste@ctm.com.ar' });
  assert.equal(res.success, true);
  assert.equal(emailSent, false);
  assert.equal(model.records.length, 0);
});

test('PasswordResetService: requestPasswordReset falla si mailing no está configurado', async () => {
  const service = new PasswordResetService({
    model: createInMemoryModel(),
    mailingService: { isConfigured: async () => false },
    userRepository: { findByMail: async () => null }
  });

  await assert.rejects(
    () => service.requestPasswordReset({ mail: 'user@ctm.com.ar' }),
    (err) => err.code === 'MAILING_NOT_CONFIGURED' && err.statusCode === 503
  );
});

test('PasswordResetService: flujo completo con OTP y token', async () => {
  const model = createInMemoryModel();
  let sentPayload = null;
  let updatedUserId = null;
  let updatedHash = null;

  const service = new PasswordResetService({
    model,
    mailingService: {
      isConfigured: async () => true,
      sendPasswordResetEmail: async (payload) => {
        sentPayload = payload;
      }
    },
    userRepository: {
      findByMail: async (mail) => ({ id: 'user-123', mail, name: 'Tomás' }),
      updatePassword: async (userId, passwordHash) => {
        updatedUserId = userId;
        updatedHash = passwordHash;
      }
    },
    passwordHasher: {
      hash: async (plain) => `hashed:${plain}`,
      compare: async (plain, hash) => hash === `hashed:${plain}`
    }
  });

  const reqRes = await service.requestPasswordReset({ mail: 'Tomas@CTM.com.ar' });
  assert.equal(reqRes.success, true);
  assert.ok(sentPayload);
  assert.equal(sentPayload.to, 'tomas@ctm.com.ar');
  assert.match(sentPayload.otpCode, /^\d{6}$/);
  assert.equal(sentPayload.resetToken.length, 64);

  // Verificar código OTP sin consumirlo
  const verifyRes = await service.verifyResetCode({
    mail: 'tomas@ctm.com.ar',
    otpCode: sentPayload.otpCode
  });
  assert.equal(verifyRes.valid, true);
  assert.equal(verifyRes.mail, 'tomas@ctm.com.ar');

  // Restablecer contraseña usando el token
  const resetRes = await service.resetPassword({
    token: sentPayload.resetToken,
    newPassword: 'NuevaPasswordSegura2026!'
  });
  assert.equal(resetRes.success, true);
  assert.equal(updatedUserId, 'user-123');
  assert.equal(updatedHash, 'hashed:NuevaPasswordSegura2026!');

  // No debe permitir reutilizar el mismo token
  await assert.rejects(
    () =>
      service.resetPassword({
        token: sentPayload.resetToken,
        newPassword: 'OtraPasswordSegura2026!'
      }),
    (err) => err.code === 'INVALID_RESET_CODE'
  );
});

test('PasswordResetService: rechaza contraseñas débiles y bloquea tras 5 intentos fallidos', async () => {
  const model = createInMemoryModel();
  const otp = '123456';
  await model.create({
    user_id: 'user-1',
    mail: 'test@ctm.com.ar',
    otp_code_hash: sha256(otp),
    token_hash: sha256('token-abc'),
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0
  });

  const service = new PasswordResetService({
    model,
    mailingService: { isConfigured: async () => true },
    userRepository: { updatePassword: async () => {} }
  });

  // Contraseña débil (< 12 caracteres)
  await assert.rejects(
    () =>
      service.resetPassword({
        mail: 'test@ctm.com.ar',
        otpCode: otp,
        newPassword: 'corta'
      }),
    (err) => err.code === 'WEAK_PASSWORD'
  );

  // 5 intentos fallidos
  for (let i = 0; i < 5; i += 1) {
    await assert.rejects(
      () =>
        service.verifyResetCode({
          mail: 'test@ctm.com.ar',
          otpCode: '000000'
        }),
      (err) => err.code === 'INVALID_RESET_CODE'
    );
  }

  // 6to intento bloqueado aunque sea correcto
  await assert.rejects(
    () =>
      service.verifyResetCode({
        mail: 'test@ctm.com.ar',
        otpCode: otp
      }),
    (err) => err.code === 'TOO_MANY_ATTEMPTS' && err.statusCode === 429
  );
});
