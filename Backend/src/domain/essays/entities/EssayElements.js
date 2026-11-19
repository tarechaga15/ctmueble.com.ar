/**
 * Entidad de dominio que representa los elementos de un ensayo (essays_elements).
 * Producto, fabricante, fecha, país de origen y número de lote.
 */
class EssayElements {
  /**
   * @param {Object} params
   * @param {string} params.product - Producto
   * @param {string} params.manufacturer - Fabricante
   * @param {Date} params.date - Fecha de toma de muestra
   * @param {Object|null} [params.country] - País (id y/o name)
   * @param {string|null} [params.batchNumber] - Número de lote
   */
  constructor({ product, manufacturer, date, country, batchNumber }) {
    this.product = product ?? null;
    this.manufacturer = manufacturer ?? null;
    this.date = date ?? null;
    this.country = country ?? null;
    this.batchNumber = batchNumber ?? null;
  }
}

module.exports = EssayElements;
