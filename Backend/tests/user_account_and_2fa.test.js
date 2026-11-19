const test = require('node:test');
const assert = require('node:assert/strict');
const TwoFactorAuthService = require('../src/application/security/TwoFactorAuthService');
const JWTService = require('../src/infrastructure/auth/services/JWTService');
const { parseClientName, getClientDetails } = require('../src/infrastructure/auth/utils/clientInfo');

test('ClientInfo: parseClientName reconoce navegadores y sistemas operativos', () => {
  const chromeWindows = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
  assert.equal(parseClientName(chromeWindows), 'Google Chrome en Windows');

  const safariIphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  assert.equal(parseClientName(safariIphone), 'Apple Safari en iPhone');

  const firefoxLinux = 'Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0';
  assert.equal(parseClientName(firefoxLinux), 'Mozilla Firefox en Linux');
});

test('TwoFactorAuthService: genera secreto TOTP y valida códigos generados', async () => {
  const service = new TwoFactorAuthService();
  const setup = await service.generateTotpSetup({ userMail: 'test@ctmueble.com.ar' });

  assert.ok(setup.secret, 'Debe generar secreto Base32');
  assert.ok(setup.otpauthUrl.includes('test%40ctmueble.com.ar') || setup.otpauthUrl.includes('test@ctmueble.com.ar'), 'Debe incluir mail en otpauth URL');
  assert.ok(setup.qrCode.startsWith('data:image/png;base64,'), 'Debe generar QR en base64');

  // Generar código con el servicio para el secreto
  const validCode = service.generateTotp({ secret: setup.secret });

  assert.equal(service.verifyTotp({ token: validCode, secret: setup.secret }), true, 'Debe validar código correcto');
  assert.equal(service.verifyTotp({ token: '000000', secret: setup.secret }), false, 'Debe rechazar código inválido');
  assert.equal(service.verifyTotp({ token: 'abc', secret: setup.secret }), false, 'Debe rechazar formato no numérico');
});

test('totp: cumple vectores de prueba oficiales RFC 6238 y RFC 4648', () => {
  const {
    base32Encode,
    base32Decode,
    generateTotp,
    verifyTotp
  } = require('../src/application/security/totp');

  // RFC 4648 Base32 test vectors
  assert.equal(base32Encode(Buffer.from('', 'utf8')), '');
  assert.equal(base32Encode(Buffer.from('f', 'utf8')), 'MY');
  assert.equal(base32Encode(Buffer.from('fo', 'utf8')), 'MZXQ');
  assert.equal(base32Encode(Buffer.from('foo', 'utf8')), 'MZXW6');
  assert.equal(base32Encode(Buffer.from('foob', 'utf8')), 'MZXW6YQ');
  assert.equal(base32Encode(Buffer.from('fooba', 'utf8')), 'MZXW6YTB');
  assert.equal(base32Encode(Buffer.from('foobar', 'utf8')), 'MZXW6YTBOI');

  assert.equal(base32Decode('MZXW6YTBOI').toString('utf8'), 'foobar');
  assert.equal(base32Decode('MZXW6YTBOI======').toString('utf8'), 'foobar');

  // RFC 6238 TOTP official test vectors (ASCII '12345678901234567890')
  const secretAscii = Buffer.from('12345678901234567890', 'ascii');
  assert.equal(generateTotp(secretAscii, 59 * 1000), '287082');
  assert.equal(generateTotp(secretAscii, 1111111109 * 1000), '081804');
  assert.equal(generateTotp(secretAscii, 1111111111 * 1000), '050471');
  assert.equal(generateTotp(secretAscii, 1234567890 * 1000), '005924');
  assert.equal(generateTotp(secretAscii, 2000000000 * 1000), '279037');

  // Tolerancia de ventana +/- 1 paso de 30s
  const baseTime = 1234567890 * 1000;
  const tokenPast = generateTotp(secretAscii, baseTime - 30 * 1000);
  const tokenFuture = generateTotp(secretAscii, baseTime + 30 * 1000);
  const tokenFar = generateTotp(secretAscii, baseTime + 90 * 1000);

  assert.equal(verifyTotp(tokenPast, secretAscii, { time: baseTime }), true, 'Debe aceptar ventana previa');
  assert.equal(verifyTotp(tokenFuture, secretAscii, { time: baseTime }), true, 'Debe aceptar ventana futura');
  assert.equal(verifyTotp(tokenFar, secretAscii, { time: baseTime }), false, 'Debe rechazar fuera de ventana');
});

test('JWTService: emite y valida tokens temporales de desafío 2FA', () => {
  const payload = { id: 'usr-123', mail: 'test@ctmueble.com.ar', method: 'TOTP' };
  const tempToken = JWTService.sign2FATempToken(payload);

  assert.ok(tempToken, 'Debe emitir token');
  const decoded = JWTService.verify2FATempToken(tempToken);

  assert.equal(decoded.id, 'usr-123');
  assert.equal(decoded.typ, '2fa_temp');
  assert.equal(decoded.method, 'TOTP');

  // Un token de acceso normal no debe pasar por verify2FATempToken
  const access = JWTService.signAccessToken({ id: 'usr-123' });
  assert.throws(() => {
    JWTService.verify2FATempToken(access);
  }, /Tipo de token inválido para verificación 2FA/);
});

test('RecoveryCodeService: normaliza y genera códigos con formato legible', () => {
  const RecoveryCodeService = require('../src/infrastructure/auth/services/RecoveryCodeService');
  const service = new RecoveryCodeService();

  assert.equal(service._normalize('1234-abcd'), '1234ABCD');
  assert.equal(service._normalize(' ab12 - cd34 '), 'AB12CD34');
});

