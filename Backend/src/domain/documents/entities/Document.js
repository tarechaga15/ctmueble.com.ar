/**
 * Entidad de dominio que representa un documento generado.
 * Un documento está asociado a un ensayo y tiene un tipo específico.
 */
class Document {
  /**
   * Constructor de la entidad Document.
   * @param {Object} params - Parámetros del documento
   * @param {string} params.id - Identificador único del documento
   * @param {string} params.essayId - ID del ensayo asociado
   * @param {string} params.typeId - ID del tipo de documento
   * @param {number} params.copy - Número de copia
   * @param {boolean} params.modificated - Indica si el documento fue modificado
   * @param {Date} params.generatedAt - Fecha de generación del documento
   * @param {string} params.file - Nombre del archivo del documento
   * @param {string} [params.typeCode] - Código del tipo (ej. F-PC13-01), opcional, para nombre de descarga
   * @param {string} [params.essayCode] - Código de solicitud del ensayo, opcional, para nombre de descarga
   */
  constructor({
    id,
    essayId,
    typeId,
    copy,
    modificated,
    generatedAt,
    file,
    typeCode,
    essayCode
  }) {
    this.id = id;
    this.essayId = essayId;
    this.typeId = typeId;
    this.copy = copy;
    this.modificated = modificated;
    this.generatedAt = generatedAt;
    this.file = file;
    this.typeCode = typeCode;
    this.essayCode = essayCode;
  }

  /**
   * Marca el documento como modificado.
   */
  markAsModified() {
    this.modificated = true;
  }
}

module.exports = Document;

