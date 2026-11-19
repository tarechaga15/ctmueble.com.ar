/**
 * Implementación del repositorio de documentos usando Sequelize.
 * Convierte entre modelos de Sequelize y entidades de dominio Document.
 */
const IDocumentRepository = require('../../../domain/documents/repositories/IDocumentRepository');
const Document = require('../../../domain/documents/entities/Document');
const { Document: DocumentModel, Types: DocumentTypeModel, Essay: EssayModel } = require('../../models');
const { getUuidV4 } = require('../../../shared/uuid');

class DocumentRepository extends IDocumentRepository {
  constructor({ transaction } = {}) {
    super();
    this.transaction = transaction || null;
  }

  setTransaction(transaction) {
    this.transaction = transaction || null;
  }

  /**
   * Busca un documento por su ID usando Sequelize.
   * Incluye tipo (código) y ensayo (código) para nombre de descarga.
   * @param {string} id - ID del documento
   * @returns {Promise<Document|null>} Entidad Document o null si no existe
   */
  async findById(id) {
    const documentData = await DocumentModel.findOne({
      where: { id },
      include: [
        { model: DocumentTypeModel, as: 'typeDocument', attributes: ['id', 'code', 'name'] },
        { model: EssayModel, as: 'essayDocument', attributes: ['code'] }
      ]
    });

    if (!documentData) return null;

    return this.mapToDomain(documentData);
  }

  /**
   * Busca todos los documentos asociados a un ensayo usando Sequelize.
   * @param {string} essayId - ID del ensayo
   * @returns {Promise<Array<Document>>} Lista de entidades Document
   */
  async findByEssayId(essayId) {
    const documentsData = await DocumentModel.findAll({
      where: { essay: essayId },
      include: [
        { model: DocumentTypeModel, as: 'typeDocument', attributes: ['id', 'code', 'name'] }
      ],
      order: [['generated_at', 'DESC']]
    });

    return documentsData.map(document => this.mapToDomain(document));
  }

  /**
   * Busca el documento más reciente de un ensayo por tipo (id de types_documents).
   * @param {string} essayId - ID del ensayo
   * @param {number} typeId - ID del tipo de documento (types_documents.id)
   * @returns {Promise<Document|null>}
   */
  async findLatestByEssayIdAndTypeId(essayId, typeId) {
    const documentsData = await DocumentModel.findAll({
      where: { essay: essayId, type: typeId },
      order: [['generated_at', 'DESC']],
      limit: 1
    });

    if (!documentsData || documentsData.length === 0) return null;
    return this.mapToDomain(documentsData[0]);
  }

  /**
   * Guarda un nuevo documento usando Sequelize.
   * Convierte la entidad de dominio a formato Sequelize.
   * @param {Document} document - Entidad Document a guardar
   * @returns {Promise<Document>} Entidad Document con ID asignado
   */
  async save(document) {
    const options = this.transaction ? { transaction: this.transaction } : {};
    const docId = document.id || (await getUuidV4());
    const documentData = await DocumentModel.create({
      id: docId,
      essay: document.essayId,
      type: document.typeId,
      copy: document.copy || 0,
      modificated: Boolean(document.modificated),
      generated_at: document.generatedAt || new Date(),
      file: document.file || 'on-demand'
    }, options);

    document.id = documentData.id;
    return document;
  }

  /**
   * Actualiza un documento existente usando Sequelize.
   * @param {Document} document - Entidad Document con los cambios
   * @returns {Promise<Document>} Entidad Document actualizada
   */
  async update(document) {
    const options = { where: { id: document.id } };
    if (this.transaction) options.transaction = this.transaction;
    await DocumentModel.update({
      copy: document.copy,
      modificated: document.modificated,
      file: document.file
    }, options);

    return document;
  }

  /**
   * Elimina un documento por su ID usando Sequelize.
   * @param {string} id - ID del documento a eliminar
   * @returns {Promise<void>}
   */
  async delete(id) {
    const options = { where: { id } };
    if (this.transaction) options.transaction = this.transaction;
    await DocumentModel.destroy(options);
  }

  /**
   * Convierte un modelo de Sequelize a una entidad de dominio Document.
   * Incluye typeCode y essayCode cuando vienen en las asociaciones (para descarga).
   * @param {Object} documentData - Modelo de Sequelize (o objeto plano)
   * @returns {Document} Entidad Document de dominio
   */
  mapToDomain(documentData) {
    const plain = documentData && typeof documentData.get === 'function'
      ? documentData.get({ plain: true })
      : documentData;
    const typeCode = plain.typeDocument?.code ?? null;
    const essayCode = plain.essayDocument?.code ?? null;
    return new Document({
      id: plain.id,
      essayId: plain.essay,
      typeId: plain.type,
      copy: plain.copy,
      modificated: plain.modificated,
      generatedAt: plain.generated_at,
      file: plain.file,
      typeCode,
      essayCode
    });
  }
}

module.exports = DocumentRepository;

