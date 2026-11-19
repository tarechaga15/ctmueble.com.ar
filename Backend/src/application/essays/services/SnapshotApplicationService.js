'use strict';

const { EssayDocumentSnapshot, Essay, User } = require('../../../infrastructure/models');
const SnapshotCryptoService = require('../../../infrastructure/security/SnapshotCryptoService');
const OpenTimestampsService = require('../../../infrastructure/security/OpenTimestampsService');
const { extractDeviceInfo } = require('../../../infrastructure/auth/utils/deviceInfo');

function toPlain(obj) {
  if (!obj) return obj;
  if (typeof obj.toJSON === 'function') return obj.toJSON();
  if (obj.dataValues) return { ...obj.dataValues };
  return { ...obj };
}

class SnapshotApplicationService {
  constructor(options = {}) {
    this.snapshotModel = options.snapshotModel || EssayDocumentSnapshot;
    this.cryptoService = options.cryptoService || SnapshotCryptoService.getInstance();
    this.otsService = options.otsService || OpenTimestampsService.getInstance();
    this.context = options.context || {};
  }

  static getInstance(context = {}) {
    return new SnapshotApplicationService({ context });
  }

  /**
   * Construye el payload canónico para una solicitud o contrato de ensayo.
   */
  _buildSnapshotData({ essayData, documentType, eventCode, customData = {} }) {
    const rawEssay = toPlain(essayData);
    const rawClient = toPlain(rawEssay?.essayClient || rawEssay?.client || {});
    const rawElements = toPlain(rawEssay?.elements || {});
    const rawTerms = toPlain(rawEssay?.terms || {});

    // Estructura normalizada e inmutable de los datos
    const baseData = {
      essay_id: rawEssay?.id || null,
      essay_code: rawEssay?.code || null,
      document_type: String(documentType).toUpperCase().trim(),
      event_code: eventCode,
      status: rawEssay?.status?.value || rawEssay?.status || null,
      request_date: rawEssay?.requestDate || rawEssay?.request_date || null,
      elements: {
        product: rawElements.product || null,
        manufacturer: rawElements.manufacturer || null,
        batch_number: rawElements.batch_number || rawElements.batchNumber || null,
        country: rawElements.country || rawElements.countryData?.id || 'AR',
        date: rawElements.date || null
      },
      client: {
        cuit: rawClient.cuit || null,
        name: rawClient.name || null,
        address: rawClient.address || rawClient.address_address || null,
        location: rawClient.location || rawClient.address_location || null,
        province: rawClient.province || rawClient.address_province || null,
        representative_name: rawClient.representative_name || null,
        representative_dni: rawClient.representative_dni || null,
        contact_name: rawClient.contact_name || null,
        contact_mail: rawClient.contact_mail || null,
        contact_phone: rawClient.contact_phone || null
      }
    };

    // Si es contrato (F-PC13-02), agregar términos acordados
    if (documentType === 'F-PC13-02') {
      baseData.terms = {
        days_to_do: rawTerms.daysToDo ?? rawTerms.days_to_do ?? null,
        price: rawTerms.price != null ? Number(rawTerms.price) : null,
        samples_conservation_days: rawTerms.samplesConservationDays ?? rawTerms.samples_conservation_days ?? null
      };
    }

    // Merge con datos adicionales provistos
    if (customData && typeof customData === 'object') {
      return { ...baseData, ...customData };
    }

    return baseData;
  }

  /**
   * Captura y persiste una snapshot versionada, generando hash canónico,
   * firma digital y prueba de sellado de tiempo OpenTimestamps (OTS).
   */
  async takeSnapshot({ essayId, essayData, documentType, eventCode, user = null, req = null, customData = {} }) {
    if (!essayId) {
      throw new Error('essayId es requerido para registrar snapshot');
    }

    const docType = String(documentType || 'F-PC13-01').toUpperCase().trim();
    const effectiveUser = user || this.context?.user || null;
    const device = extractDeviceInfo(req);
    const otsCacheByHash = new Map();

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Calcular versión correlativa para este ensayo y tipo de documento
      const lastSnapshot = await this.snapshotModel.findOne({
        where: { essay_id: essayId, document_type: docType },
        order: [['version', 'DESC']]
      });

      const nextVersion = lastSnapshot ? Number(lastSnapshot.version) + 1 : 1;

      // Construir datos canónicos
      const snapshotData = this._buildSnapshotData({
        essayData,
        documentType: docType,
        eventCode,
        customData: {
          version: nextVersion,
          ...customData
        }
      });

      // 1. Hash canónico SHA-256 (RFC 8785)
      const { canonicalHash } = this.cryptoService.hashCanonical(snapshotData);

      // 2. Firma criptográfica con la clave del sistema
      const { signature, algorithm } = this.cryptoService.signHash(canonicalHash);

      // 3. Sellado de tiempo OpenTimestamps (OTS) reutilizando por hash si hay reintento de versión
      let otsResult = otsCacheByHash.get(canonicalHash);
      if (!otsResult) {
        otsResult = {
          status: 'PENDING',
          proofBase64: null,
          calendarUrl: null,
          stampedAt: null,
          error: null
        };
        try {
          otsResult = await this.otsService.stampHash(canonicalHash);
        } catch (otsErr) {
          otsResult = {
            status: 'FAILED',
            proofBase64: null,
            calendarUrl: null,
            stampedAt: null,
            error: otsErr.message
          };
        }
        otsCacheByHash.set(canonicalHash, otsResult);
      }

      // 4. Persistir snapshot inmutable con reintento ante colisión concurrente de versión
      try {
        const snapshot = await this.snapshotModel.create({
          essay_id: essayId,
          document_type: docType,
          version: nextVersion,
          event_code: eventCode || 'SNAPSHOT_CAPTURED',
          snapshot_data: snapshotData,
          canonical_hash: canonicalHash,
          signature,
          signature_algorithm: algorithm,
          ots_status: otsResult.status || 'PENDING',
          ots_proof: otsResult.proofBase64 || null,
          ots_calendar_url: otsResult.calendarUrl || null,
          ots_stamped_at: otsResult.stampedAt || null,
          ots_error: otsResult.error || null,
          user_id: effectiveUser?.id || null,
          session_id: device.sessionId,
          device_id: device.deviceId,
          device_fingerprint: device.deviceFingerprint,
          client_name: device.clientName,
          ip_address: device.ipAddress,
          user_agent: device.userAgent,
          created_at: new Date()
        });
        return snapshot;
      } catch (createErr) {
        if (createErr?.name === 'SequelizeUniqueConstraintError' && attempt < maxRetries) {
          continue;
        }
        throw createErr;
      }
    }
  }

  /**
   * Obtiene la última snapshot de un ensayo para un tipo de documento dado.
   */
  async getLatestSnapshot(essayId, documentType) {
    const docType = String(documentType).toUpperCase().trim();
    return this.snapshotModel.findOne({
      where: { essay_id: essayId, document_type: docType },
      order: [['version', 'DESC']]
    });
  }

  /**
   * Obtiene todas las snapshots de un ensayo ordenadas cronológicamente.
   */
  async getSnapshotsByEssay(essayId, options = {}) {
    const list = await this.snapshotModel.findAll({
      where: { essay_id: essayId },
      order: [
        ['document_type', 'ASC'],
        ['version', 'ASC']
      ]
    });

    const callerUser = options.user || this.context?.user || null;
    const isClient = callerUser?.profile === 'CLIENT';

    return list.map((item) => {
      const plain = toPlain(item);
      const integrity = this.cryptoService.verifySnapshotIntegrity(plain);
      const maskedSession = plain.session_id
        ? (String(plain.session_id).length > 8 ? `${String(plain.session_id).slice(0, 8)}...` : '***')
        : null;

      const sanitizedPlain = { ...plain };
      if (isClient) {
        delete sanitizedPlain.ip_address;
        delete sanitizedPlain.user_agent;
        delete sanitizedPlain.session_id;
        delete sanitizedPlain.device_id;
        delete sanitizedPlain.device_fingerprint;
        delete sanitizedPlain.user_id;
      } else if (callerUser) {
        sanitizedPlain.session_id = maskedSession;
      }

      return {
        ...sanitizedPlain,
        id: plain.id,
        essayId: plain.essay_id,
        documentType: plain.document_type,
        version: plain.version,
        eventCode: plain.event_code,
        canonicalHash: plain.canonical_hash,
        signature: plain.signature,
        signatureAlgorithm: plain.signature_algorithm,
        otsStatus: plain.ots_status,
        hasProof: Boolean(plain.ots_proof),
        otsCalendarUrl: plain.ots_calendar_url,
        otsStampedAt: plain.ots_stamped_at,
        otsError: plain.ots_error,
        createdAt: plain.created_at,
        integrity
      };
    });
  }

  /**
   * Obtiene y valida criptográficamente una snapshot por su ID.
   */
  async verifySnapshot(snapshotId, options = {}) {
    const snapshot = await this.snapshotModel.findByPk(snapshotId);
    if (!snapshot) {
      const err = new Error('Snapshot no encontrada');
      err.status = 404;
      err.code = 'SNAPSHOT_NOT_FOUND';
      throw err;
    }

    const plain = toPlain(snapshot);
    const integrity = this.cryptoService.verifySnapshotIntegrity(plain);

    let otsValid = false;
    let otsDetails = null;

    if (plain.ots_proof) {
      const buffer = this.otsService.getOtsBinaryBuffer(plain.ots_proof);
      otsValid = this.otsService.isValidOtsBuffer(buffer);
      otsDetails = {
        hasProof: true,
        isValidHeader: otsValid,
        calendarUrl: plain.ots_calendar_url,
        stampedAt: plain.ots_stamped_at,
        proofLengthBytes: buffer ? buffer.length : 0
      };
    } else {
      otsDetails = {
        hasProof: false,
        status: plain.ots_status,
        error: plain.ots_error
      };
    }

    const callerUser = options.user || this.context?.user || null;
    const isClient = callerUser?.profile === 'CLIENT';
    const maskedSession = plain.session_id
      ? (String(plain.session_id).length > 8 ? `${String(plain.session_id).slice(0, 8)}...` : '***')
      : null;

    return {
      snapshotId: plain.id,
      id: plain.id,
      essayId: plain.essay_id,
      documentType: plain.document_type,
      version: plain.version,
      eventCode: plain.event_code,
      createdAt: plain.created_at,
      tampered: !integrity.valid,
      integrityValid: Boolean(integrity.valid),
      signatureValid: Boolean(integrity.valid),
      signatureAlgorithm: plain.signature_algorithm || 'RSA-SHA256',
      canonicalHash: plain.canonical_hash,
      otsStatus: plain.ots_status || (otsDetails.hasProof ? 'STAMPED' : 'PENDING'),
      otsVerified: Boolean(otsDetails.hasProof && otsDetails.isValidHeader),
      otsStampedAt: plain.ots_stamped_at || otsDetails.stampedAt,
      otsCalendar: plain.ots_calendar_url || otsDetails.calendarUrl,
      device: isClient
        ? {
            clientName: plain.client_name
          }
        : {
            clientName: plain.client_name,
            deviceId: plain.device_id,
            deviceFingerprint: plain.device_fingerprint,
            ipAddress: plain.ip_address,
            userAgent: plain.user_agent,
            sessionId: callerUser ? maskedSession : plain.session_id
          },
      cryptography: {
        canonicalHash: plain.canonical_hash,
        signatureAlgorithm: plain.signature_algorithm,
        integrityCheck: integrity
      },
      openTimestamps: otsDetails,
      isValid: integrity.valid
    };
  }

  /**
   * Obtiene el buffer binario del comprobante .ots para descarga o verificación CLI externa.
   */
  async getOtsProofFile(snapshotId) {
    const snapshot = await this.snapshotModel.findByPk(snapshotId);
    if (!snapshot) {
      const err = new Error('Snapshot no encontrada');
      err.status = 404;
      err.code = 'SNAPSHOT_NOT_FOUND';
      throw err;
    }

    if (!snapshot.ots_proof) {
      const err = new Error('Esta snapshot no cuenta con comprobante OpenTimestamps disponible');
      err.status = 400;
      err.code = 'OTS_PROOF_NOT_FOUND';
      throw err;
    }

    const buffer = this.otsService.getOtsBinaryBuffer(snapshot.ots_proof);
    const filename = `${snapshot.document_type}_v${snapshot.version}_${snapshot.canonical_hash.slice(0, 10)}.ots`;

    return {
      buffer,
      filename,
      contentType: 'application/octet-stream',
      snapshotId: snapshot.id,
      essayId: snapshot.essay_id,
      canonicalHash: snapshot.canonical_hash
    };
  }

  /**
   * Reintenta el sellado OTS para snapshots pendientes.
   */
  async retryPendingTimestamps(limit = 10) {
    const pendings = await this.snapshotModel.findAll({
      where: { ots_status: 'PENDING' },
      limit
    });

    const results = [];
    for (const snap of pendings) {
      try {
        const ots = await this.otsService.stampHash(snap.canonical_hash);
        if (ots.status === 'STAMPED') {
          await snap.update({
            ots_status: 'STAMPED',
            ots_proof: ots.proofBase64,
            ots_calendar_url: ots.calendarUrl,
            ots_stamped_at: ots.stampedAt,
            ots_error: null
          });
          results.push({ id: snap.id, status: 'STAMPED' });
        } else {
          results.push({ id: snap.id, status: 'PENDING', error: ots.error });
        }
      } catch (err) {
        results.push({ id: snap.id, status: 'ERROR', error: err.message });
      }
    }

    return results;
  }
}

module.exports = SnapshotApplicationService;
