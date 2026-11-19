/**
 * DTO para crear una plantilla de elemento a ensayar (essay_element_templates).
 * Se usa en POST /element-templates; origin y user_id se asignan según el perfil del usuario.
 */
class CreateEssayElementTemplateDTO {
  /**
   * @param {Object} params
   * @param {string} [params.product] - Producto
   * @param {string} [params.manufacturer] - Fabricante
   * @param {string} [params.country] - Código de país (p. ej. 'AR')
   */
  constructor({ product, manufacturer, country } = {}) {
    this.product = product ?? '';
    this.manufacturer = manufacturer ?? '';
    this.country = country ?? null;
  }

  /**
   * Valida campos mínimos.
   * @throws {Error} Si faltan datos requeridos
   */
  validate() {
    if (this.product == null || String(this.product).trim() === '') {
      throw new Error('El producto es requerido');
    }
    if (this.manufacturer == null || String(this.manufacturer).trim() === '') {
      throw new Error('El fabricante es requerido');
    }
  }

  /**
   * Convierte el DTO a un objeto plano para el servicio.
   * @returns {Object} { product, manufacturer, country }
   */
  toPlainObject() {
    return {
      product: this.product,
      manufacturer: this.manufacturer,
      country: this.country
    };
  }
}

module.exports = CreateEssayElementTemplateDTO;
