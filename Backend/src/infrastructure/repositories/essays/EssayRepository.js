/**
 * Implementación del repositorio de ensayos usando Sequelize.
 * Convierte entre modelos de Sequelize y entidades de dominio.
 */
const IEssayRepository = require('../../../domain/essays/repositories/IEssayRepository');
const Essay = require('../../../domain/essays/entities/Essay');
const EssayClient = require('../../../domain/essays/entities/EssayClient');
const EssayTypeEntity = require('../../../domain/types/entities/EssayType');
const EssayElements = require('../../../domain/essays/entities/EssayElements');
const Terms = require('../../../domain/essays/value-objects/Terms');
const {
  sequelize,
  Essay: EssayModel,
  EssayClient: EssayClientModel,
  Persons,
  EssayType,
  Bussiness,
  BussinessAddress,
  Elements,
  Document,
  Types,
  Country,
  District,
  Terms: TermsModel
} = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const { DateTime } = require('luxon');
const { escapeLike, sequenceNumberToLetters } = require('../../../shared/sqlLike');

const REQUEST_DATE_ZONE = 'America/Argentina/Buenos_Aires';

class EssayRepository extends IEssayRepository {
  constructor({ transaction } = {}) {
    super();
    this.transaction = transaction || null;
  }

  setTransaction(transaction) {
    this.transaction = transaction || null;
  }

  _requestDateRangeClause(dateFrom, dateTo) {
    if (!dateFrom && !dateTo) return null;
    const clause = {};
    if (dateFrom) {
      const s = String(dateFrom).trim().slice(0, 10);
      const dt = DateTime.fromISO(s, { zone: REQUEST_DATE_ZONE });
      if (!dt.isValid) {
        const err = new Error('Fecha desde inválida');
        err.code = 'INVALID_DATE';
        throw err;
      }
      clause[Op.gte] = dt.startOf('day').toUTC().toJSDate();
    }
    if (dateTo) {
      const s = String(dateTo).trim().slice(0, 10);
      const dt = DateTime.fromISO(s, { zone: REQUEST_DATE_ZONE });
      if (!dt.isValid) {
        const err = new Error('Fecha hasta inválida');
        err.code = 'INVALID_DATE';
        throw err;
      }
      clause[Op.lte] = dt.endOf('day').toUTC().toJSDate();
    }
    if (clause[Op.gte] && clause[Op.lte] && clause[Op.gte] > clause[Op.lte]) {
      const err = new Error('Rango de fechas inválido: la fecha desde es posterior a la fecha hasta');
      err.code = 'INVALID_DATE_RANGE';
      throw err;
    }
    return clause;
  }

  _buildListWhere(filters = {}) {
    const where = {};
    if (filters.code) {
      const trimmedCode = String(filters.code).trim();
      if (trimmedCode) where.code = trimmedCode;
    }
    if (filters.status) {
      const trimmedStatus = String(filters.status).trim();
      if (trimmedStatus) where.status = trimmedStatus;
    }
    const rd = this._requestDateRangeClause(filters.dateFrom, filters.dateTo);
    if (rd) where.request_date = rd;
    return where;
  }

  _buildClientOwnershipInclude(user) {
    if (user && user.profile === 'CLIENT' && user.id) {
      return [
        {
          model: EssayClientModel,
          as: 'essayClient',
          attributes: [],
          required: true,
          include: [
            {
              model: Persons,
              as: 'contactRef',
              attributes: [],
              required: true,
              where: { user_id: user.id }
            }
          ]
        }
      ];
    }
    return [];
  }

  _buildFindAllIncludes(user) {
    const include = [
      {
        model: EssayClientModel,
        as: 'essayClient',
        attributes: [
          'id',
          'cuit',
          'name',
          'representative',
          'representative_name',
          'representative_dni',
          'address',
          'address_address',
          'address_location',
          'address_province',
          'contact',
          'contact_name',
          'contact_dni',
          'contact_mail',
          'contact_country_code',
          'contact_phone',
          'contact_address',
          'contact_location',
          'contact_district',
          'contact_country',
          'billing_cuit',
          'billing_address',
          'billing_location',
          'billing_province',
          'billing_iva'
        ],
        required: false,
        include: [{ model: Bussiness, as: 'business', attributes: ['name'] }]
      },
      { model: EssayType, as: 'type', attributes: ['id', 'name'] },
      {
        model: Elements,
        as: 'elements',
        attributes: ['product', 'manufacturer', 'date', 'batch_number', 'country'],
        include: [{ model: Country, as: 'countryData' }]
      },
      { model: TermsModel, as: 'terms', attributes: ['days_to_do', 'samples_conservation_days', 'price'] },
      {
        model: Document,
        as: 'essayDocuments',
        attributes: ['id', 'type', 'copy', 'modificated', 'generated_at', 'file'],
        order: [['generated_at', 'DESC']],
        include: [{ model: Types, as: 'typeDocument', attributes: ['id', 'code', 'name'] }]
      }
    ];
    if (user && user.profile === 'CLIENT' && user.id) {
      const essayClientInclude = include.find((i) => i.as === 'essayClient');
      if (essayClientInclude) {
        if (!Array.isArray(essayClientInclude.include)) essayClientInclude.include = [];
        essayClientInclude.include.push({
          model: Persons,
          as: 'contactRef',
          attributes: [],
          required: true,
          where: { user_id: user.id }
        });
        essayClientInclude.required = true;
      }
    }
    return include;
  }

  async findById(id, user) {
    const options = {
      attributes: [
        'id',
        'code',
        'request_date',
        'finish_date',
        'status',
        'observations',
        'last_update',
        'last_report_generated',
        'result',
        'uncertainty',
        'client_notifications_enabled',
        'notification_token'
      ],
      where: { id },
      plain: true,
      include: [
        {
          model: EssayClientModel,
          as: 'essayClient',
          attributes: [
            'id',
            'cuit',
            'name',
            'representative',
            'representative_name',
            'representative_dni',
            'address',
            'address_address',
            'address_location',
            'address_province',
            'contact',
            'contact_name',
            'contact_dni',
            'contact_mail',
            'contact_country_code',
            'contact_phone',
            'contact_address',
            'contact_location',
            'contact_district',
            'contact_country',
            'billing_cuit',
            'billing_address',
            'billing_location',
            'billing_province',
            'billing_iva'
          ],
          include: [
            { model: Bussiness, as: 'business', attributes: ['name'] },
            {
              model: BussinessAddress,
              as: 'addressRef',
              attributes: ['id', 'address', 'location', 'district'],
              required: false,
              include: [{ model: District, as: 'districtData', attributes: ['id', 'name'] }]
            },
            {
              model: Persons,
              as: 'representativeRef',
              attributes: ['id', 'name', 'dni', 'address', 'location', 'district', 'country', 'mail', 'phone', 'country_code'],
              required: false,
              include: [
                { model: District, as: 'districtData', attributes: ['id', 'name'] },
                { model: Country, as: 'countryData', attributes: ['id', 'name'] }
              ]
            },
            {
              model: Persons,
              as: 'contactRef',
              attributes: ['id', 'name', 'dni', 'address', 'location', 'district', 'country', 'mail', 'phone', 'country_code'],
              required: false,
              include: [
                { model: District, as: 'districtData', attributes: ['id', 'name'] },
                { model: Country, as: 'countryData', attributes: ['id', 'name'] }
              ]
            }
          ]
        },
        { model: EssayType, as: 'type', attributes: ['id', 'name'] },
        {
          model: Elements,
          as: 'elements',
          attributes: ['product', 'manufacturer', 'date', 'batch_number', 'country'],
          include: [{ model: Country, as: 'countryData', attributes: ['id', 'name'] }]
        },
        { model: TermsModel, as: 'terms', attributes: ['days_to_do', 'samples_conservation_days', 'price'] },
        {
          model: Document,
          as: 'essayDocuments',
          attributes: ['id', 'type', 'copy', 'modificated', 'generated_at', 'file'],
          order: [['generated_at', 'DESC']],
          include: [{ model: Types, as: 'typeDocument', attributes: ['id', 'code', 'name'] }]
        }
      ]
    };

    if (user && user.profile === 'CLIENT' && user.id) {
      const essayClientInclude = options.include.find((i) => i.as === 'essayClient');
      if (essayClientInclude && Array.isArray(essayClientInclude.include)) {
        essayClientInclude.required = true;
        const contactRefInclude = essayClientInclude.include.find((i) => i.as === 'contactRef');
        if (contactRefInclude) {
          contactRefInclude.where = { ...(contactRefInclude.where || {}), user_id: user.id };
          contactRefInclude.required = true;
        }
      }
    }

    if (this.transaction) {
      options.transaction = this.transaction;
    }
    const essayData = await EssayModel.findOne(options);

    if (!essayData) return null;

    return this.mapToDomain(essayData);
  }

  /**
   * Carga un conjunto de ensayos por ID en una única consulta (elimina N+1 en órdenes de trabajo).
   */
  async findByIds(ids, user) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (uniqueIds.length === 0) return [];

    const options = {
      attributes: [
        'id',
        'code',
        'request_date',
        'finish_date',
        'status',
        'observations',
        'last_update',
        'last_report_generated',
        'result',
        'uncertainty',
        'client_notifications_enabled',
        'notification_token'
      ],
      where: { id: { [Op.in]: uniqueIds } },
      include: this._buildFindAllIncludes(user)
    };
    if (this.transaction) options.transaction = this.transaction;

    const rows = await EssayModel.findAll(options);
    return rows.map((row) => this.mapToDomain(row));
  }

  async findAll(user, filters = {}) {
    const where = this._buildListWhere(filters);
    const options = {
      attributes: [
        'id',
        'code',
        'request_date',
        'finish_date',
        'status',
        'observations',
        'last_update',
        'last_report_generated',
        'client_notifications_enabled',
        'notification_token'
      ],
      where,
      order: [['request_date', 'DESC']],
      include: this._buildFindAllIncludes(user)
    };

    if (Number.isInteger(filters.limit) && filters.limit > 0) {
      options.limit = Math.min(filters.limit, 1000);
      options.subQuery = true;
    }
    if (Number.isInteger(filters.offset) && filters.offset >= 0) {
      options.offset = filters.offset;
    }

    if (this.transaction) {
      options.transaction = this.transaction;
    }
    const essaysData = await EssayModel.findAll(options);

    return essaysData.map((essay) => this.mapToDomain(essay));
  }

  /**
   * Cuenta ensayos directamente en SQL usando `COUNT(DISTINCT essays.id)` sin hidratar relaciones pesadas.
   */
  async countAll(user, filters = {}) {
    const where = this._buildListWhere(filters);
    const include = this._buildClientOwnershipInclude(user);
    const opts = {
      where,
      include,
      distinct: true,
      col: 'id'
    };
    if (this.transaction) opts.transaction = this.transaction;
    return EssayModel.count(opts);
  }

  async save(essay) {
    const termsData = essay.terms
      ? {
          days_to_do: essay.terms.daysToDo,
          price: essay.terms.price,
          samples_conservation_days: essay.terms.samplesConservationDays
        }
      : null;

    const elementsPayload = essay.elements
      ? essay.elements instanceof EssayElements
        ? {
            product: essay.elements.product,
            manufacturer: essay.elements.manufacturer,
            date: essay.elements.date,
            country: essay.elements.country?.id ?? essay.elements.country ?? null,
            batch_number: essay.elements.batchNumber ?? null
          }
        : { ...essay.elements, batch_number: essay.elements.batch_number ?? essay.elements.batchNumber ?? null }
      : null;

    const createOptions = {
      include: [
        { model: Elements, as: 'elements' },
        { model: TermsModel, as: 'terms' }
      ]
    };
    if (this.transaction) {
      createOptions.transaction = this.transaction;
    }

    const essayData = await EssayModel.create(
      {
        essay: essay.essayTypeId ?? essay.type?.id ?? essay.type,
        code: essay.code,
        request_date: essay.requestDate,
        status: essay.status,
        observations: essay.observations,
        elements: elementsPayload,
        terms: termsData,
        client_notifications_enabled: essay.clientNotificationsEnabled !== false,
        ...(essay.notificationToken ? { notification_token: essay.notificationToken } : {})
      },
      createOptions
    );

    essay.id = essayData.id;
    return essay;
  }

  async saveEssayClient(essayId, client) {
    const essayClient = client instanceof EssayClient ? client : EssayClient.fromClient(client);
    const payload = essayClient.toPersistencePayload(essayId);
    const options = {};
    if (this.transaction) {
      options.transaction = this.transaction;
    }

    await EssayClientModel.create(payload, options);
  }

  async updateEssayClient(essayId, client) {
    const essayClient = client instanceof EssayClient ? client : EssayClient.fromClient(client);
    const payload = essayClient.toPersistencePayload(essayId);
    delete payload.essay;
    if (payload.address === null) delete payload.address;
    if (payload.contact === null) delete payload.contact;

    const updateOptions = { where: { essay: essayId } };
    if (this.transaction) {
      updateOptions.transaction = this.transaction;
    }

    const [updated] = await EssayClientModel.update(payload, updateOptions);
    if (updated === 0) {
      throw new Error('No existe el registro de solicitante para este ensayo');
    }

    const essayUpdateOptions = { where: { id: essayId } };
    if (this.transaction) {
      essayUpdateOptions.transaction = this.transaction;
    }
    await EssayModel.update({ last_update: new Date() }, essayUpdateOptions);
  }

  async update(essay) {
    const updateOptions = {
      where: { id: essay.id }
    };
    if (this.transaction) {
      updateOptions.transaction = this.transaction;
    }

    await EssayModel.update(
      {
        status: essay.status,
        observations: essay.observations,
        finish_date: essay.finishDate ?? null,
        last_update: essay.lastUpdate ?? undefined,
        last_report_generated: essay.lastReportGenerated ?? undefined,
        result: essay.result ?? null,
        uncertainty: essay.uncertainty ?? null,
        ...(essay.clientNotificationsEnabled !== undefined
          ? { client_notifications_enabled: Boolean(essay.clientNotificationsEnabled) }
          : {})
      },
      updateOptions
    );

    if (essay.terms) {
      const findOptions = { where: { essay: essay.id } };
      if (this.transaction) {
        findOptions.transaction = this.transaction;
      }

      const termsData = await TermsModel.findOne(findOptions);
      const termsUpdate = {
        days_to_do: essay.terms.daysToDo,
        price: essay.terms.price,
        samples_conservation_days: essay.terms.samplesConservationDays
      };

      const termsUpdateOptions = { where: { essay: essay.id } };
      if (this.transaction) {
        termsUpdateOptions.transaction = this.transaction;
      }
      const termsCreateOptions = { essay: essay.id, ...termsUpdate };

      if (termsData) {
        await TermsModel.update(termsUpdate, termsUpdateOptions);
      } else {
        await TermsModel.create(
          termsCreateOptions,
          this.transaction ? { transaction: this.transaction } : {}
        );
      }
    }

    return essay;
  }

  async updateLastUpdate(essayId, timestamp) {
    const options = { where: { id: essayId } };
    if (this.transaction) options.transaction = this.transaction;
    await EssayModel.update({ last_update: timestamp || new Date() }, options);
  }

  async delete(id) {
    const options = { where: { id } };
    if (this.transaction) options.transaction = this.transaction;
    await EssayModel.destroy(options);
  }

  async findByCode(code) {
    const options = { where: { code } };
    if (this.transaction) options.transaction = this.transaction;
    const essayData = await EssayModel.findOne(options);
    return essayData ? this.mapToDomain(essayData) : null;
  }

  /**
   * Genera de forma atómica el siguiente código de ensayo para la fecha dada (`yymmdd` + letra(s)).
   * Usa `daily_sequence_counters` si la migración está aplicada; de lo contrario emplea `pg_advisory_xact_lock` + scan seguro.
   */
  async getNextEssayCodeForDate(date) {
    const y = String(date.getFullYear()).slice(-2);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const prefix = `${y}${m}${d}`;
    const safePrefixLike = `${escapeLike(prefix)}%`;
    const queryOpts = this.transaction ? { transaction: this.transaction } : {};

    try {
      const [counterRow] = await sequelize.query(
        `INSERT INTO daily_sequence_counters (scope, date_key, last_value)
         VALUES ('essay', :prefix, 1)
         ON CONFLICT (scope, date_key)
         DO UPDATE SET last_value = daily_sequence_counters.last_value + 1
         RETURNING last_value`,
        {
          ...queryOpts,
          replacements: { prefix },
          type: QueryTypes.SELECT
        }
      );

      const rows = await EssayModel.findAll({
        where: { code: { [Op.like]: safePrefixLike } },
        attributes: ['code'],
        ...(this.transaction ? { transaction: this.transaction } : {})
      });
      const usedCodes = new Set(rows.map((r) => r.code).filter(Boolean));

      let seq = Number(counterRow?.last_value || 1);
      while (usedCodes.has(`${prefix}${sequenceNumberToLetters(seq)}`)) {
        seq += 1;
      }
      const candidate = `${prefix}${sequenceNumberToLetters(seq)}`;
      if (seq !== Number(counterRow?.last_value)) {
        await sequelize.query(
          `UPDATE daily_sequence_counters
           SET last_value = GREATEST(last_value, :seq)
           WHERE scope = 'essay' AND date_key = :prefix`,
          { ...queryOpts, replacements: { seq, prefix }, type: QueryTypes.UPDATE }
        ).catch(() => {});
      }
      return candidate;
    } catch (_) {
      // Fallback seguro si `daily_sequence_counters` aún no fue migrada
      try {
        await sequelize.query(`SELECT pg_advisory_xact_lock(hashtext(:lockKey))`, {
          ...queryOpts,
          replacements: { lockKey: `essay_code_${prefix}` },
          type: QueryTypes.SELECT
        });
      } catch (__) {}

      const rows = await EssayModel.findAll({
        where: { code: { [Op.like]: safePrefixLike } },
        attributes: ['code'],
        order: [['code', 'DESC']],
        ...(this.transaction ? { transaction: this.transaction } : {})
      });
      const usedSuffixes = new Set(rows.map((r) => (r.code || '').slice(prefix.length)).filter(Boolean));
      let seq = 1;
      while (usedSuffixes.has(sequenceNumberToLetters(seq))) {
        seq += 1;
      }
      return `${prefix}${sequenceNumberToLetters(seq)}`;
    }
  }

  async getTypes() {
    const types = await EssayType.findAll();
    return types.map((type) => ({
      id: type.id,
      name: type.name
    }));
  }

  mapToDomain(essayData) {
    const toPlain = (obj) => {
      if (obj === null || obj === undefined) return obj;
      if (Array.isArray(obj)) {
        return obj.map((item) => toPlain(item));
      }
      if (typeof obj.toJSON === 'function') {
        return toPlain(obj.toJSON());
      }
      if (obj.dataValues) {
        return toPlain(obj.dataValues);
      }
      if (typeof obj === 'object') {
        const plain = {};
        for (const key in obj) {
          if (
            Object.prototype.hasOwnProperty.call(obj, key) &&
            !key.startsWith('_') &&
            key !== 'uniqno' &&
            key !== 'isNewRecord'
          ) {
            plain[key] = toPlain(obj[key]);
          }
        }
        return plain;
      }
      return obj;
    };

    const plainData = toPlain(essayData);

    const essay = new Essay({
      id: plainData.id,
      client: plainData.essayClient
        ? new EssayClient({
            id: plainData.essayClient.id,
            cuit: plainData.essayClient.cuit,
            name: plainData.essayClient.name ?? plainData.essayClient.business?.name ?? plainData.essayClient.contact_name ?? null,
            representative: (plainData.essayClient.representativeRef?.id || plainData.essayClient.representative_name || plainData.essayClient.representative_dni || (typeof plainData.essayClient.representative === 'string' && plainData.essayClient.representative.trim()))
              ? {
                  id: plainData.essayClient.representativeRef?.id ?? (typeof plainData.essayClient.representative === 'string' ? plainData.essayClient.representative : null),
                  name: plainData.essayClient.representative_name ?? null,
                  dni: plainData.essayClient.representative_dni ?? null,
                  district: toPlain(plainData.essayClient.representativeRef?.districtData) ?? null,
                  country: toPlain(plainData.essayClient.representativeRef?.countryData) ?? null
                }
              : null,
            address: {
              id: plainData.essayClient.addressRef?.id ?? (typeof plainData.essayClient.address === 'string' ? plainData.essayClient.address : null),
              address: plainData.essayClient.address_address,
              location: plainData.essayClient.address_location,
              province: plainData.essayClient.address_province,
              district: toPlain(plainData.essayClient.addressRef?.districtData) ?? null
            },
            contact: {
              id: plainData.essayClient.contact,
              name: plainData.essayClient.contact_name,
              dni: plainData.essayClient.contact_dni,
              address: plainData.essayClient.contact_address,
              location: plainData.essayClient.contact_location,
              district: toPlain(plainData.essayClient.contactRef?.districtData) ?? null,
              country: toPlain(plainData.essayClient.contactRef?.countryData) ?? null,
              country_code: plainData.essayClient.contact_country_code,
              mail: plainData.essayClient.contact_mail,
              phone: plainData.essayClient.contact_phone
            },
            billing: {
              cuit: plainData.essayClient.billing_cuit,
              address: plainData.essayClient.billing_address,
              location: plainData.essayClient.billing_location,
              province: plainData.essayClient.billing_province,
              paysIva: plainData.essayClient.billing_iva
            }
          })
        : null,
      type: plainData.type
        ? new EssayTypeEntity({
            id: plainData.type.id,
            name: plainData.type.name
          })
        : null,
      requestDate: plainData.request_date,
      signingDate: plainData.signing_date,
      finishDate: plainData.finish_date,
      dueDate: plainData.due_date,
      observations: plainData.observations,
      status: plainData.status,
      code: plainData.code,
      lastUpdate: plainData.last_update ?? null,
      lastReportGenerated: plainData.last_report_generated ?? null,
      result: plainData.result != null ? parseFloat(plainData.result) : null,
      uncertainty: plainData.uncertainty != null ? parseFloat(plainData.uncertainty) : null,
      clientNotificationsEnabled: plainData.client_notifications_enabled !== false,
      notificationToken: plainData.notification_token ?? null,
      elements: plainData.elements
        ? new EssayElements({
            product: plainData.elements.product,
            manufacturer: plainData.elements.manufacturer,
            date: plainData.elements.date,
            country: toPlain(plainData.elements.countryData) ?? plainData.elements.country ?? null,
            batchNumber: plainData.elements.batch_number ?? null
          })
        : null,
      terms: plainData.terms
        ? new Terms({
            daysToDo: plainData.terms.days_to_do,
            samplesConservationDays: plainData.terms.samples_conservation_days,
            price: parseFloat(plainData.terms.price)
          })
        : null
    });

    if (plainData.essayDocuments) {
      const documents = Array.isArray(plainData.essayDocuments)
        ? plainData.essayDocuments
        : [plainData.essayDocuments];
      const mappedDocuments = documents.map((doc) => toPlain(doc));
      mappedDocuments.sort((a, b) => {
        const dateA = a.generated_at ? new Date(a.generated_at) : new Date(0);
        const dateB = b.generated_at ? new Date(b.generated_at) : new Date(0);
        return dateB - dateA;
      });
      essay.documents = mappedDocuments;
    } else {
      essay.documents = [];
    }

    return essay;
  }
}

module.exports = EssayRepository;
