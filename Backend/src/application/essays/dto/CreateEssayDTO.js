/**
 * DTO (Data Transfer Object) para crear un nuevo ensayo.
 * Se utiliza para validar y transferir datos de creación de ensayos a través de POST.
 */
class CreateEssayDTO {
  /**
   * Constructor del DTO de creación de ensayo.
   * @param {Object} params - Parámetros del ensayo a crear
   * @param {string} [params.client] - ID del cliente (opcional si isSelf es true)
   * @param {string} [params.contact] - ID del contacto (opcional, se asigna automáticamente según perfil)
   * @param {string} [params.contactId] - ID del contacto alternativo
   * @param {boolean} [params.isSelf] - Indica si el solicitante es el propio usuario/particular
   * @param {string} params.essay - ID del tipo de ensayo
   * @param {string} [params.observations] - Observaciones del ensayo
   * @param {Object} params.elements - Elementos del ensayo (referencia a plantilla + date y batch_number)
   * @param {string} params.elements.templateId - ID de la plantilla de elemento (o elements.id)
   * @param {string} params.elements.date - Fecha de los elementos (formato: yyyy-MM-dd)
   * @param {string} [params.elements.batch_number] - Número de lote
   * @param {Object} params.billing - Información de facturación
   */
  constructor({
    client,
    contact,
    contactId,
    isSelf,
    essay,
    observations,
    elements,
    billing,
    client_notifications_enabled,
    clientNotificationsEnabled
  }) {
    this.client = client || null;
    this.contact = contact || null;
    this.contactId = contactId || null;
    this.isSelf = isSelf === true || isSelf === 'true';
    this.essay = essay;
    this.observations = observations;
    this.elements = elements;
    this.billing = billing || {};
    this.client_notifications_enabled =
      client_notifications_enabled !== undefined
        ? Boolean(client_notifications_enabled)
        : clientNotificationsEnabled !== undefined
        ? Boolean(clientNotificationsEnabled)
        : true;
  }

  /**
   * Valida que los campos requeridos estén presentes.
   * @throws {Error} Si faltan campos requeridos
   */
  validate() {
    if (!this.client && !this.isSelf) {
      throw new Error('El cliente es requerido');
    }
    if (!this.essay) {
      throw new Error('El tipo de ensayo es requerido');
    }
    if (!this.elements || typeof this.elements !== 'object') {
      throw new Error('Los elementos del ensayo son requeridos');
    }
    const templateId = this.elements.template ?? this.elements.id ?? this.elements.templateId;
    if (!templateId) {
      throw new Error('El ID de la plantilla de elemento es requerido (elements.templateId o elements.id)');
    }
    if (!this.elements.date) {
      throw new Error('La fecha de elementos es requerida (elements.date)');
    }
  }

  /**
   * Convierte el DTO a un objeto plano.
   * @returns {Object} Objeto plano con los datos del DTO
   */
  toPlainObject() {
    return {
      client: this.client,
      contact: this.contact,
      contactId: this.contactId,
      isSelf: this.isSelf,
      essay: this.essay,
      observations: this.observations,
      elements: this.elements,
      billing: this.billing,
      client_notifications_enabled: this.client_notifications_enabled
    };
  }
}

module.exports = CreateEssayDTO;

