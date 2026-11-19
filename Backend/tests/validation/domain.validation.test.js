const test = require('node:test');
const assert = require('node:assert/strict');

const Person = require('../../src/domain/persons/entities/Person');
const Client = require('../../src/domain/clients/entities/Client');

function buildValidPerson(overrides = {}) {
  return new Person({
    id: 'p1',
    name: 'Juan Perez',
    dni: '30111222',
    address: 'Calle 123',
    phone: '1144556677',
    mail: 'juan@ctm.com',
    country_code: '54',
    location: 'Rosario',
    district: 'AR-S',
    country: 'AR',
    userId: 'user-1',
    origin: 'CLIENT',
    isThirdParty: false,
    ...overrides
  });
}

function buildValidClient(overrides = {}) {
  return new Client({
    id: 'c1',
    cuit: '30712345678',
    name: 'Empresa SA',
    address: 'addr-1',
    representative: 'rep-1',
    contact: 'contact-1',
    origin: 'CLIENT',
    userId: 'user-1',
    billing: {
      cuit: '30712345678',
      address: 'Fact 123',
      location: 'CABA',
      province: 'CABA',
      paysIva: true
    },
    ...overrides
  });
}

test('Person valida formato de mail, teléfono y código de país', () => {
  assert.throws(() => buildValidPerson({ mail: 'mail-invalido' }).validate(), /formato del mail/);
  assert.throws(() => buildValidPerson({ phone: 'ABCD' }).validate(), /formato del teléfono/);
  assert.throws(() => buildValidPerson({ country_code: '54A' }).validate(), /código de país/);
  assert.doesNotThrow(() => buildValidPerson().validate());
});

test('Person exige campos obligatorios de restricciones', () => {
  assert.throws(() => buildValidPerson({ name: '' }).validate(), /nombre es requerido/);
  assert.throws(() => buildValidPerson({ userId: '' }).validate(), /usuario es requerido/);
  assert.throws(() => buildValidPerson({ origin: '' }).validate(), /origen es requerido/);
});

test('Client valida formato de cuit y campos obligatorios', () => {
  assert.throws(() => buildValidClient({ cuit: '123' }).validate(), /CUIT es requerido/);
  assert.throws(() => buildValidClient({ address: '' }).validate(), /dirección es requerida/);
  assert.throws(() => buildValidClient({ representative: '' }).validate(), /representante es requerido/);
  assert.throws(() => buildValidClient({ contact: '' }).validate(), /contacto es requerido/);
  assert.doesNotThrow(() => buildValidClient().validate());
});

test('Client valida restricciones de facturación cuando se informa', () => {
  assert.throws(
    () => buildValidClient({ billing: { cuit: '30A12345678' } }).validate(),
    /CUIT de facturación/
  );
  assert.throws(
    () => buildValidClient({ billing: { cuit: '30712345678', address: '' } }).validate(),
    /dirección de facturación/
  );
  assert.throws(
    () => buildValidClient({ billing: { cuit: '30712345678', address: 'x', location: '' } }).validate(),
    /localidad de facturación/
  );
  assert.throws(
    () => buildValidClient({ billing: { cuit: '30712345678', address: 'x', location: 'y', province: '' } }).validate(),
    /provincia de facturación/
  );
});

