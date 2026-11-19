const crypto = require('crypto');
const { UserRecoveryCode } = require('../../models');

class RecoveryCodeService {
  constructor(options = {}) {
    this.model = options.model || UserRecoveryCode;
  }

  static getInstance() {
    if (!RecoveryCodeService._instance) {
      RecoveryCodeService._instance = new RecoveryCodeService();
    }
    return RecoveryCodeService._instance;
  }

  _normalize(code) {
    return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  _hash(normalizedCode) {
    return crypto.createHash('sha256').update(normalizedCode).digest('hex');
  }

  /**
   * Genera un nuevo conjunto de códigos de recuperación de emergencia para el usuario.
   * Invalida los códigos anteriores no utilizados.
   * Formato: XXXX-XXXX (8 caracteres alfanuméricos agrupados).
   */
  async generateCodes(userId, count = 8) {
    if (!userId) throw new Error('ID de usuario requerido');

    // 1. Eliminar códigos previos
    await this.model.destroy({ where: { user_id: userId } });

    const plainCodes = [];
    const rowsToInsert = [];

    for (let i = 0; i < count; i++) {
      const hex = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars
      const formatted = `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
      plainCodes.push(formatted);

      rowsToInsert.push({
        user_id: userId,
        code_hash: this._hash(hex),
        used: false,
        created_at: new Date()
      });
    }

    await this.model.bulkCreate(rowsToInsert);

    return {
      codes: plainCodes,
      count: plainCodes.length,
      createdAt: new Date()
    };
  }

  /**
   * Retorna el resumen de códigos disponibles.
   */
  async getStatus(userId) {
    if (!userId) return { total: 0, remaining: 0 };

    const total = await this.model.count({ where: { user_id: userId } });
    const remaining = await this.model.count({ where: { user_id: userId, used: false } });

    return {
      total,
      remaining
    };
  }

  /**
   * Valida un código de recuperación y lo marca como consumido (de un solo uso).
   */
  async validateAndConsumeCode(userId, inputCode) {
    if (!userId || !inputCode) return false;
    const normalized = this._normalize(inputCode);
    if (normalized.length !== 8) return false;

    const hash = this._hash(normalized);

    const record = await this.model.findOne({
      where: {
        user_id: userId,
        code_hash: hash,
        used: false
      }
    });

    if (!record) return false;

    await record.update({
      used: true,
      used_at: new Date()
    });

    return true;
  }
}

module.exports = RecoveryCodeService;
