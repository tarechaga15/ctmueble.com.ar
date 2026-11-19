import api from "./axios";

/**
 * Servicio para órdenes de trabajo y muestras.
 * Endpoints: /samples/* (antes /work-orders)
 */
export const samplesService = {
  /** GET: lista todas las órdenes de trabajo (solo LABORATORY) */
  fetchWorkOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.code) {
      params.append("code", filters.code);
    }
    if (filters.status) {
      params.append("status", filters.status);
    }
    const query = params.toString();
    const url = query ? `/samples/fetch?${query}` : "/samples/fetch";
    const response = await api.get(url);
    return Array.isArray(response.data) ? response.data : [];
  },

  /** GET: orden de trabajo por ID */
  getWorkOrder: async (id) => {
    const response = await api.get(`/samples/get?id=${id}`);
    return response.data;
  },

  /** POST: recepción unificada de muestras (emite orden y registra, o cancela ensayo) */
  receiveSamples: async (payload) => {
    const response = await api.post("/samples/receive-samples", payload);
    return response.data;
  },

  /** POST: cerrar orden y emitir informe */
  closeAndEmitReport: async (workOrderId) => {
    const response = await api.post(`/samples/${workOrderId}/close-and-emit-report`);
    return response.data;
  },

  /** GET: historial de auditoría de la orden de trabajo */
  getWorkOrderAuditLogs: async (workOrderId) => {
    const response = await api.get(`/samples/${workOrderId}/audit-logs`);
    return Array.isArray(response.data) ? response.data : [];
  },
};
