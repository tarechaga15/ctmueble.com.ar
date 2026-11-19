import api from "./axios";
import {
  createEssayDTO,
  createCreateEssayDTO,
  validateCreateEssayDTO,
  toPlainCreateEssayDTO,
  createSampleDTO,
  createLoadSamplesDTO,
  validateLoadSamplesDTO,
  normalizeLoadSampleResultsDTO,
  validateLoadSampleResultsDTO,
  createSetTermsDTO,
  validateSetTermsDTO,
  toPlainSetTermsDTO,
} from "../api/dtos";

/**
 * Normaliza lista de ensayos de la API (GET).
 * @param {Array<Object>} list
 * @returns {Array<import("../api/dtos").EssayDTO>}
 */
function mapEssays(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => createEssayDTO(item));
}

/**
 * Normaliza lista de muestras de la API (GET).
 * @param {Array<Object>} list
 * @returns {Array<import("../api/dtos/samples").SampleDTO>}
 */
function mapSamples(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => createSampleDTO(item));
}

export const essaysService = {
  /**
   * GET: descarga exportación CSV o XLSX (solicitudes, OT según permisos, clientes en XLSX en hoja aparte).
   * @param {'csv'|'xlsx'} format
   * @param {{ code?: string, status?: string }} [filters]
   */
  downloadExport: async (format, filters = {}) => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (filters.code) params.set("code", filters.code);
    if (filters.status) params.set("status", filters.status);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    try {
      const response = await api.get(`/essays/export?${params.toString()}`, {
        responseType: "blob",
      });
      const disposition = response.headers["content-disposition"] || response.headers["Content-Disposition"];
      let filename = `solicitudes-ensayo.${format === "xlsx" ? "xlsx" : "csv"}`;
      if (disposition) {
        const m = /filename="?([^";\n]+)"?/i.exec(disposition);
        if (m) filename = m[1].trim();
      }
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const data = err.response?.data;
      if (data instanceof Blob) {
        const text = await data.text();
        try {
          const j = JSON.parse(text);
          const msg = j.error || j.message || text;
          throw new Error(typeof msg === "string" ? msg : text);
        } catch (parseErr) {
          if (parseErr instanceof SyntaxError) {
            throw new Error(text || err.message || "Error al exportar");
          }
          throw parseErr;
        }
      }
      throw err;
    }
  },

  /**
   * GET: cantidad de ensayos que coinciden con filtros de exportación (preview).
   * @param {{ code?: string, status?: string, dateFrom?: string, dateTo?: string }} [filters]
   * @returns {Promise<number>}
   */
  fetchExportCount: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.code) params.append("code", filters.code);
    if (filters.status) params.append("status", filters.status);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    const q = params.toString();
    const response = await api.get(q ? `/essays/export/count?${q}` : "/essays/export/count");
    const n = response.data?.count;
    return typeof n === "number" ? n : 0;
  },

  /** GET: lista de ensayos (normalizado con EssayDTO) */
  fetch: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.code) {
      params.append("code", filters.code);
    }
    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.dateFrom) {
      params.append("dateFrom", filters.dateFrom);
    }
    if (filters.dateTo) {
      params.append("dateTo", filters.dateTo);
    }
    const query = params.toString();
    const url = query ? `/essays/fetch?${query}` : "/essays/fetch";
    const response = await api.get(url);
    const data = response.data;
    return Array.isArray(data) ? mapEssays(data) : [createEssayDTO(data)];
  },

  /** GET: ensayo por id (normalizado con EssayDTO) */
  getById: async (id) => {
    const response = await api.get(`/essays/get?id=${id}`);
    return createEssayDTO(response.data);
  },

  /** GET: tipos de ensayo (sin DTO específico) */
  getTypes: async () => {
    const response = await api.get("/types/essays");
    return response.data;
  },

  /**
   * POST: crear ensayo.
   * @param {import("../api/dtos").CreateEssayDTO} payload - Datos del ensayo (client, essay, elements, contact?, observations?, billing?)
   * @returns {Promise<import("../api/dtos").EssayDTO>}
   */
  create: async (payload) => {
    const dto = createCreateEssayDTO(payload);
    validateCreateEssayDTO(dto);
    const response = await api.post("/essays/create", toPlainCreateEssayDTO(dto));
    return createEssayDTO(response.data);
  },

  /**
   * POST: cargar muestras en un ensayo.
   * @param {string} essayId - ID del ensayo
   * @param {import("../api/dtos/samples").LoadSamplesDTO} payload - { dimensions?, samples: LoadSampleDTO[] }
   * @returns {Promise<Object>}
   */
  loadSamples: async (essayId, payload) => {
    const dto = createLoadSamplesDTO(payload);
    validateLoadSamplesDTO(dto);
    const body = {
      dimensions: dto.dimensions,
      samples: dto.samples.map((s) => ({
        correlative: s.correlative,
        countersample: s.countersample ?? false,
        accepted: s.accepted ?? false,
        internal_conditioning: s.internal_conditioning ?? false,
        observations: s.observations,
      })),
    };
    const response = await api.post(`/essays/samples/load?id=${essayId}`, body);
    return response.data;
  },

  /**
   * GET: muestras de un ensayo (normalizado con SampleDTO).
   * @param {string} essayId
   * @returns {Promise<Array<import("../api/dtos/samples").SampleDTO>>}
   */
  getSamples: async (essayId) => {
    const response = await api.get(`/essays/samples/get?id=${essayId}`);
    const data = response.data;
    return Array.isArray(data) ? mapSamples(data) : [createSampleDTO(data)];
  },

  /**
   * POST: cargar resultado(s) de muestra(s) para una orden de trabajo.
   * @param {string} workOrderId - ID de la orden de trabajo
   * @param {Array<{id: string, result: number|null}>|{id: string, result: number|null}|{samples: Array<{id: string, result: number|null}>}} payload
   * @returns {Promise<Object>}
   */
  loadSampleResult: async (workOrderId, payload) => {
    const { samples } = normalizeLoadSampleResultsDTO(payload);
    validateLoadSampleResultsDTO({ samples });
    const body = {
      workOrderId,
      samples,
    };
    const response = await api.post("/essays/samples/load-result", body);
    return response.data;
  },

  /**
   * POST: establecer términos del ensayo (procedure/set-terms).
   * @param {string} essayId - ID del ensayo
   * @param {import("../api/dtos/samples").SetTermsDTO} payload - { days_to_do, price, samples_conservation_days }
   * @returns {Promise<Object>}
   */
  setTerms: async (essayId, payload) => {
    const dto = createSetTermsDTO(payload);
    validateSetTermsDTO(dto);
    const response = await api.post(
      `/essays/procedure/set-terms?id=${essayId}`,
      toPlainSetTermsDTO(dto)
    );
    return response.data;
  },

  /**
   * POST: acción de procedimiento (ACCEPT, REJECT, CANCEL).
   * @param {string} essayId - ID del ensayo
   * @param {'ACCEPT'|'REJECT'|'CANCEL'} action
   * @param {string} [observations] - Observaciones/motivo (para REJECT y CANCEL; se añaden al ensayo)
   * @returns {Promise<import("../api/dtos").EssayDTO>}
   */
  procedureAction: async (essayId, action, observations) => {
    const body = { action };
    if ((action === "REJECT" || action === "CANCEL") && observations != null) {
      body.observations = observations;
    }
    const response = await api.post(`/essays/procedure/actions?id=${essayId}`, body);
    return createEssayDTO(response.data);
  },

  /**
   * POST: establecer términos y generar contrato.
   * @param {string} essayId - ID del ensayo
   * @param {{ days_to_do: number, price: number, samples_conservation_days: number }} payload
   * @returns {Promise<Object>} Documento del contrato
   */
  generateContract: async (essayId, payload) => {
    const dto = createSetTermsDTO(payload);
    validateSetTermsDTO(dto);
    const body = { id: essayId, ...toPlainSetTermsDTO(dto) };
    const response = await api.post("/essays/generate-contract", body);
    return response.data;
  },

  /**
   * POST: emitir informe de ensayo.
   * @param {string} essayId - ID del ensayo
   * @returns {Promise<Object>} Documento del informe generado
   */
  emitReport: async (essayId) => {
    const response = await api.post("/essays/emit-report", { id: essayId });
    return response.data;
  },

  /**
   * PUT: actualizar snapshot del solicitante (essay_client) del ensayo.
   * @param {string} essayId - ID del ensayo
   * @param {Object} clientPayload - Datos del cliente (misma forma que essay.client: cuit, name, representative, address, contact, billing)
   * @returns {Promise<import("../api/dtos").EssayDTO>}
   */
  updateEssayClient: async (essayId, clientPayload) => {
    const response = await api.put(`/essays/${essayId}/client`, clientPayload);
    return createEssayDTO(response.data);
  },

  /**
   * POST: re-emitir manualmente la solicitud F-PC13-01 con modificación y generar snapshot OTS.
   * @param {string} essayId - ID del ensayo
   * @param {string} [reason] - Motivo opcional de la re-emisión
   */
  reissueRequest: async (essayId, reason = null) => {
    const response = await api.post(`/essays/${essayId}/reissue-request`, { reason });
    return response.data;
  },

  /** GET: plantillas de elementos a ensayar (para el usuario actual) */
  getElementTemplates: async () => {
    const response = await api.get("/essays/element-templates");
    return Array.isArray(response.data) ? response.data : [];
  },

  /** POST: crear plantilla de elemento (product, manufacturer, country) */
  createElementTemplate: async (payload) => {
    const response = await api.post("/essays/element-templates", payload);
    return response.data;
  },

  /** DELETE: eliminar plantilla de elemento */
  deleteElementTemplate: async (id) => {
    const response = await api.delete(`/essays/element-templates/${id}`);
    return response.data;
  },

  /**
   * PUT: activar o desactivar notificaciones por correo para un ensayo.
   * @param {string} essayId - ID del ensayo
   * @param {boolean} enabled - Estado deseado
   * @returns {Promise<import("../api/dtos").EssayDTO>}
   */
  updateNotifications: async (essayId, enabled) => {
    const response = await api.put(`/essays/${essayId}/notifications`, { enabled: Boolean(enabled) });
    return createEssayDTO(response.data);
  },

  /**
   * POST: darse de baja de notificaciones mediante token único.
   * @param {string} essayId - ID del ensayo
   * @param {string} token - Token de desuscripción
   * @returns {Promise<Object>}
   */
  unsubscribe: async (essayId, token) => {
    const response = await api.post(`/essays/${essayId}/unsubscribe`, { token });
    return response.data;
  },

  /** GET: lista de snapshots de auditoría con hash firmado y OTS */
  getSnapshots: async (essayId) => {
    const response = await api.get(`/essays/${essayId}/snapshots`);
    return Array.isArray(response.data) ? response.data : [];
  },

  /** GET: verificar en tiempo real integridad DB y certificación OTS de una snapshot */
  verifySnapshot: async (snapshotId) => {
    const response = await api.get(`/essays/snapshots/${snapshotId}/verify`);
    return response.data;
  },

  /** GET: descargar archivo binario de comprobante OpenTimestamps (.ots) */
  downloadOtsProof: async (snapshotId, filename = "comprobante_ots.ots") => {
    const response = await api.get(`/essays/snapshots/${snapshotId}/ots-proof`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
