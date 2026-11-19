import api from "./axios";
import {
  createClientDTO,
  createCreateClientDTO,
  validateCreateClientDTO,
  toPlainCreateClientDTO,
  createUpdateClientDTO,
  validateUpdateClientDTO,
  toPlainUpdateClientDTO,
} from "../api/dtos";

/**
 * Normaliza lista de clientes de la API (GET).
 * @param {Array<Object>} list
 * @returns {Array<import("../api/dtos").ClientDTO>}
 */
function mapClients(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => createClientDTO(item));
}

export const clientsService = {
  /** GET: lista de clientes (normalizado con ClientDTO) */
  fetch: async () => {
    const response = await api.get("/clients/fetch");
    const data = response.data;
    return Array.isArray(data) ? mapClients(data) : [createClientDTO(data)];
  },

  /**
   * GET: cliente por id.
   * @param {string} id
   * @returns {Promise<import("../api/dtos").ClientDTO>}
   */
  get: async (id) => {
    const response = await api.get(`/clients/get?id=${id}`);
    return createClientDTO(response.data);
  },

  /**
   * POST: crear cliente.
   * @param {import("../api/dtos").CreateClientDTO} payload - { cuit, address, representative, contact? }
   * @returns {Promise<import("../api/dtos").ClientDTO>}
   */
  create: async (payload) => {
    const dto = createCreateClientDTO(payload);
    validateCreateClientDTO(dto);
    const response = await api.post("/clients/create", toPlainCreateClientDTO(dto));
    return createClientDTO(response.data);
  },

  /**
   * PUT: actualizar cliente.
   * @param {string} id - ID del cliente
   * @param {import("../api/dtos").UpdateClientDTO} payload - { address?, representative?, contact? }
   * @returns {Promise<Object>}
   */
  update: async (id, payload) => {
    const dto = createUpdateClientDTO(payload);
    validateUpdateClientDTO(dto);
    const response = await api.put(
      `/clients/update?id=${id}`,
      toPlainUpdateClientDTO(dto)
    );
    return response.data;
  },

  /** GET: clientes agendados del usuario (solo LABORATORY) */
  getScheduled: async () => {
    const response = await api.get("/clients/scheduled");
    const data = response.data;
    return Array.isArray(data) ? mapClients(data) : [];
  },

  /** POST: agendar un cliente (solo LABORATORY). Body: { clientId } o datos del cliente */
  addScheduled: async (payload) => {
    const body = typeof payload === "object" ? payload : { clientId: payload };
    const response = await api.post("/clients/scheduled", body);
    return response.data;
  },

  /** GET: comprobar si un cliente está agendado. Query: clientId o cuit */
  isScheduled: async (param) => {
    let query = "";
    if (typeof param === "object" && param !== null) {
      const q = new URLSearchParams();
      if (param.clientId) q.append("clientId", param.clientId);
      if (param.cuit) q.append("cuit", param.cuit);
      query = `?${q.toString()}`;
    } else if (param) {
      query = `?clientId=${encodeURIComponent(param)}`;
    }
    const response = await api.get(`/clients/scheduled/check${query}`);
    return response.data?.scheduled === true || response.data?.scheduled?.scheduled === true;
  },

  /** GET: contactos/solicitantes vinculados a un cliente */
  getContacts: async (clientId) => {
    const response = await api.get(`/clients/${encodeURIComponent(clientId)}/contacts`);
    return Array.isArray(response.data) ? response.data : [];
  },

  /** POST: vincular un contacto a un cliente */
  addContact: async (clientId, contact) => {
    const response = await api.post(`/clients/${encodeURIComponent(clientId)}/contacts`, { contact });
    return response.data;
  },

  /** DELETE: desvincular un contacto de un cliente */
  removeContact: async (clientId, contactId) => {
    const response = await api.delete(`/clients/${encodeURIComponent(clientId)}/contacts?contactId=${encodeURIComponent(contactId)}`);
    return response.data;
  },

  /**
   * DELETE: eliminar cliente (de la agenda). Solo el titular del cliente puede eliminarlo.
   * @param {string} id - ID del cliente a eliminar
   */
  delete: async (id) => {
    await api.delete(`/clients/delete?id=${encodeURIComponent(id)}`);
  },

  /**
   * GET: buscar clientes por nombre o CUIT.
   * Utiliza /clients/search en el backend.
   * @param {string} search - Texto de búsqueda
   * @returns {Promise<Array<import("../api/dtos").ClientDTO>>}
   */
  search: async (search) => {
    const params = new URLSearchParams();
    if (search) {
      params.append("search", search);
    }
    const query = params.toString();
    const url = query ? `/clients/search?${query}` : "/clients/search";
    const response = await api.get(url);
    const data = response.data;
    return Array.isArray(data) ? mapClients(data) : [];
  },
};
