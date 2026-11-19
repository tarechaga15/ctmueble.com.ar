const test = require('node:test');
const assert = require('node:assert/strict');

const CreateClientDTO = require('../../src/application/clients/dto/CreateClientDTO');
const UpdateClientDTO = require('../../src/application/clients/dto/UpdateClientDTO');
const CreatePersonDTO = require('../../src/application/persons/dto/CreatePersonDTO');
const UpdatePersonDTO = require('../../src/application/persons/dto/UpdatePersonDTO');
const CreateEssayDTO = require('../../src/application/essays/dto/CreateEssayDTO');
const LoadSampleResultsDTO = require('../../src/application/essays/dto/LoadSampleResultsDTO');
const ReceiveSamplesDTO = require('../../src/application/essays/dto/ReceiveSamplesDTO');

test('CreateClientDTO valida campos obligatorios', () => {
  assert.throws(() => new CreateClientDTO({}).validate(), /El CUIT es requerido/);
  assert.throws(() => new CreateClientDTO({ cuit: '30712345678' }).validate(), /La dirección es requerida/);
  assert.throws(
    () => new CreateClientDTO({ cuit: '30712345678', address: 'addr-1' }).validate(),
    /El representante \(UUID\) es requerido/
  );
  assert.throws(
    () => new CreateClientDTO({ cuit: '30712345678', address: 'addr-1', representative: 'rep-1' }).validate(),
    /La facturación es requerida/
  );
});

test('CreateClientDTO acepta payload válido', () => {
  const dto = new CreateClientDTO({
    cuit: '30712345678',
    address: 'addr-1',
    representative: 'rep-1',
    contact: 'contact-1',
    billing: { cuit: '30712345678', address: 'Fact 123', location: 'CABA', province: 'CABA', paysIva: true }
  });
  assert.doesNotThrow(() => dto.validate());
  assert.equal(dto.toPlainObject().cuit, '30712345678');
});

test('UpdateClientDTO exige al menos un campo y tipos correctos', () => {
  assert.throws(() => new UpdateClientDTO({}).validate(), /Debe proporcionar al menos un campo/);
  assert.throws(() => new UpdateClientDTO({ representative: 123 }).validate(), /representante debe ser un UUID/);
  assert.throws(() => new UpdateClientDTO({ contact: 123 }).validate(), /contacto debe ser un UUID/);
  assert.doesNotThrow(() => new UpdateClientDTO({ representative: null }).validate());
  assert.doesNotThrow(() => new UpdateClientDTO({ address: 'addr-2' }).validate());
});

test('CreatePersonDTO exige nombre', () => {
  assert.throws(() => new CreatePersonDTO({}).validate(), /nombre de la persona es requerido/);
  assert.doesNotThrow(() => new CreatePersonDTO({ name: 'Juan Perez' }).validate());
});

test('UpdatePersonDTO exige al menos un campo', () => {
  assert.throws(() => new UpdatePersonDTO({}).validate(), /al menos un campo/);
  assert.doesNotThrow(() => new UpdatePersonDTO({ mail: 'test@mail.com' }).validate());
});

test('CreateEssayDTO valida campos obligatorios y estructura de elements', () => {
  assert.throws(() => new CreateEssayDTO({}).validate(), /cliente es requerido/);
  assert.throws(() => new CreateEssayDTO({ client: 'c1' }).validate(), /tipo de ensayo es requerido/);
  assert.throws(() => new CreateEssayDTO({ client: 'c1', essay: 'e1' }).validate(), /elementos del ensayo son requeridos/);
  assert.throws(
    () => new CreateEssayDTO({ client: 'c1', essay: 'e1', elements: {} }).validate(),
    /ID de la plantilla de elemento/
  );
  assert.throws(
    () => new CreateEssayDTO({ client: 'c1', essay: 'e1', elements: { id: 'tpl-1' } }).validate(),
    /fecha de elementos es requerida/
  );
  assert.doesNotThrow(() =>
    new CreateEssayDTO({
      client: 'c1',
      essay: 'e1',
      elements: { id: 'tpl-1', date: '2026-04-28' },
      billing: {}
    }).validate()
  );
  assert.doesNotThrow(() =>
    new CreateEssayDTO({
      isSelf: true,
      essay: 'e1',
      elements: { id: 'tpl-1', date: '2026-04-28' },
      billing: {}
    }).validate()
  );
});

test('LoadSampleResultsDTO valida workOrderId, muestras y formato de resultados', () => {
  assert.throws(() => new LoadSampleResultsDTO({ samples: [{ id: 's1', result: 10 }] }).validate(), /workOrderId/);
  assert.throws(() => new LoadSampleResultsDTO({ workOrderId: 'wo-1', samples: [] }).validate(), /al menos una muestra/);
  assert.throws(
    () => new LoadSampleResultsDTO({ workOrderId: 'wo-1', samples: [{ result: 10 }] }).validate(),
    /Falta el ID de la muestra/
  );
  assert.throws(
    () => new LoadSampleResultsDTO({ workOrderId: 'wo-1', samples: [{ id: 's1', result: 'abc' }] }).validate(),
    /debe ser un número válido o null/
  );
  assert.doesNotThrow(() =>
    new LoadSampleResultsDTO({ workOrderId: 'wo-1', samples: [{ id: 's1', result: '10.5' }] }).validate()
  );
});

test('ReceiveSamplesDTO valida reglas de recepción', () => {
  assert.throws(() => new ReceiveSamplesDTO({ accepted: true }).validate(), /essayId es requerido/);
  assert.throws(
    () => new ReceiveSamplesDTO({ essayId: 'e1', accepted: true, samples_count: 0, countersamples_count: 0 }).validate(),
    /al menos una muestra o una contramuestra/
  );
  assert.throws(
    () => new ReceiveSamplesDTO({ essayId: 'e1', accepted: true, samples_count: -1, countersamples_count: 1 }).validate(),
    /deben ser mayor o igual a 0/
  );
  assert.doesNotThrow(
    () => new ReceiveSamplesDTO({ essayId: 'e1', accepted: true, samples_count: 1, countersamples_count: 0 }).validate()
  );
  assert.doesNotThrow(() => new ReceiveSamplesDTO({ essayId: 'e1', accepted: false }).validate());
});

