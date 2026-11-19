/**
 * DTO (Data Transfer Object) para plantillas de elementos a ensayar (essay_element_templates).
 * Respuesta: id, product, manufacturer, country, origin; user_id solo para CLIENT (null para LABORATORY).
 */
class EssayElementTemplateDTO {
  /**
   * @param {Object} params
   * @param {string} params.id - UUID de la plantilla
   * @param {string} params.product - Producto
   * @param {string} params.manufacturer - Fabricante
   * @param {Object|string} [params.country] - País (objeto con id, name, country_code o código)
   * @param {string} params.origin - Origen: 'CLIENT' | 'LABORATORY'
   * @param {string|null} [params.user_id] - ID del usuario (null si origin es LABORATORY)
   */
  constructor({ id, product, manufacturer, country, origin, user_id }) {
    this.id = id;
    this.product = product ?? '';
    this.manufacturer = manufacturer ?? '';
    this.country = country ?? null;
    this.origin = origin;
    this.user_id = user_id ?? null;
  }

  /**
   * Convierte el DTO a un objeto plano (p. ej. para JSON).
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      product: this.product,
      manufacturer: this.manufacturer,
      country: this.country,
      origin: this.origin,
      user_id: this.user_id
    };
  }

  /**
   * Crea un DTO desde el resultado del repositorio (plain o modelo).
   * @param {Object} raw - { id, product, manufacturer, country, origin, user_id? }
   * @returns {EssayElementTemplateDTO}
   */
  static fromRepository(raw) {
    if (!raw) return null;
    return new EssayElementTemplateDTO({
      id: raw.id,
      product: raw.product,
      manufacturer: raw.manufacturer,
      country: raw.country ?? raw.countryData ?? null,
      origin: raw.origin,
      user_id: raw.user_id ?? null
    });
  }
}

module.exports = EssayElementTemplateDTO;
