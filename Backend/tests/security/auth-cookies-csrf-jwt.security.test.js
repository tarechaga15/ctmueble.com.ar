const test = require('node:test');
const assert = require('node:assert/strict');

const jwtService = require('../../src/infrastructure/auth/services/JWTService');
const SessionRevocationService = require('../../src/infrastructure/auth/services/SessionRevocationService');
const AuthTokensDTO = require('../../src/application/auth/dto/AuthTokensDTO');
const {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  setAuthCookies
} = require('../../src/presentation/utils/authCookies');
const { verifyCsrf } = require('../../src/presentation/middlewares/csrf');
const verifyJWT = require('../../src/presentation/middlewares/jwt.verify');
const { createMockRes, createNextSpy } = require('../contracts/helpers');

function withEnv(overrides, fn) {
  const previous = {};
  for (const key of Object.keys(overrides)) {
    previous[key] = process.env[key];
    if (overrides[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = overrides[key];
    }
  }
  const restore = () => {
    for (const key of Object.keys(overrides)) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  };
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      return res.finally(restore);
    }
    restore();
    return res;
  } catch (err) {
    restore();
    throw err;
  }
}

test('JWTService separa claves de access y refresh e impide confusión de tipo de token', () => {
  withEnv(
    {
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: 'a'.repeat(64),
      JWT_REFRESH_SECRET: 'b'.repeat(64)
    },
    () => {
      const pair = jwtService.generateTokens({
        access: { id: 'user-123', profile: 'CLIENT' },
        refresh: { id: 'user-123' }
      });

      const decodedAccess = jwtService.verifyAccessToken(pair.access_token);
      const decodedRefresh = jwtService.verifyRefreshToken(pair.refresh_token);

      assert.equal(decodedAccess.id, 'user-123');
      assert.equal(decodedAccess.typ, 'access');
      assert.equal(decodedRefresh.typ, 'refresh');
      assert.equal(decodedAccess.sid, decodedRefresh.sid);

      // Un refresh token jamás puede validarse como access token ni viceversa
      assert.throws(() => jwtService.verifyAccessToken(pair.refresh_token));
      assert.throws(() => jwtService.verifyRefreshToken(pair.access_token));
    }
  );
});

test('JWTService falla cerrado en producción si faltan secretos separados o si son idénticos', () => {
  withEnv(
    {
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: undefined,
      JWT_REFRESH_SECRET: undefined,
      JWT_SECRET: 'legacy-secret'
    },
    () => {
      assert.throws(
        () => jwtService.signAccessToken({ id: 'u1' }),
        /JWT_ACCESS_SECRET y JWT_REFRESH_SECRET/
      );
    }
  );

  withEnv(
    {
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: 'same-secret-value-12345678901234567890',
      JWT_REFRESH_SECRET: 'same-secret-value-12345678901234567890'
    },
    () => {
      assert.throws(
        () => jwtService.signAccessToken({ id: 'u1' }),
        /estrictamente distintos/
      );
    }
  );
});

test('SessionRevocationService detecta reúso de refresh token y revoca toda la sesión (sid)', async () => {
  const revSvc = new SessionRevocationService({ redisClient: { isConfigured: () => false } });
  const sid = 'session-family-1';
  const rtJti = 'rt-jti-1';
  const childAccessJti = 'at-jti-2';

  const firstUse = await revSvc.consumeRefreshToken(rtJti, sid, 3600);
  assert.equal(firstUse, true);
  assert.equal(await revSvc.isRevoked(childAccessJti, sid), false);

  // Segundo intento con el mismo refresh token -> ataque de replay detectado -> revoca sid completo
  const replayUse = await revSvc.consumeRefreshToken(rtJti, sid, 3600);
  assert.equal(replayUse, false);
  assert.equal(await revSvc.isRevoked(childAccessJti, sid), true);
});

test('Modo dual Auth: oculta tokens en JSON y bloquea Authorization Bearer en producción, manteniéndolos en development', async () => {
  const dto = new AuthTokensDTO({
    accessToken: 'at-raw',
    refreshToken: 'rt-raw',
    sessionId: 'sid-1',
    user: { id: 'u1', mail: 'lab@ctm.ar', profile: 'LABORATORY' }
  });

  const prodJson = dto.toJSON({ includeTokens: false, csrfToken: 'csrf-123' });
  assert.equal(prodJson.access_token, undefined);
  assert.equal(prodJson.refresh_token, undefined);
  assert.equal(prodJson.csrf_token, 'csrf-123');

  const devJson = dto.toJSON({ includeTokens: true, csrfToken: 'csrf-123' });
  assert.equal(devJson.access_token, 'at-raw');
  assert.equal(devJson.refresh_token, 'rt-raw');

  await withEnv(
    {
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: 'c'.repeat(64),
      JWT_REFRESH_SECRET: 'd'.repeat(64)
    },
    async () => {
      const validBearer = jwtService.signAccessToken({ id: 'u1' });
      const req = {
        headers: { authorization: `Bearer ${validBearer}` },
        cookies: {},
        method: 'GET',
        originalUrl: '/clients/fetch'
      };
      const res = createMockRes();
      const next = createNextSpy();

      await verifyJWT(req, res, next);
      assert.equal(next.called, false);
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.code, 'TOKEN_REQUIRED');
    }
  );
});

test('setAuthCookies y verifyCsrf aplican Double-Submit Cookie + validación de Origin en sesiones por cookie', () => {
  withEnv({ NODE_ENV: 'production', COOKIE_SAME_SITE: 'lax' }, () => {
    const cookiesRecorded = [];
    const mockRes = {
      headers: {},
      cookie(name, val, opts) {
        cookiesRecorded.push({ name, val, opts });
      },
      setHeader(k, v) {
        this.headers[k] = v;
      }
    };

    const csrfToken = setAuthCookies(mockRes, {
      accessToken: 'at-cookie',
      refreshToken: 'rt-cookie'
    });

    const atCookie = cookiesRecorded.find((c) => c.name === ACCESS_COOKIE_NAME);
    const rtCookie = cookiesRecorded.find((c) => c.name === REFRESH_COOKIE_NAME);
    const csrfCookie = cookiesRecorded.find((c) => c.name === CSRF_COOKIE_NAME);

    assert.equal(atCookie.opts.httpOnly, true);
    assert.equal(atCookie.opts.secure, true);
    assert.equal(atCookie.opts.path, '/');
    assert.equal(rtCookie.opts.httpOnly, true);
    assert.equal(rtCookie.opts.path, '/auth');
    assert.equal(csrfCookie.opts.httpOnly, false);

    // 1. Mutación autenticada por cookie SIN header X-CSRF-Token -> 403
    const reqMissingCsrf = {
      method: 'POST',
      authSource: 'cookie',
      headers: { origin: 'https://oficina.ctmueble.com.ar' },
      cookies: { [CSRF_COOKIE_NAME]: csrfToken }
    };
    const resMissing = createMockRes();
    const nextMissing = createNextSpy();
    verifyCsrf(reqMissingCsrf, resMissing, nextMissing);
    assert.equal(nextMissing.called, false);
    assert.equal(resMissing.statusCode, 403);
    assert.equal(resMissing.body.code, 'CSRF_TOKEN_INVALID');

    // 2. Mutación con Origin malicioso -> 403
    const reqBadOrigin = {
      method: 'POST',
      authSource: 'cookie',
      headers: {
        origin: 'https://evil-attacker.example',
        'x-csrf-token': csrfToken
      },
      cookies: { [CSRF_COOKIE_NAME]: csrfToken }
    };
    const resBadOrigin = createMockRes();
    const nextBadOrigin = createNextSpy();
    verifyCsrf(reqBadOrigin, resBadOrigin, nextBadOrigin);
    assert.equal(nextBadOrigin.called, false);
    assert.equal(resBadOrigin.statusCode, 403);
    assert.equal(resBadOrigin.body.code, 'CSRF_ORIGIN_FORBIDDEN');

    // 3. Mutación legítima con cookie + header coincidente + Origin permitido -> pasa
    const reqValid = {
      method: 'POST',
      authSource: 'cookie',
      headers: {
        origin: 'https://oficina.ctmueble.com.ar',
        'x-csrf-token': csrfToken
      },
      cookies: { [CSRF_COOKIE_NAME]: csrfToken }
    };
    const resValid = createMockRes();
    const nextValid = createNextSpy();
    verifyCsrf(reqValid, resValid, nextValid);
    assert.equal(nextValid.called, true);

    // 4. En development con Authorization: Bearer (authSource='header') no exige cookie CSRF
    const reqHeaderAuth = {
      method: 'POST',
      authSource: 'header',
      headers: {},
      cookies: {}
    };
    const resHeader = createMockRes();
    const nextHeader = createNextSpy();
    verifyCsrf(reqHeaderAuth, resHeader, nextHeader);
    assert.equal(nextHeader.called, true);
  });
});
