/**
 * Interfaz del repositorio de documentos.
 * Define los métodos que debe implementar cualquier repositorio de documentos.
 */
class IDocumentRepository {
  /**
   * Busca un documento por su ID.
   * @param {string} id - ID del documento
   * @returns {Promise<Document>} El documento encontrado o null
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Busca todos los documentos asociados a un ensayo.
   * @param {string} essayId - ID del ensayo
   * @returns {Promise<Array<Document>>} Lista de documentos
   */
  async findByEssayId(essayId) {
    throw new Error('Method not implemented');
  }

  /**
   * Busca el documento más reciente de un ensayo por tipo (id de types_documents).
   * @param {string} essayId - ID del ensayo
   * @param {number} typeId - ID del tipo de documento (types_documents.id)
   * @returns {Promise<Document|null>} El documento o null si no existe
   */
  async findLatestByEssayIdAndTypeId(essayId, typeId) {
    throw new Error('Method not implemented');
  }

  /**
   * Guarda un nuevo documento.
   * @param {Document} document - Entidad Document a guardar
   * @returns {Promise<Document>} El documento guardado con su ID asignado
   */
  async save(document) {
    throw new Error('Method not implemented');
  }

  /**
   * Actualiza un documento existente.
   * @param {Document} document - Entidad Document con los cambios
   * @returns {Promise<Document>} El documento actualizado
   */
  async update(document) {
    throw new Error('Method not implemented');
  }

  /**
   * Elimina un documento por su ID.
   * @param {string} id - ID del documento a eliminar
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = IDocumentRepository;

