/**
 * Repositorio de órdenes de trabajo (work_orders).
 * code: yymmdd + letra(s) (A, B, C...); essay_track_code = código del ensayo; internal_aconditioning.
 */
const WorkOrderEntity = require('../../../domain/essays/entities/WorkOrder');
const { sequelize, WorkOrder: WorkOrderModel } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const { escapeLike, sequenceNumberToLetters } = require('../../../shared/sqlLike');

class WorkOrderRepository {
  constructor({ transaction } = {}) {
    this.transaction = transaction || null;
  }

  setTransaction(transaction) {
    this.transaction = transaction || null;
  }

  mapToDomain(row) {
    if (!row) return null;
    return new WorkOrderEntity({
      id: row.id,
      essayId: row.essay_id,
      code: row.code,
      essayTrackCode: row.essay_track_code ?? null,
      reportDeliveryDeadline: row.report_delivery_deadline ?? null,
      samplesReceivedAt: row.samples_received_at ?? null,
      sampleDimensions: row.sample_dimensions ?? null,
      sampleWidth: row.sample_width,
      sampleHeight: row.sample_height,
      sampleThickness: row.sample_thickness,
      generatedAt: row.generated_at ?? null,
      observations: row.observations ?? null,
      internalAconditioning: row.internal_aconditioning === true,
      uncertainty: row.uncertainty ?? null,
      averageValue: row.average_value,
      status: row.status ?? null,
      closedAt: row.closed_at ?? null,
      lastUpdate: row.last_update ?? null
    });
  }

  async create(data) {
    const options = this.transaction ? { transaction: this.transaction } : {};
    const row = await WorkOrderModel.create(
      {
        essay_id: data.essay_id,
        code: data.code,
        essay_track_code: data.essay_track_code ?? null,
        report_delivery_deadline: data.report_delivery_deadline || null,
        samples_received_at: data.samples_received_at || null,
        sample_dimensions: data.sample_dimensions || null,
        sample_width: data.sample_width != null ? data.sample_width : null,
        sample_height: data.sample_height != null ? data.sample_height : null,
        sample_thickness: data.sample_thickness != null ? data.sample_thickness : null,
        generated_at: data.generated_at || new Date(),
        observations: data.observations || null,
        internal_aconditioning: data.internal_aconditioning === true,
        uncertainty: data.uncertainty ?? null,
        average_value: data.average_value != null ? data.average_value : null,
        status: data.status || 'ANALYZING'
      },
      options
    );
    const plain = row.get ? row.get({ plain: true }) : row;
    return this.mapToDomain(plain);
  }

  /**
   * Genera de forma atómica el siguiente código de orden para la fecha dada: yymmdd + letra(s).
   */
  async getNextWorkOrderCodeForDate(date) {
    const y = String(date.getFullYear()).slice(-2);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const prefix = `${y}${m}${d}`;
    const safePrefixLike = `${escapeLike(prefix)}%`;
    const queryOpts = this.transaction ? { transaction: this.transaction } : {};

    try {
      const [counterRow] = await sequelize.query(
        `INSERT INTO daily_sequence_counters (scope, date_key, last_value)
         VALUES ('work_order', :prefix, 1)
         ON CONFLICT (scope, date_key)
         DO UPDATE SET last_value = daily_sequence_counters.last_value + 1
         RETURNING last_value`,
        {
          ...queryOpts,
          replacements: { prefix },
          type: QueryTypes.SELECT
        }
      );

      let seq = Number(counterRow?.last_value || 1);
      while (true) {
        const candidate = `${prefix}${sequenceNumberToLetters(seq)}`;
        const existing = await WorkOrderModel.count({
          where: { code: candidate },
          ...(this.transaction ? { transaction: this.transaction } : {})
        });
        if (existing === 0) {
          if (seq !== Number(counterRow?.last_value)) {
            await sequelize.query(
              `UPDATE daily_sequence_counters
               SET last_value = GREATEST(last_value, :seq)
               WHERE scope = 'work_order' AND date_key = :prefix`,
              { ...queryOpts, replacements: { seq, prefix }, type: QueryTypes.UPDATE }
            );
          }
          return candidate;
        }
        seq += 1;
      }
    } catch (_) {
      try {
        await sequelize.query(`SELECT pg_advisory_xact_lock(hashtext(:lockKey))`, {
          ...queryOpts,
          replacements: { lockKey: `wo_code_${prefix}` },
          type: QueryTypes.SELECT
        });
      } catch (__) {}

      const options = {
        where: { code: { [Op.like]: safePrefixLike } },
        attributes: ['code'],
        order: [['code', 'DESC']]
      };
      if (this.transaction) options.transaction = this.transaction;
      const rows = await WorkOrderModel.findAll(options);
      const usedSuffixes = new Set(rows.map((r) => (r.code || '').slice(prefix.length)).filter(Boolean));
      let seq = 1;
      while (usedSuffixes.has(sequenceNumberToLetters(seq))) {
        seq += 1;
      }
      return `${prefix}${sequenceNumberToLetters(seq)}`;
    }
  }

  async findByEssayId(essayId) {
    const options = {
      where: { essay_id: essayId },
      order: [['generated_at', 'DESC']]
    };
    if (this.transaction) options.transaction = this.transaction;
    const rows = await WorkOrderModel.findOne(options);
    if (!rows) return null;
    const plain = rows.get ? rows.get({ plain: true }) : rows;
    return this.mapToDomain(plain);
  }

  async findAllByEssayIds(essayIds) {
    if (!Array.isArray(essayIds) || essayIds.length === 0) return [];
    const options = {
      where: { essay_id: { [Op.in]: essayIds } },
      order: [['essay_id', 'ASC'], ['generated_at', 'DESC']]
    };
    if (this.transaction) options.transaction = this.transaction;
    const rows = await WorkOrderModel.findAll(options);
    const plain = rows.map((r) => (r.get ? r.get({ plain: true }) : r));
    return plain.map((p) => this.mapToDomain(p));
  }

  async findById(id) {
    const options = { where: { id } };
    if (this.transaction) options.transaction = this.transaction;
    const row = await WorkOrderModel.findOne(options);
    if (!row) return null;
    const plain = row.get ? row.get({ plain: true }) : row;
    return this.mapToDomain(plain);
  }

  async findAll(filters = {}) {
    const where = {};
    if (filters && typeof filters === 'object') {
      if (filters.code != null && String(filters.code).trim() !== '') {
        where.code = String(filters.code).trim();
      }
      if (filters.status != null && String(filters.status).trim() !== '') {
        where.status = String(filters.status).trim();
      }
    }

    const options = {
      where,
      order: [['generated_at', 'DESC']]
    };
    if (filters && Number.isInteger(filters.limit) && filters.limit > 0) {
      options.limit = Math.min(filters.limit, 500);
    }
    if (filters && Number.isInteger(filters.offset) && filters.offset >= 0) {
      options.offset = filters.offset;
    }
    if (this.transaction) options.transaction = this.transaction;
    const rows = await WorkOrderModel.findAll(options);
    const plain = rows.map((r) => (r.get ? r.get({ plain: true }) : r));
    return plain.map((p) => this.mapToDomain(p));
  }

  async update(id, data) {
    const options = { where: { id } };
    if (this.transaction) options.transaction = this.transaction;
    await WorkOrderModel.update(data, options);
    return this.findById(id);
  }
}

module.exports = WorkOrderRepository;
