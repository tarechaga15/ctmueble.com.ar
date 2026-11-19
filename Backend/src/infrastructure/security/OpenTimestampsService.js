'use strict';

const axios = require('axios');

/**
 * Encabezado binario mágico de OpenTimestamps (.ots) según la especificación oficial (31 bytes):
 * 0x00 0x4f 0x70 0x65 0x6e 0x54 0x69 0x6d 0x65 0x73 0x74 0x61 0x6d 0x70 0x73 0x00 0x00 0x50 0x72 0x6f 0x6f 0x66 0x00 0xbf 0x89 0xe2 0xe8 0x84 0xe8 0x92 0x94
 * ("\x00OpenTimestamps\x00\x00Proof\x00\xbf\x89\xe2\xe8\x84\xe8\x92\x94")
 */
const OTS_MAGIC_BYTES = Buffer.from([
  0x00, 0x4f, 0x70, 0x65, 0x6e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x73, 0x00,
  0x00, 0x50, 0x72, 0x6f, 0x6f, 0x66, 0x00, 0xbf, 0x89, 0xe2, 0xe8, 0x84, 0xe8, 0x92, 0x94
]);

const OTS_MAJOR_VERSION = Buffer.from([0x01]);
const OTS_HASH_OP_SHA256 = Buffer.from([0x08]);

const DEFAULT_CALENDARS = [
  'https://a.pool.opentimestamps.org/digest',
  'https://alice.btc.calendar.opentimestamps.org/digest',
  'https://bob.btc.calendar.opentimestamps.org/digest'
];

class OpenTimestampsService {
  constructor(options = {}) {
    this.calendars = options.calendars || DEFAULT_CALENDARS;
    this.timeoutMs = options.timeoutMs || Number(process.env.OTS_TIMEOUT_MS) || 4000;
    this.isTestEnv =
      process.env.NODE_ENV === 'test' ||
      Boolean(process.env.NODE_TEST_CONTEXT) ||
      process.env.OTS_DISABLE_NETWORK === 'true';
  }

  static getInstance() {
    if (!OpenTimestampsService._instance) {
      OpenTimestampsService._instance = new OpenTimestampsService();
    }
    return OpenTimestampsService._instance;
  }

  /**
   * Verifica si un buffer binario inicia con el encabezado de un archivo OpenTimestamps válido.
   */
  isValidOtsBuffer(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 23) {
      return false;
    }
    // Permite comparar los primeros 23 bytes (\x00OpenTimestamps\x00\x00Proof\x00\xbf) o los 31 completos
    const minLen = Math.min(buffer.length, OTS_MAGIC_BYTES.length);
    return buffer.subarray(0, minLen).equals(OTS_MAGIC_BYTES.subarray(0, minLen));
  }

  /**
   * Ensambla un archivo binario OpenTimestamps (.ots) completo a partir de la respuesta del servidor de calendario.
   * El endpoint POST /digest devuelve las operaciones de Merkle tree serializadas (Timestamp fragment).
   * Para conformar un archivo .ots estándar (DetachedTimestampFile) verificable por cualquier cliente oficial OTS,
   * se antepone el magic header, versión de especificación, opcode del hash y los 32 bytes del digest.
   */
  assembleOtsFile(hashBinary, calendarPayload) {
    if (this.isValidOtsBuffer(calendarPayload)) {
      return calendarPayload;
    }
    return Buffer.concat([
      OTS_MAGIC_BYTES,
      OTS_MAJOR_VERSION,
      OTS_HASH_OP_SHA256,
      hashBinary,
      calendarPayload
    ]);
  }

  /**
   * Crea un buffer de prueba OTS mockeado (para tests o contingencia offline),
   * estructurado conforme a la especificación binaria de OpenTimestamps.
   */
  createMockOtsProof(hashHex) {
    const hashBuf = Buffer.from(hashHex, 'hex');
    const timestampBytes = Buffer.alloc(8);
    timestampBytes.writeBigInt64BE(BigInt(Date.now()));

    const mockCalendarPayload = Buffer.concat([
      timestampBytes,
      Buffer.from('CTM_OTS_CALENDAR_PAYLOAD_V1')
    ]);

    return this.assembleOtsFile(hashBuf, mockCalendarPayload);
  }

  /**
   * Envía el hash SHA-256 (32 bytes) a los servidores de calendario OpenTimestamps
   * para obtener la prueba criptográfica de fecha cierta (.ots).
   * 
   * Intenta en orden de preferencia con fallback automático.
   * Si todos los servidores fallan o no hay red, retorna estado PENDING/FAILED
   * de forma no bloqueante para no interrumpir el flujo de negocio.
   */
  async stampHash(hashHex, options = {}) {
    if (!hashHex || typeof hashHex !== 'string') {
      throw new Error('Hash hexadecimal requerido para OpenTimestamps');
    }

    const cleanHash = hashHex.trim().toLowerCase();
    if (cleanHash.length !== 64) {
      throw new Error('El hash debe ser SHA-256 (64 caracteres hexadecimales)');
    }

    const hashBinary = Buffer.from(cleanHash, 'hex');

    // En entorno de tests automáticos o si se deshabilita explícitamente la red externa
    if (this.isTestEnv && !options.forceNetwork) {
      const mockBuffer = this.createMockOtsProof(cleanHash);
      return {
        status: 'STAMPED',
        proofBase64: mockBuffer.toString('base64'),
        calendarUrl: 'mock://opentimestamps.local',
        stampedAt: new Date(),
        error: null,
        isMock: true
      };
    }

    let lastError = null;

    for (const calendarUrl of this.calendars) {
      try {
        const response = await axios.post(calendarUrl, hashBinary, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/octet-stream'
          },
          responseType: 'arraybuffer',
          timeout: this.timeoutMs,
          validateStatus: (status) => status === 200
        });

        const rawData = Buffer.from(response.data);
        if (!rawData || rawData.length < 16) {
          throw new Error('La respuesta del calendario OTS está vacía o incompleta');
        }

        // Ensamblar archivo .ots completo estándar
        const proofBuffer = this.assembleOtsFile(hashBinary, rawData);

        return {
          status: 'STAMPED',
          proofBase64: proofBuffer.toString('base64'),
          calendarUrl,
          stampedAt: new Date(),
          error: null,
          isMock: false
        };
      } catch (err) {
        lastError = err;
        // Continuar al siguiente calendario en caso de fallo o timeout
      }
    }

    // Si fallaron todos los servidores públicos o no hay red
    return {
      status: 'PENDING',
      proofBase64: null,
      calendarUrl: null,
      stampedAt: null,
      error: `No fue posible conectar con los calendarios OpenTimestamps: ${lastError?.message || 'Timeout'}`,
      isMock: false
    };
  }

  /**
   * Convierte la prueba OTS guardada en Base64 al Buffer binario original
   * apto para guardarse como archivo con extensión .ots.
   */
  getOtsBinaryBuffer(proofBase64) {
    if (!proofBase64) return null;
    return Buffer.from(proofBase64, 'base64');
  }
}

module.exports = OpenTimestampsService;
module.exports.OTS_MAGIC_BYTES = OTS_MAGIC_BYTES;
