/**
 * Servicio de aplicación para plantillas de elementos a ensayar (essay_element_templates).
 * CLIENT: plantillas por usuario (user_id). LABORATORY: plantillas compartidas (user_id null, origin LABORATORY).
 */
const EssayElementTemplateDTO = require('../dto/EssayElementTemplateDTO');

class EssayElementTemplateApplicationService {
  /**
   * @param {Object} params
   * @param {Object} params.context - { user } (user.profile: CLIENT | LABORATORY)
   */
  constructor({ context }) {
    this.context = context || {};
  }

  /**
   * Lista las plantillas del usuario actual.
   * CLIENT: por user_id y origin CLIENT. LABORATORY: origin LABORATORY y user_id null (al consultar se devuelve user_id null).
   * @returns {Promise<Array<Object>>} Lista de { id, product, manufacturer, country, origin, user_id? }
   */
  async getElementTemplates() {
    const user = this.context?.user;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    if (!this.essayElementTemplateRepository) {
      return [];
    }
    const profile = user.profile === 'LABORATORY' ? 'LABORATORY' : 'CLIENT';
    const userId = user.id;
    const list = await this.essayElementTemplateRepository.findByUser(userId, profile);
    return list.map((t) => EssayElementTemplateDTO.fromRepository(t));
  }

  /**
   * Obtiene una plantilla por ID (restringido al perfil y usuario actual).
   * @param {string} id - UUID de la plantilla
   * @returns {Promise<Object|null>} Plantilla con user_id null si origin LABORATORY
   */
  async getElementTemplate(id) {
    const user = this.context?.user;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    if (!this.essayElementTemplateRepository) {
      return null;
    }
    const profile = user.profile === 'LABORATORY' ? 'LABORATORY' : 'CLIENT';
    const found = await this.essayElementTemplateRepository.findById(id, user.id, profile);
    return found ? EssayElementTemplateDTO.fromRepository(found) : null;
  }

  /**
   * Crea una plantilla. Si perfil LABORATORY se guarda user_id null y origin LABORATORY.
   * @param {Object} data - { product, manufacturer, country }
   * @returns {Promise<Object>} Plantilla creada (user_id null si LABORATORY)
   */
  async createElementTemplate(data) {
    const user = this.context?.user;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    if (!this.essayElementTemplateRepository) {
      throw new Error('Servicio de plantillas no disponible');
    }
    const profile = user.profile === 'LABORATORY' ? 'LABORATORY' : 'CLIENT';
    const user_id = profile === 'LABORATORY' ? null : user.id;
    const created = await this.essayElementTemplateRepository.create({
      user_id,
      origin: profile,
      product: data.product ?? '',
      manufacturer: data.manufacturer ?? '',
      country: data.country ?? null
    });
    return EssayElementTemplateDTO.fromRepository(created);
  }

  /**
   * Elimina una plantilla si pertenece al usuario/perfil actual.
   * @param {string} id - UUID de la plantilla
   * @returns {Promise<{ deleted: number }>}
   */
  async deleteElementTemplate(id) {
    const user = this.context?.user;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    if (!this.essayElementTemplateRepository) {
      throw new Error('Servicio de plantillas no disponible');
    }
    const profile = user.profile === 'LABORATORY' ? 'LABORATORY' : 'CLIENT';
    const deleted = await this.essayElementTemplateRepository.deleteByIdAndUser(id, user.id, profile);
    return { deleted };
  }
}

module.exports = EssayElementTemplateApplicationService;
