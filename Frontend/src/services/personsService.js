import api from "./axios";
import {
  createPersonDTO,
  createUpdatePersonDTO,
  validateUpdatePersonDTO,
  toPlainUpdatePersonDTO,
} from "../api/dtos/persons";

/**
 * Normaliza phone para el backend: si es objeto { country_code, phone } se envía como countryCode + phone.
 * @param {Object} data
 * @returns {Object}
 */
function normalizeUpdateData(data) {
  const out = { ...data };
  if (out.phone != null && typeof out.phone === "object" && !Array.isArray(out.phone)) {
    out.countryCode = out.phone.country_code ?? out.countryCode;
    out.phone = out.phone.phone ?? out.phone;
  }
  return out;
}

export const personsService = {
  /** GET: mi perfil de persona (asociado al usuario logueado) */
  getMyProfile: async () => {
    const response = await api.get("/persons/me");
    return response.data;
  },

  /** GET: personas vinculadas a un cliente */
  getByClient: async (clientId) => {
    const response = await api.get(`/persons/by-client/${encodeURIComponent(clientId)}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  /** POST: crear persona */
  create: async (data) => {
    const normalized = normalizeUpdateData(data);
    const response = await api.post("/persons/create/", normalized);
    return response.data;
  },

  /** POST: vincular persona a cliente */
  linkToClient: async (personId, clientId) => {
    const response = await api.post("/persons/link/", { personId, clientId });
    return response.data;
  },

  /** POST: desvincular persona de cliente */
  unlinkFromClient: async (personId, clientId) => {
    const response = await api.post("/persons/unlink/", { personId, clientId });
    return response.data;
  },

  /** GET: buscar personas disponibles para vincular */
  searchAvailable: async (search) => {
    const response = await api.get(`/persons/search-available/?search=${encodeURIComponent(search || "")}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * GET: persona por id.
   * @param {string} id
   * @returns {Promise<import("../api/dtos/persons").PersonDTO>}
   */
  get: async (id) => {
    const response = await api.get(`/persons/get/?id=${encodeURIComponent(id)}`);
    const raw = response.data;
    if (raw?.phone != null && typeof raw.phone === "object") {
      return createPersonDTO({ ...raw, phone: raw.phone?.phone, countryCode: raw.phone?.country_code ?? raw.countryCode });
    }
    return createPersonDTO(raw);
  },

  /**
   * PUT: actualizar persona.
   * @param {string} personId
   * @param {Object} data - Campos a actualizar (name, dni, phone, mail, etc.). phone puede ser string o { country_code, phone }
   */
  update: async (personId, data) => {
    const normalized = normalizeUpdateData(data);
    const dto = createUpdatePersonDTO(normalized);
    validateUpdatePersonDTO(dto);
    const response = await api.put("/persons/update/", {
      id: personId,
      data: toPlainUpdatePersonDTO(dto),
    });
    return response.data;
  },
};
