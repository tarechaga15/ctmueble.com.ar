import api from "./axios";
import {
  createPersonDTO,
  createCreatePersonDTO,
  validateCreatePersonDTO,
  toPlainCreatePersonDTO,
} from "../api/dtos";

/**
 * Normaliza lista de contactos/personas de la API (GET).
 * @param {Array<Object>} list
 * @returns {Array<import("../api/dtos").PersonDTO>}
 */
function mapContacts(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => createPersonDTO(item));
}

export const contactsService = {
  /**
   * POST: crear contacto (persona).
   * @param {import("../api/dtos").CreatePersonDTO} payload - { name, dni?, address?, phone?, mail?, ... }
   * @returns {Promise<import("../api/dtos").PersonDTO>}
   */
  create: async (payload) => {
    const dto = createCreatePersonDTO(payload);
    validateCreatePersonDTO(dto);
    const response = await api.post("/contacts/create", toPlainCreatePersonDTO(dto));
    return createPersonDTO(response.data);
  },

  /** GET: lista de contactos (normalizado con PersonDTO) */
  fetch: async () => {
    const response = await api.get("/contacts/fetch");
    const data = response.data;
    return Array.isArray(data) ? mapContacts(data) : [createPersonDTO(data)];
  },
};
