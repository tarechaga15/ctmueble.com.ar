/**
 * Implementación del repositorio de muestras usando Sequelize.
 * Convierte entre modelos de Sequelize y entidades de dominio.
 */
const ISampleRepository = require('../../../domain/essays/repositories/ISampleRepository');
const Sample = require('../../../domain/essays/entities/Sample');
const SampleStatus = require('../../../domain/essays/value-objects/SampleStatus');
const SampleService = require('../../../domain/essays/services/SampleService');
const { Sample: SampleModel } = require('../../models');
const { getUuidV4 } = require('../../../shared/uuid');

const sampleCodeService = new SampleService();

class SampleRepository extends ISampleRepository {
  constructor({ transaction } = {}) {
    super();
    this.transaction = transaction || null;
  }

  setTransaction(transaction) {
    this.transaction = transaction || null;
  }

  async findById(id) {
    const options = { where: { id } };
    if (this.transaction) options.transaction = this.transaction;
    const sampleData = await SampleModel.findOne(options);

    if (!sampleData) return null;

    return this.mapToDomain(sampleData);
  }

  async findByEssayId(essayId) {
    const options = {
      where: { essay: essayId },
      order: [['correlative', 'ASC'], ['countersample', 'ASC']]
    };
    if (this.transaction) options.transaction = this.transaction;
    const samplesData = await SampleModel.findAll(options);

    return samplesData.map((sample) => this.mapToDomain(sample));
  }

  async findByWorkOrderId(workOrderId) {
    const options = {
      where: { work_order: workOrderId },
      order: [['countersample', 'ASC'], ['correlative', 'ASC']]
    };
    if (this.transaction) options.transaction = this.transaction;
    const samplesData = await SampleModel.findAll(options);
    return samplesData.map((sample) => this.mapToDomain(sample));
  }

  async findByEssayAndDateCode(essayId, dateCode, isCountersample) {
    const options = {
      where: {
        essay: essayId,
        date_code: dateCode,
        countersample: isCountersample
      },
      order: [['correlative', 'ASC']]
    };
    if (this.transaction) {
      options.transaction = this.transaction;
    }

    const samplesData = await SampleModel.findAll(options);
    return samplesData.map((sample) => this.mapToDomain(sample));
  }

  async save(sample) {
    if (!sample.id) {
      sample.id = await getUuidV4();
    }

    const options = this.transaction ? { transaction: this.transaction } : {};
    const sampleData = await SampleModel.create(
      {
        id: sample.id,
        essay: sample.essayId,
        work_order: sample.workOrderId,
        status: sample.status?.value || sample.status,
        date_code: sample.dateCode || null,
        correlative: sample.correlative,
        countersample: sample.countersample,
        received_at: sample.receivedAt,
        accepted: sample.accepted,
        internal_conditioning: sample.internalConditioning,
        observations: sample.observations,
        result: sample.result,
        height: sample.height,
        width: sample.width,
        thickness: sample.thickness
      },
      options
    );

    return this.mapToDomain(sampleData);
  }

  /**
   * Guarda múltiples muestras en un único `bulkCreate` SQL para minimizar latencia con Neon.
   */
  async saveMany(samples) {
    if (!Array.isArray(samples) || samples.length === 0) return [];
    const records = [];
    for (const sample of samples) {
      if (!sample.id) {
        sample.id = await getUuidV4();
      }
      records.push({
        id: sample.id,
        essay: sample.essayId,
        work_order: sample.workOrderId,
        status: sample.status?.value || sample.status,
        date_code: sample.dateCode || null,
        correlative: sample.correlative,
        countersample: sample.countersample,
        received_at: sample.receivedAt,
        accepted: sample.accepted,
        internal_conditioning: sample.internalConditioning,
        observations: sample.observations,
        result: sample.result,
        height: sample.height,
        width: sample.width,
        thickness: sample.thickness
      });
    }

    const options = { validate: true };
    if (this.transaction) options.transaction = this.transaction;

    const createdRows = await SampleModel.bulkCreate(records, options);
    return createdRows.map((row) => this.mapToDomain(row));
  }

  async update(sample) {
    const options = {
      where: { id: sample.id }
    };
    if (this.transaction) {
      options.transaction = this.transaction;
    }

    await SampleModel.update(
      {
        status: sample.status?.value || sample.status,
        date_code: sample.dateCode,
        correlative: sample.correlative,
        countersample: sample.countersample,
        received_at: sample.receivedAt,
        accepted: sample.accepted,
        internal_conditioning: sample.internalConditioning,
        observations: sample.observations,
        result: sample.result,
        height: sample.height,
        width: sample.width,
        thickness: sample.thickness
      },
      options
    );

    return this.findById(sample.id);
  }

  async delete(id) {
    const options = { where: { id } };
    if (this.transaction) options.transaction = this.transaction;
    await SampleModel.destroy(options);
  }

  mapToDomain(sampleData) {
    const data = sampleData.toJSON ? sampleData.toJSON() : sampleData;
    const formattedCode = data.date_code
      ? sampleCodeService.generateSampleCode(data.date_code, data.correlative, data.countersample)
      : null;

    return new Sample({
      id: data.id,
      essayId: data.essay,
      workOrderId: data.work_order,
      status: new SampleStatus(data.status),
      code: formattedCode,
      dateCode: data.date_code,
      correlative: data.correlative,
      countersample: data.countersample,
      receivedAt: data.received_at,
      accepted: data.accepted,
      internalConditioning: data.internal_conditioning,
      observations: data.observations,
      result: data.result != null ? parseFloat(data.result) : null,
      height: data.height != null ? Math.round(parseFloat(data.height) * 10) / 10 : null,
      width: data.width != null ? Math.round(parseFloat(data.width) * 10) / 10 : null,
      thickness: data.thickness != null ? Math.round(parseFloat(data.thickness) * 10) / 10 : null
    });
  }
}

module.exports = SampleRepository;
